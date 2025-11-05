// utils/universityFinder.js

import openai from "../config/openai.js";
import UniversityFinderPrompt from "./universityFinderPrompt.js";

/**
 * Utility: grab the right system+user prompt pair based on degree
 */
function buildPrompts(degree, userData) {
  const isBachelor = (degree || "").toLowerCase().startsWith("b");
  if (isBachelor) {
    return {
      system: UniversityFinderPrompt.buildBachelorSystemPromptAccurate(),
      user: UniversityFinderPrompt.buildUserBachelorMessageAccurate(userData),
      degreeKind: "bachelors",
    };
  }
  return {
    system: UniversityFinderPrompt.buildMasterSystemPromptAccurate(),
    user: UniversityFinderPrompt.buildUserMasterMessageAccurate(userData),
    degreeKind: "masters",
  };
}

/**
 * Utility: trim code fences / prose and extract a JSON array
 */
function extractJSONArray(text) {
  if (!text) return "";
  let t = text.trim();

  // Remove ```json fences if present
  if (t.startsWith("```")) {
    const first = t.indexOf("\n");
    const lastFence = t.lastIndexOf("```");
    if (first !== -1 && lastFence !== -1) {
      t = t.slice(first + 1, lastFence).trim();
    }
  }

  // Heuristic: slice from first '[' to last ']'
  const firstBracket = t.indexOf("[");
  const lastBracket = t.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    t = t.slice(firstBracket, lastBracket + 1).trim();
  }

  return t;
}

/**
 * Normalize a single item from the LLM to the UI model expected by Questionnaire
 * Masters payload keys:
 *  - University, Program, Length, Tuition, Location, STEM, F-1, Chance
 * Bachelors payload keys:
 *  - University, Major, Length, TuitionPerYear, Location, STEM, F-1, SAT_ACT, English, Chance, Why
 * We normalize to the Masters-like keys the UI already consumes.
 */
function normalizeItem(item, degreeKind, fallbackProgram = "Program") {
  const isBachelors = degreeKind === "bachelors";

  const university = item.University ?? item.university ?? "";
  const programRaw = isBachelors ? (item.Major ?? item.Program ?? fallbackProgram) : (item.Program ?? fallbackProgram);
  const length = item.Length ?? item.length ?? "";
  const location = item.Location ?? item.location ?? "";
  const tuition = isBachelors
    ? (item.TuitionPerYear ?? item.Tuition ?? "")
    : (item.Tuition ?? "");

  // STEM / F-1 normalize to booleans for internal use, but keep original strings for display if needed
  const stemYes = (String(item.STEM ?? "").toLowerCase() === "yes");
  const f1Yes = (String((item["F-1"] ?? item.F1 ?? "")).toLowerCase() === "yes");

  // Chance band
  const chance = (item.Chance ?? "").toString();
  const tier = chance.toLowerCase();

  return {
    university,
    program: programRaw,
    length,
    location,
    tuition,
    stemDesignated: stemYes,
    f1Eligible: f1Yes,
    tier,
    chance, // keep original label too
  };
}

/**
 * Convert list of 20 normalized items into the tier buckets the UI expects.
 * Also injects UI-friendly fields like id, name, probability, description.
 */
function toQuestionnaireBuckets(items, fallbackProgram) {
  const tiers = { ambitious: [], target: [], safe: [], backup: [] };

  items.forEach((n) => {
    if (!n || !n.tier || !tiers[n.tier]) return;

    const probability = Math.round(
      n.tier === "ambitious"
        ? 15 + Math.random() * 10
        : n.tier === "target"
        ? 35 + Math.random() * 15
        : n.tier === "safe"
        ? 60 + Math.random() * 20
        : 80 + Math.random() * 15
    );

    const row = {
      id: `${n.tier}-${tiers[n.tier].length}`,
      name: n.university,
      university: n.university,
      program: n.program || fallbackProgram,
      tier: n.tier,
      length: n.length,
      probability,
      ranking: { national: null },
      location: n.location,
      tuition: n.tuition,
      description: `${n.program || fallbackProgram} program`,
      acceptanceRate: null,
      stemDesignated: n.stemDesignated === true,
      f1Eligible: n.f1Eligible === true,
      accepts3Year: true,
      features: ["Research Opportunities", "Career Services"],
    };

    if (tiers[n.tier].length < 5) {
      tiers[n.tier].push(row);
    }
  });

  const total = Object.values(tiers).reduce((s, arr) => s + arr.length, 0);
  return { ...tiers, total };
}

/**
 * Parse raw model text -> JSON -> normalize -> tier buckets
 */
function parseModelOutput(rawText, degreeKind, fallbackProgram) {
  const jsonCandidate = extractJSONArray(rawText);
  let arr;
  try {
    arr = JSON.parse(jsonCandidate);
  } catch (e) {
    throw new Error("Model output was not valid JSON.");
  }

  if (!Array.isArray(arr)) throw new Error("Model output is not an array.");
  if (arr.length !== 20) throw new Error(`Expected 20 items, received ${arr.length}.`);

  const normalized = arr.map((it) => normalizeItem(it, degreeKind, fallbackProgram));
  return toQuestionnaireBuckets(normalized, fallbackProgram);
}

/**
 * Core caller for OpenAI Responses API
 * - model: "gpt-5" | "gpt-5-mini"
 * - withWeb: boolean — if true, enables web_search tool (gpt-5 only)
 */
async function callModel({ model, withWeb, system, user }) {
  const input = `${system}\n\n${user}`;
  const args = {
    model,
    reasoning: { effort: model === "gpt-5" ? "low" : "minimal" },
    input,
  };
  if (withWeb) {
    args.tools = [{ type: "web_search" }];
  }

  const res = await openai.responses.create(args);
  return res.output_text || "";
}

/**
 * Public API
 * -----------
 * getUniversitiesAccurate: gpt-5 + web search (authoritative)
 * getUniversitiesFast:     gpt-5-mini (cheaper/faster, no web)
 *
 * Both return:
 * {
 *   buckets: { ambitious:[], target:[], safe:[], backup:[], total: 20 },
 *   rawText: "<original model text>",
 *   degree: "masters" | "bachelors"
 * }
 */

/**
 * @param {Object} userData - intake form payload
 * @param {"masters"|"bachelors"} degree - which prompt family to use
 */
export async function getUniversitiesAccurate(userData, degree = "masters") {
  const { system, user, degreeKind } = buildPrompts(degree, userData);
  const rawText = await callModel({
    model: "gpt-5",
    withWeb: true,
    system,
    user,
  });

  const buckets = parseModelOutput(
    rawText,
    degreeKind,
    userData?.program || userData?.intendedMajors || "Program"
  );

  if (buckets.total !== 20) {
    throw new Error(`Accurate mode returned ${buckets.total} items instead of 20.`);
  }

  return { buckets, rawText, degree: degreeKind };
}

/**
 * @param {Object} userData - intake form payload
 * @param {"masters"|"bachelors"} degree - which prompt family to use
 */
export async function getUniversitiesFast(userData, degree = "masters") {
  const { system, user, degreeKind } = buildPrompts(degree, userData);

  // Allow the mini call to proceed without web and without failing the flow
  const rawText = await callModel({
    model: "gpt-5-mini",
    withWeb: false,
    system,
    user,
  });

  // Try to parse; if it fails, surface a clear error to the caller
  const buckets = parseModelOutput(
    rawText,
    degreeKind,
    userData?.program || userData?.intendedMajors || "Program"
  );

  return { buckets, rawText, degree: degreeKind };
}

export default {
  getUniversitiesAccurate,
  getUniversitiesFast,
};

