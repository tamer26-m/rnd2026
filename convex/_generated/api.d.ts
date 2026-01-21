/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as adminManagement from "../adminManagement.js";
import type * as adminSettings from "../adminSettings.js";
import type * as admins from "../admins.js";
import type * as auth from "../auth.js";
import type * as databaseManagement from "../databaseManagement.js";
import type * as demoData from "../demoData.js";
import type * as gallery from "../gallery.js";
import type * as http from "../http.js";
import type * as memberCV from "../memberCV.js";
import type * as memberCards from "../memberCards.js";
import type * as memberDocuments from "../memberDocuments.js";
import type * as memberExport from "../memberExport.js";
import type * as memberManagement from "../memberManagement.js";
import type * as memberPoliticalActivities from "../memberPoliticalActivities.js";
import type * as memberStats from "../memberStats.js";
import type * as members from "../members.js";
import type * as nationalBureau from "../nationalBureau.js";
import type * as notifications from "../notifications.js";
import type * as otp from "../otp.js";
import type * as router from "../router.js";
import type * as subscriptionReceipts from "../subscriptionReceipts.js";
import type * as subscriptions from "../subscriptions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  adminManagement: typeof adminManagement;
  adminSettings: typeof adminSettings;
  admins: typeof admins;
  auth: typeof auth;
  databaseManagement: typeof databaseManagement;
  demoData: typeof demoData;
  gallery: typeof gallery;
  http: typeof http;
  memberCV: typeof memberCV;
  memberCards: typeof memberCards;
  memberDocuments: typeof memberDocuments;
  memberExport: typeof memberExport;
  memberManagement: typeof memberManagement;
  memberPoliticalActivities: typeof memberPoliticalActivities;
  memberStats: typeof memberStats;
  members: typeof members;
  nationalBureau: typeof nationalBureau;
  notifications: typeof notifications;
  otp: typeof otp;
  router: typeof router;
  subscriptionReceipts: typeof subscriptionReceipts;
  subscriptions: typeof subscriptions;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
