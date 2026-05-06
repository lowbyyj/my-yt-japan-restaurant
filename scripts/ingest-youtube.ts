import { ensureDir, writeJsonFile } from "./utils/files.js";
import {
  listOwnerCommentCandidates,
  listUploadVideoIds,
  listVideoDetails,
  resolveChannel,
  type IngestedVideo,
} from "./utils/youtube.js";

const GENERATED_DIR = "data/generated";
const PUBLIC_DATA_DIR = "public/data";
const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE || "@space_tamnik";
const MAX_VIDEOS = Number(process.env.MAX_VIDEOS || 100);

type IngestOutput = {
  dataGenerated: boolean;
  reason?: string;
  generatedAt: string | null;
  channelHandle: string;
  channelId?: string;
  channelTitle?: string;
  videosScanned: number;
  likelyShorts: number;
  ownerCommentCandidates: number;
  videos: IngestedVideo[];
};

async function writeMissingKeyOutputs() {
  const status = {
    dataGenerated: false,
    reason: "YOUTUBE_API_KEY not provided",
    generatedAt: null,
    channelHandle: CHANNEL_HANDLE,
    videosScanned: 0,
    likelyShorts: 0,
    ownerCommentCandidates: 0,
    japanCandidates: 0,
    geocoded: 0,
    published: 0,
    excludedNegativeSignal: 0,
    needsGeocode: 0,
    heldBack: 0,
  };
  const output: IngestOutput = {
    dataGenerated: false,
    reason: status.reason,
    generatedAt: null,
    channelHandle: CHANNEL_HANDLE,
    videosScanned: 0,
    likelyShorts: 0,
    ownerCommentCandidates: 0,
    videos: [],
  };
  await writeJsonFile(`${GENERATED_DIR}/youtube_owner_comment_candidates.json`, output);
  await writeJsonFile(`${PUBLIC_DATA_DIR}/places.json`, []);
  await writeJsonFile(`${PUBLIC_DATA_DIR}/data_status.json`, status);
  console.log(JSON.stringify(status, null, 2));
}

async function main() {
  await ensureDir(GENERATED_DIR);
  await ensureDir(PUBLIC_DATA_DIR);

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    await writeMissingKeyOutputs();
    return;
  }

  const generatedAt = new Date().toISOString();
  const channel = await resolveChannel(apiKey, CHANNEL_HANDLE);
  const videoIds = await listUploadVideoIds(apiKey, channel.uploadsPlaylistId, MAX_VIDEOS);
  const videos = await listVideoDetails(apiKey, videoIds);
  const likelyShorts = videos.filter((video) => video.isLikelyShort);
  const ingestedVideos: IngestedVideo[] = [];

  for (const video of likelyShorts) {
    try {
      const ownerComments = await listOwnerCommentCandidates(
        apiKey,
        video.videoId,
        channel.channelId,
      );
      ingestedVideos.push({
        ...video,
        ownerComments,
        ownerLocationCommentCandidate: ownerComments[0],
      });
    } catch (error) {
      ingestedVideos.push({
        ...video,
        ownerComments: [],
        commentFetchError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const output: IngestOutput = {
    dataGenerated: true,
    generatedAt,
    channelHandle: CHANNEL_HANDLE,
    channelId: channel.channelId,
    channelTitle: channel.channelTitle,
    videosScanned: videos.length,
    likelyShorts: likelyShorts.length,
    ownerCommentCandidates: ingestedVideos.reduce(
      (sum, video) => sum + video.ownerComments.length,
      0,
    ),
    videos: ingestedVideos,
  };

  await writeJsonFile(`${GENERATED_DIR}/youtube_owner_comment_candidates.json`, output);
  console.log(
    JSON.stringify(
      {
        generatedAt,
        channelHandle: CHANNEL_HANDLE,
        videosScanned: output.videosScanned,
        likelyShorts: output.likelyShorts,
        ownerCommentCandidates: output.ownerCommentCandidates,
      },
      null,
      2,
    ),
  );
}

await main();
