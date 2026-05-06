import { execFileSync } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { dataStatusSchema, publicPlacesSchema } from "./utils/schema.js";

type Check = {
  name: string;
  ok: boolean;
  detail: string;
  required?: boolean;
};

const checks: Check[] = [];

function addCheck(name: string, ok: boolean, detail: string, required = true) {
  checks.push({ name, ok, detail, required });
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readText(path: string) {
  return readFile(path, "utf8");
}

async function readJson(path: string) {
  return JSON.parse(await readText(path)) as unknown;
}

function runGit(args: string[]) {
  try {
    return execFileSync("git", ["-c", `safe.directory=${resolve(process.cwd())}`, ...args], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return undefined;
  }
}

function checkIgnored(path: string) {
  const ignored = runGit(["check-ignore", path]);
  return Boolean(ignored);
}

function maskPresence(value: string | undefined) {
  return value?.trim() ? "present" : "missing";
}

async function main() {
  const repoPath = resolve(process.cwd());
  const branch = runGit(["branch", "--show-current"]) ?? "unknown";
  const commit = runGit(["rev-parse", "--short", "HEAD"]) ?? "unknown";
  const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE || "@space_tamnik";
  const maxVideos = process.env.MAX_VIDEOS || "100";
  const geocodeProvider = process.env.GEOCODE_PROVIDER || "nominatim";

  addCheck("Node.js", true, process.version, false);
  addCheck("repo path", true, repoPath, false);
  addCheck("git branch", branch !== "unknown", branch);
  addCheck("git commit", commit !== "unknown", commit);
  addCheck("package-lock.json", await exists("package-lock.json"), "lockfile present");
  addCheck("node_modules", await exists("node_modules"), "install directory present", false);
  addCheck(
    "YOUTUBE_API_KEY",
    true,
    maskPresence(process.env.YOUTUBE_API_KEY),
    false,
  );
  addCheck("YOUTUBE_CHANNEL_HANDLE", true, channelHandle, false);
  addCheck("MAX_VIDEOS", Number.isFinite(Number(maxVideos)), maxVideos);
  addCheck("GEOCODE_PROVIDER", true, geocodeProvider, false);

  let placesLength = 0;
  let dataGenerated = false;

  try {
    const places = publicPlacesSchema.parse(await readJson("public/data/places.json"));
    placesLength = places.length;
    addCheck("public/data/places.json", true, `${places.length} public places`);
  } catch (error) {
    addCheck(
      "public/data/places.json",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  try {
    const status = dataStatusSchema.parse(
      await readJson("public/data/data_status.json"),
    );
    dataGenerated = status.dataGenerated;
    addCheck(
      "public/data/data_status.json",
      true,
      `dataGenerated=${status.dataGenerated}, published=${status.published}`,
    );
  } catch (error) {
    addCheck(
      "public/data/data_status.json",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  addCheck(
    "git ignores data/raw",
    checkIgnored("data/raw/probe.json"),
    "data/raw/probe.json",
  );
  addCheck(
    "git ignores data/cache",
    checkIgnored("data/cache/probe.json"),
    "data/cache/probe.json",
  );

  try {
    const viteConfig = await readText("vite.config.ts");
    addCheck(
      "Vite base path",
      viteConfig.includes('base: "/my-yt-japan-restaurant/"'),
      "/my-yt-japan-restaurant/",
    );
  } catch (error) {
    addCheck(
      "Vite base path",
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  const requiredScripts = [
    "scripts/ingest-youtube.ts",
    "scripts/extract-place-candidates.ts",
    "scripts/geocode-place-candidates.ts",
    "scripts/build-public-places.ts",
    "scripts/validate-data.ts",
  ];
  for (const script of requiredScripts) {
    const stats = (await exists(script)) ? await stat(script) : undefined;
    addCheck(`script exists: ${script}`, Boolean(stats?.isFile()), script);
  }

  addCheck(
    "no manual public data when dataGenerated=false",
    dataGenerated || placesLength === 0,
    dataGenerated ? "dataGenerated=true" : `places=${placesLength}`,
  );

  console.log("data:doctor readiness report");
  console.log(`repo: ${repoPath}`);
  console.log(`branch: ${branch}`);
  console.log(`commit: ${commit}`);
  console.log(`YOUTUBE_API_KEY: ${maskPresence(process.env.YOUTUBE_API_KEY)}`);
  console.log(`YOUTUBE_CHANNEL_HANDLE: ${channelHandle}`);
  console.log(`MAX_VIDEOS: ${maxVideos}`);
  console.log(`GEOCODE_PROVIDER: ${geocodeProvider}`);
  console.log("");

  for (const check of checks) {
    const marker = check.ok ? "PASS" : check.required === false ? "WARN" : "FAIL";
    console.log(`[${marker}] ${check.name}: ${check.detail}`);
  }

  const failures = checks.filter((check) => !check.ok && check.required !== false);
  if (failures.length > 0) {
    console.error("");
    console.error(`data:doctor failed with ${failures.length} required issue(s).`);
    process.exit(1);
  }

  console.log("");
  console.log("data:doctor passed. No network calls were made.");
}

await main();
