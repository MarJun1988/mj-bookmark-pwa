import type { Tag } from "../../generated/prisma/client.js";

export type TagCreatedPayload = {
  tagCreated: {
    item: Tag;
    userId: string;
  };
};

export type TagUpdatedPayload = {
  tagUpdated: {
    item: Tag;
    userId: string;
  };
};

export type TagDeletedPayload = {
  tagDeleted: {
    item: Tag;
    userId: string;
  };
};
