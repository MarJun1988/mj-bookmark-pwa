import type { Role, Version } from "../../generated/prisma/client.js";

export type versionCreatedPayload = {
  versionCreated: {
    version: Version;
    versionId: string;
    requireRole: Role;
  };
};

export type versionUpdatedPayload = {
  versionUpdated: {
    version: Version;
    versionId: string;
    requireRole: Role;
  };
};

export type versionDeletedPayload = {
  versionDeleted: {
    version: Version;
    totalCount: number;
    versionId: string;
    requireRole: Role;
  };
};
