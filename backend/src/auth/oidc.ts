import type { Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import * as oidc from "openid-client";
import { prisma } from "../lib/prisma.js";
import { signRefreshToken } from "./tokens.js";
import { isLocalAuthEnabled, isOidcAutoCreateEnabled } from "./config.js";

const COOKIE_MAX_AGE = 10 * 60 * 1000;
const COOKIE_PREFIX = "bookmark_oidc_";

type OidcSettings = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  buttonLabel: string;
};

let configurationPromise: Promise<oidc.Configuration> | undefined;

function getSettings(): OidcSettings | null {
  const issuer = process.env.OIDC_ISSUER?.trim();
  const clientId = process.env.OIDC_CLIENT_ID?.trim();
  const clientSecret = process.env.OIDC_CLIENT_SECRET?.trim();
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  const redirectUri =
    process.env.OIDC_REDIRECT_URI?.trim() || (appUrl ? `${appUrl}/api/auth/oidc/callback` : "");

  if (!issuer || !clientId || !clientSecret || !redirectUri) return null;

  return {
    issuer,
    clientId,
    clientSecret,
    redirectUri,
    scope: process.env.OIDC_SCOPE?.trim() || "openid profile email",
    buttonLabel: process.env.OIDC_BUTTON_LABEL?.trim() || "Mit Authentik anmelden",
  };
}

function getConfiguration(settings: OidcSettings) {
  configurationPromise ??= oidc.discovery(
    new URL(settings.issuer),
    settings.clientId,
    settings.clientSecret,
  );
  return configurationPromise;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };
}

function clearFlowCookies(res: Response) {
  for (const name of ["state", "nonce", "verifier", "return_to", "silent"]) {
    res.clearCookie(`${COOKIE_PREFIX}${name}`, { path: "/" });
  }
}

function safeReturnTo(value: unknown): string {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/api/")
  ) {
    return value;
  }
  return "/dashboard";
}

function callbackUrl(req: Request, redirectUri: string): URL {
  const url = new URL(redirectUri);
  const incoming = new URL(req.originalUrl, "http://localhost");
  url.search = incoming.search;
  return url;
}

function oidcErrorRedirect(res: Response, code: string) {
  clearFlowCookies(res);
  res.redirect(`/login?oidc_error=${encodeURIComponent(code)}`);
}

function claimString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const oidcRouter = Router();

oidcRouter.get("/config", (_req, res) => {
  const settings = getSettings();
  res.json({
    enabled: Boolean(settings),
    label: settings?.buttonLabel ?? "Mit OpenID Connect anmelden",
    localAuthEnabled: isLocalAuthEnabled(),
    autoCreateUsers: isOidcAutoCreateEnabled(),
  });
});

oidcRouter.get("/login", async (req, res) => {
  const settings = getSettings();
  if (!settings) {
    res.status(404).json({ error: "OIDC login is not configured" });
    return;
  }

  try {
    const configuration = await getConfiguration(settings);
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const verifier = oidc.randomPKCECodeVerifier();
    const challenge = await oidc.calculatePKCECodeChallenge(verifier);
    const options = cookieOptions();
    const silent = req.query.silent === "true";

    res.cookie(`${COOKIE_PREFIX}state`, state, options);
    res.cookie(`${COOKIE_PREFIX}nonce`, nonce, options);
    res.cookie(`${COOKIE_PREFIX}verifier`, verifier, options);
    res.cookie(`${COOKIE_PREFIX}return_to`, safeReturnTo(req.query.returnTo), options);
    res.cookie(`${COOKIE_PREFIX}silent`, silent ? "true" : "false", options);

    const authorizationParameters: Record<string, string> = {
      redirect_uri: settings.redirectUri,
      scope: settings.scope,
      response_type: "code",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    };
    if (silent) authorizationParameters.prompt = "none";

    const authorizationUrl = oidc.buildAuthorizationUrl(configuration, authorizationParameters);

    res.redirect(authorizationUrl.href);
  } catch (error) {
    console.error("OIDC authorization could not be started", error);
    oidcErrorRedirect(res, "provider_unavailable");
  }
});

