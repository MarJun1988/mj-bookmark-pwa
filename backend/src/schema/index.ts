import { sharedModule } from "./shared/index.js";
import { authModule } from "./auth/index.js";
import { groupModule } from "./group/index.js";
import { itemModule } from "./item/index.js";
import { tabModule } from "./tab/index.js";
import { userModule } from "./user/index.js";
import { versionModule } from "./version/index.js";
import { tagModule } from "./tag/index.js";

export const modules = [
  sharedModule,
  authModule,
  groupModule,
  itemModule,
  tagModule,
  tabModule,
  userModule,
  versionModule,
];
