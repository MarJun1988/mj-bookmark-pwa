import type { Role, User } from "../../generated/prisma/client.js";
import { GraphQLError } from "graphql";

export type UserCreatedPayload = {
  userCreated: {
    user: User;
    userId: string;
    requireRole: Role;
  };
};

export type UserUpdatedPayload = {
  userUpdated: {
    user: User;
    userId: string;
    requireRole: Role;
  };
};

export type UserDeletedPayload = {
  userDeleted: {
    user: User;
    totalCount: number;
    userId: string;
    requireRole: Role;
  };
};

export const passwordError = () =>
  new GraphQLError("Password change failed", {
    extensions: { code: "BAD_USER_INPUT" },
  });
