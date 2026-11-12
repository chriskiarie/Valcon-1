import { aircraft } from "./aircraft";
import { homePage } from "./homePage";
import { pagesContent } from "./pagesContent";
import { service } from "./service";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [siteSettings, homePage, pagesContent, aircraft, service];

/** Documents that exist exactly once. Editors edit them; they cannot create or delete them. */
export const singletonTypes = ["siteSettings", "homePage", "pagesContent"];
