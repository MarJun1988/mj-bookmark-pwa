import type { Group, Role } from "../../generated/prisma/client.js";

export type GroupCreatedPayload = {
  groupCreated: {
    group: Group;
    userId: string;
    requireRole: Role;
  };
};

export type GroupUpdatedPayload = {
  groupUpdated: {
    group: Group;
    userId: string;
    requireRole: Role;
  };
};

export type GroupDeletedPayload = {
  groupDeleted: {
    group: Group;
    userId: string;
    requireRole: Role;
  };
};
