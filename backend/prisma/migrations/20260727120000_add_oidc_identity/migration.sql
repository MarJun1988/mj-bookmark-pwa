CREATE TABLE "oidc_identities" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oidc_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oidc_identities_issuer_subject_key"
    ON "oidc_identities"("issuer", "subject");

CREATE INDEX "oidc_identities_userId_idx"
    ON "oidc_identities"("userId");

ALTER TABLE "oidc_identities"
    ADD CONSTRAINT "oidc_identities_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
