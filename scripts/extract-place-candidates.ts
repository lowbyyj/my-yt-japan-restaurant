import { extractGoogleMapsQuery, extractGoogleMapsUrls } from "./utils/googleMapsUrl.js";
import { readJsonFile, writeJsonFile } from "./utils/files.js";
import {
  findJapanSignals,
  findNegativeSignals,
  findPositiveSignals,
  parseOwnerComment,
} from "./utils/parseOwnerComment.js";
import { placeCandidatesSchema, type PlaceCandidate } from "./utils/schema.js";
import type { IngestedVideo } from "./utils/youtube.js";

type IngestOutput = {
  dataGenerated: boolean;
  reason?: string;
  generatedAt: string | null;
  channelHandle: string;
  videosScanned: number;
  likelyShorts: number;
  ownerCommentCandidates: number;
  videos: IngestedVideo[];
};

const INPUT_PATH = "data/generated/youtube_owner_comment_candidates.json";
const OUTPUT_PATH = "data/generated/place_candidates.json";

function stableCandidateId(videoId: string, commentId: string) {
  const safeComment = commentId.replace(/[^a-z0-9_-]/giu, "_").slice(0, 48);
  return `yt_${videoId}_${safeComment}`;
}

function confidenceFromSignals(score: number, boost: number, hasName: boolean) {
  const normalizedScore = Math.min(0.38, score / 240);
  const nameBoost = hasName ? 0.1 : 0;
  return Math.max(0, Math.min(0.98, 0.32 + normalizedScore + boost + nameBoost));
}

function shouldPreferGoogleMapsQuery(
  nameCandidate: string | undefined,
  googleMapsQuery: string | undefined,
) {
  if (!googleMapsQuery) return false;
  if (!nameCandidate) return true;
  if (nameCandidate.length > 24 && googleMapsQuery.length <= 80) return true;
  return /https?:\/\/|google|maps\.app/iu.test(nameCandidate);
}

function verdictForCandidate(args: {
  negativeSignalHits: string[];
  japanSignalHits: string[];
  hasLocationSignal: boolean;
  confidence: number;
}) {
  if (args.negativeSignalHits.length > 0) return "excluded_negative_signal" as const;
  if (args.japanSignalHits.length === 0 || !args.hasLocationSignal || args.confidence < 0.45) {
    return "needs_geocode" as const;
  }
  return "auto_recommended" as const;
}

async function main() {
  const input = await readJsonFile<IngestOutput>(INPUT_PATH, {
    dataGenerated: false,
    reason: "YOUTUBE_API_KEY not provided",
    generatedAt: null,
    channelHandle: process.env.YOUTUBE_CHANNEL_HANDLE || "@space_tamnik",
    videosScanned: 0,
    likelyShorts: 0,
    ownerCommentCandidates: 0,
    videos: [],
  });

  const generatedAt = new Date().toISOString();
  const candidates: PlaceCandidate[] = [];

  for (const video of input.videos) {
    const ownerComment = video.ownerLocationCommentCandidate;
    if (!ownerComment) continue;

    const actualMapsUrl = extractGoogleMapsUrls(ownerComment.text)[0];
    const parsed = parseOwnerComment(ownerComment.text, video.title);
    const combinedText = [video.title, video.description, ownerComment.text].join("\n");
    const negativeSignalHits = Array.from(new Set(findNegativeSignals(combinedText)));
    const positiveSignalHits = Array.from(new Set(findPositiveSignals(combinedText)));
    const japanSignalHits = Array.from(
      new Set([...findJapanSignals(combinedText), ...parsed.japanSignalHits]),
    );
    const hasLocationSignal = Boolean(
      actualMapsUrl || parsed.addressCandidate || parsed.city || japanSignalHits.length > 0,
    );
    const confidence = confidenceFromSignals(
      ownerComment.candidateScore,
      parsed.confidenceBoost,
      Boolean(parsed.nameKoOrOriginal),
    );
    const verdict = verdictForCandidate({
      negativeSignalHits,
      japanSignalHits,
      hasLocationSignal,
      confidence,
    });

    const googleMapsQuery = actualMapsUrl
      ? extractGoogleMapsQuery(actualMapsUrl)
      : parsed.googleMapsQuery;
    const parsedName =
      parsed.nameKoOrOriginal || googleMapsQuery || video.title.replace(/#\S+/gu, "");
    const nameKoOrOriginal = shouldPreferGoogleMapsQuery(parsedName, googleMapsQuery)
      ? googleMapsQuery!
      : parsedName;

    candidates.push({
      id: stableCandidateId(video.videoId, ownerComment.commentId),
      videoId: video.videoId,
      videoTitle: video.title,
      videoDescription: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      sourceCommentId: ownerComment.commentId,
      sourceCommentText: ownerComment.text,
      candidateScore: ownerComment.candidateScore,
      sourceKind: "owner_location_comment_candidate",
      nameKoOrOriginal,
      nameLocal: parsed.nameLocal,
      addressCandidate: parsed.addressCandidate,
      city: parsed.city,
      country: japanSignalHits.length > 0 ? "JP" : undefined,
      googleMapsUrl: actualMapsUrl ?? parsed.googleMapsUrl,
      googleMapsQuery,
      categoryTags: parsed.categoryTags,
      commentKoAuto: parsed.commentKoAuto,
      verdict,
      confidence,
      negativeSignalHits,
      positiveSignalHits,
      japanSignalHits,
      generatedAt,
    });
  }

  const validated = placeCandidatesSchema.parse(candidates);
  await writeJsonFile(OUTPUT_PATH, validated);
  console.log(
    JSON.stringify(
      {
        dataGenerated: input.dataGenerated,
        ownerCommentCandidates: input.ownerCommentCandidates,
        extractedPlaceCandidates: validated.length,
        japanCandidates: validated.filter((candidate) => candidate.country === "JP").length,
        excludedNegativeSignal: validated.filter(
          (candidate) => candidate.verdict === "excluded_negative_signal",
        ).length,
      },
      null,
      2,
    ),
  );
}

await main();
