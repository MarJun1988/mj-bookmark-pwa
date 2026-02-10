import type { MenuItem } from "primevue/menuitem";
import type { ColumnProps } from "primevue";
import type { DocumentNode } from "graphql/language";

export type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: RoleValue;
  tabs?: Tab[];
  refreshTokens?: RefreshToken[];
  createdAt: Date | null;
  updatedAt?: Date | null;
};

export type UserRegister = {
  email: string;
  password: string;
  passwordReplay: string;
  firstName: string;
  lastName: string;
  displayName?: string;
};

export type UserPassword = {
  id: string;
  oldPassword: string;
  newPassword: string;
  newPasswordReplay: string;
};

export type AuthUser = Omit<User, "password" | "refreshTokens">;

export type Version = {
  id: string;
  versionNumber: string;
  description: string;
  createdAt: Date | null;
  updatedAt?: Date | null;
};

export type RefreshToken = {
  id: string;
  tokenHash: string;
  userId: string;
  user: User;
  expiresAt?: Date | null;
  createdAt?: Date;
};

export type Tab = {
  __typename?: "Tab";
  id: string;
  title: string;
  order: number;
  userId: string;
  user: User;
  groups?: Group[];

  createdAt: Date | null;
  updatedAt?: Date | null;
};

export type Group = {
  __typename?: "Group";
  id: string;
  title: string;
  order: number;

  tabId: string;
  tab: Tab;
  items?: Item[];

  createdAt: Date | null;
  updatedAt?: Date | null;
};

export type Item = {
  __typename?: "Item";
  id: string;
  type: ItemTypeValue;
  title: string;
  order: number;

  groupId: string;
  group: Group;

  url?: string;
  favicon?: string;

  config?: JSON;

  // 🔥 Anzeige-Daten
  tags?: Tag[];

  // 🔥 Schreib-/Update-Daten
  tagIds?: string[];

  createdAt: Date | null;
  updatedAt?: Date | null;

  __tabId?: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | null;
  updatedAt?: Date | null;
};

export type ItemTag = {
  itemId: string;
  tagId: string;

  item: Item;
  tag: Tag;

  createdAt: Date;
  updatedAt?: Date | null;
};
export const ItemType = {
  LINK: "LINK",
  WIDGET: "WIDGET",
  NOTE: "NOTE",
} as const;

export type ItemTypeValue = (typeof ItemType)[keyof typeof ItemType];

export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type RoleValue = (typeof Role)[keyof typeof Role];

export type DashboardMode = "view" | "edit";

export type SelectOption = {
  label: string;
  value: string;
};

export type AutoCompleteTagOption = {
  name: string;
  id: string;
};

export interface SearchResult {
  item: Item;
  tab: Tab;
  group: Group;
  label: string;
}

export type MenuContext =
  | { type: "tab"; id: string }
  | { type: "group"; id: string }
  | { type: "item"; id: string };

export interface MyMenuItem extends MenuItem {
  tooltip: string;
}

export interface ToastPayload {
  summary: string;
  detail?: string;
  life?: number;
  group?: string;
}

export interface CustomColumnProps extends ColumnProps {
  defaultShowing?: boolean;
  filterNotShowing?: boolean;
  options?: {
    /** 🔹 Icon im Cell anzeigen */
    icon?: {
      field: string; // z. B. 'favicon'
      size?: "sm" | "md";
      fallback?: "globe" | "letter";
    };

    /** 🔹 Dropdown / Select */
    dropdown?: {
      options: Array<{
        label: string;
        value: string | number;
      }>;
      multiple?: boolean;
    };

    /** 🔹 Filter-spezifisch */
    filter?: {
      key?: "tags" | "groups" | "tabs";
    };
  };
  // 🔥 NEU
  filterKey?: "tags" | "groups" | "tabs";
  withIcon?: boolean;
}

export interface GraphQlVariable {
  skip: number;
  take: number;
}

export interface SubscriptionConfig<T> {
  query: DocumentNode;

  handler: (_msg: T) => void;
}

// Message
export interface SubscriptionDeleteUser {
  user: User[];
  totalCount: number;
}

export type SubscriptionUser = {
  userCreated: User;
  userUpdated: User;
  userDeleted: SubscriptionDeleteUser;
};

export type AnySubscriptionUser =
  | SubscriptionConfig<SubscriptionUser["userCreated"]>
  | SubscriptionConfig<SubscriptionUser["userUpdated"]>
  | SubscriptionConfig<SubscriptionUser["userDeleted"]>;

// Version
export interface SubscriptionDeleteVersion {
  version: Version[];
  totalCount: number;
}

export type SubscriptionMessagesVersions = {
  versionCreated: Version;
  versionUpdated: Version;
  versionDeleted: SubscriptionDeleteVersion;
};

export type AnySubscriptionVersion =
  | SubscriptionConfig<SubscriptionMessagesVersions["versionCreated"]>
  | SubscriptionConfig<SubscriptionMessagesVersions["versionUpdated"]>
  | SubscriptionConfig<SubscriptionMessagesVersions["versionDeleted"]>;

// Tab
export interface SubscriptionDeleteTab {
  tab: Tab[];
  totalCount: number;
}

export type SubscriptionMessagesTabs = {
  tabCreated: Tab;
  tabUpdated: Tab;
  tabDeleted: SubscriptionDeleteTab;
};

export type AnySubscriptionTab =
  | SubscriptionConfig<SubscriptionMessagesTabs["tabCreated"]>
  | SubscriptionConfig<SubscriptionMessagesTabs["tabUpdated"]>
  | SubscriptionConfig<SubscriptionMessagesTabs["tabDeleted"]>;

export interface Skeletonable {
  __skeleton?: boolean;
}

export type TabView =
  | (Tab & { __skeleton?: false })
  | (Skeletonable & {
      __typename?: "Tab";
      id: string;
      title: string;
      order: number;
      groups: GroupView[];
    });

export type GroupView =
  | (Group & { __skeleton?: false })
  | (Skeletonable & {
      __typename?: "Group";
      id: string;
      title: string;
      order: number;
      items: ItemView[];
      tabId: string;
    });

export type ItemView =
  | (Item & { __skeleton?: false })
  | (Skeletonable & {
      __typename?: "Item";
      id: string;
      title: string;
      type: Item["type"];
    });