oidcRouter.get("/callback", async (req, res) => {
  const settings = getSettings();
  if (!settings) {
    oidcErrorRedirect(res, "not_configured");
    return;
  }

  const state = req.cookies?.[`${COOKIE_PREFIX}state`];
  const nonce = req.cookies?.[`${COOKIE_PREFIX}nonce`];
  const verifier = req.cookies?.[`${COOKIE_PREFIX}verifier`];
  const returnTo = safeReturnTo(req.cookies?.[`${COOKIE_PREFIX}return_to`]);
  const silent = req.cookies?.[`${COOKIE_PREFIX}silent`] === "true";

  if (typeof state !== "string" || typeof nonce !== "string" || typeof verifier !== "string") {
    oidcErrorRedirect(res, "session_expired");
    return;
  }

  if (typeof req.query.error === "string") {
    if (req.query.state !== state) {
      oidcErrorRedirect(res, "session_expired");
      return;
    }

    const noSessionErrors = new Set([
      "login_required",
      "interaction_required",
      "account_selection_required",
      "consent_required",
    ]);
    if (silent && noSessionErrors.has(req.query.error)) {
      clearFlowCookies(res);
      res.redirect(`/login?oidc_silent=none&redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

    oidcErrorRedirect(res, "login_failed");
    return;
  }

  try {
    const configuration = await getConfiguration(settings);
    const tokens = await oidc.authorizationCodeGrant(
      configuration,
      callbackUrl(req, settings.redirectUri),
      {
        expectedState: state,
        expectedNonce: nonce,
        pkceCodeVerifier: verifier,
        idTokenExpected: true,
      },
    );
    const idTokenClaims = tokens.claims();

    if (!idTokenClaims || typeof idTokenClaims.sub !== "string") {
      oidcErrorRedirect(res, "invalid_identity");
      return;
    }

    let claims: Record<string, unknown> = { ...idTokenClaims };
    if (tokens.access_token) {
      try {
        const userInfo = await oidc.fetchUserInfo(
          configuration,
          tokens.access_token,
          idTokenClaims.sub,
        );
        claims = { ...claims, ...userInfo };
      } catch (error) {
        console.warn("OIDC UserInfo request failed; using ID token claims", error);
      }
    }

    const email = claimString(claims.email)?.toLowerCase();
    if (!email) {
      oidcErrorRedirect(res, "email_missing");
      return;
    }

    if (process.env.OIDC_REQUIRE_VERIFIED_EMAIL === "true" && claims.email_verified !== true) {
      oidcErrorRedirect(res, "email_not_verified");
      return;
    }

    const issuer = claimString(claims.iss) || settings.issuer;
    const subject = idTokenClaims.sub;
    const identity = await prisma.oidcIdentity.findUnique({
      where: { issuer_subject: { issuer, subject } },
      include: { user: true },
    });

    let user = identity?.user;
    if (!user) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      const mayLinkByEmail =
        process.env.OIDC_ALLOW_EMAIL_LINK !== "false" && claims.email_verified === true;

      if (existingUser && !mayLinkByEmail) {
        oidcErrorRedirect(res, "account_link_required");
        return;
      }

      if (!existingUser && !isOidcAutoCreateEnabled()) {
        oidcErrorRedirect(res, "user_creation_disabled");
        return;
      }

      const fullName = claimString(claims.name)?.split(/\s+/) ?? [];
      const firstName =
        claimString(claims.given_name) ||
        fullName.at(0) ||
        claimString(claims.preferred_username) ||
        email.split("@")[0] ||
        email;
      const lastName = claimString(claims.family_name) || fullName.slice(1).join(" ") || "";
      const displayName =
        claimString(claims.name) || claimString(claims.preferred_username) || email;

      user = await prisma.$transaction(async (tx) => {
        const linkedUser =
          existingUser ??
          (await tx.user.create({
            data: {
              email,
              password: await bcrypt.hash(crypto.randomBytes(48).toString("hex"), 12),
              passwordLoginEnabled: false,
              firstName,
              lastName,
              displayName,
              emailVerified: true,
              role: (await tx.user.count()) === 0 ? "ADMIN" : "USER",
            },
          }));

        await tx.oidcIdentity.create({
          data: { issuer, subject, userId: linkedUser.id },
        });
        return linkedUser;
      });
    }

    const { token: refreshToken, hash, expiresAt } = signRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash: hash,
        userId: user.id,
        userAgent: req.headers["user-agent"] ?? null,
        ipAddress: req.ip ?? null,
        expiresAt,
      },
    });

    clearFlowCookies(res);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    res.redirect(returnTo);
  } catch (error) {
    console.error("OIDC callback failed", error);
    oidcErrorRedirect(res, "login_failed");
  }
});
