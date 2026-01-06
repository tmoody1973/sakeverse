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
import type * as discover from "../discover.js";
import type * as embeddings from "../embeddings.js";
import type * as foodPairing from "../foodPairing.js";
import type * as gamification from "../gamification.js";
import type * as geminiRAG from "../geminiRAG.js";
import type * as importTippsy from "../importTippsy.js";
import type * as learn_courses from "../learn/courses.js";
import type * as learn_generation from "../learn/generation.js";
import type * as learn_progress from "../learn/progress.js";
import type * as learn_quizzes from "../learn/quizzes.js";
import type * as learn_seed from "../learn/seed.js";
import type * as map from "../map.js";
import type * as newsCache from "../newsCache.js";
import type * as pairingTips from "../pairingTips.js";
import type * as perplexityAPI from "../perplexityAPI.js";
import type * as podcastEpisodes from "../podcastEpisodes.js";
import type * as podcastGeneration from "../podcastGeneration.js";
import type * as podcastImport from "../podcastImport.js";
import type * as podcastRAG from "../podcastRAG.js";
import type * as podcastTopics from "../podcastTopics.js";
import type * as recommendations from "../recommendations.js";
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
  discover: typeof discover;
  embeddings: typeof embeddings;
  foodPairing: typeof foodPairing;
  gamification: typeof gamification;
  geminiRAG: typeof geminiRAG;
  importTippsy: typeof importTippsy;
  "learn/courses": typeof learn_courses;
  "learn/generation": typeof learn_generation;
  "learn/progress": typeof learn_progress;
  "learn/quizzes": typeof learn_quizzes;
  "learn/seed": typeof learn_seed;
  map: typeof map;
  newsCache: typeof newsCache;
  pairingTips: typeof pairingTips;
  perplexityAPI: typeof perplexityAPI;
  podcastEpisodes: typeof podcastEpisodes;
  podcastGeneration: typeof podcastGeneration;
  podcastImport: typeof podcastImport;
  podcastRAG: typeof podcastRAG;
  podcastTopics: typeof podcastTopics;
  recommendations: typeof recommendations;
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
