import { prisma } from "../lib/prisma.js";
import { PubSub, type PubSubEngine } from "graphql-subscriptions";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { ItemType } from "../generated/prisma/enums.js";
import type { User } from "../generated/prisma/client.js";

export type JwtPayload = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

// Ein einzelner Filter (ein Feld)
export interface FilterMetaInput {
  value?: string | number | null;
  matchMode?: string;
}

// Alle Filter in PrimeVue
export interface DataTableFilters {
  global?: FilterMetaInput;

  [field: string]: FilterMetaInput | undefined;
}

// Paginierung / Sortierung / Filter der DataTable
export interface DataTablePageInput {
  first?: number;
  rows?: number;
  sortField?: string;
  sortOrder?: number;
  multiSortMeta?: any;
  filters?: DataTableFilters;
}

export type PrismaWhere = Record<string, any>;

export type AuthUser = Omit<User, "password" | "refreshTokens">;

export type Context = {
  prisma: typeof prisma;
  pubsub: PubSubEngine;
  user: AuthUser | null;
  req?: ExpressRequest;
  res?: ExpressResponse;
  ip?: string;
};

export interface CreateItemInput {
  type: ItemType;
  title?: string;
  order: number;
  url?: string;
  groupId?: string;
  config?: JSON;
  tagIds: string[];
}

export interface UpdateItemInput {
  title?: string;
  order?: number;
  url?: string;
  config?: JSON;
  tagIds?: string[];
}

export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

type FieldType = "string" | "enum" | "number" | "date" | "in";

type FieldConfig = {
  type: FieldType;
  enumMap?: Record<string, string | number>;
  path?: string[]; // 👈 NEU (für group.title etc.)
};

export type PrismaFieldConfig = Record<string, FieldConfig>;

export interface GraphQLContext {
  user?: {
    id: string;
    role: string;
  };
  ip?: string;
  pubsub: PubSub;
}
