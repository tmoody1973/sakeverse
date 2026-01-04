/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as checkData from "../checkData.js";
import type * as clearData from "../clearData.js";
import type * as dashboard from "../dashboard.js";
import type * as embeddings from "../embeddings.js";
import type * as foodPairing from "../foodPairing.js";
import type * as geminiRAG from "../geminiRAG.js";
import type * as importTippsy from "../importTippsy.js";
import type * as perplexityAPI from "../perplexityAPI.js";
import type * as sake from "../sake.js";
import type * as sakeBreweries from "../sakeBreweries.js";
import type * as userLibrary from "../userLibrary.js";
import type * as users from "../users.js";
import type * as wineToSake from "../wineToSake.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  checkData: typeof checkData;
  clearData: typeof clearData;
  dashboard: typeof dashboard;
  embeddings: typeof embeddings;
  foodPairing: typeof foodPairing;
  geminiRAG: typeof geminiRAG;
  importTippsy: typeof importTippsy;
  perplexityAPI: typeof perplexityAPI;
  sake: typeof sake;
  sakeBreweries: typeof sakeBreweries;
  userLibrary: typeof userLibrary;
  users: typeof users;
  wineToSake: typeof wineToSake;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
