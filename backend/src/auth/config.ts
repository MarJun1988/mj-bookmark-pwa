import { GraphQLError } from "graphql";

export function isLocalAuthEnabled(): boolean {
  return process.env.LOCAL_AUTH_ENABLED !== "false";
}

export function isOidcAutoCreateEnabled(): boolean {
  return process.env.OIDC_AUTO_CREATE_USERS !== "false";
}

export function requireLocalAuthEnabled(): void {
  if (!isLocalAuthEnabled()) {
    throw new GraphQLError("Local authentication is disabled", {
      extensions: { code: "AUTH_LOCAL_DISABLED" },
    });
  }
}
