import { scoreOwnerLocationComment } from "./parseOwnerComment.js";

const YOUTUBE_API_ROOT = "https://www.googleapis.com/youtube/v3";

export type YoutubeVideo = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  durationSeconds: number;
  isLikelyShort: boolean;
  videoUrl: string;
  thumbnailUrl: string;
};

export type OwnerCommentCandidate = {
  commentId: string;
  text: string;
  publishedAt?: string;
  updatedAt?: string;
  likeCount?: number;
  order: "relevance" | "time";
  rank: number;
  candidateScore: number;
};

export type IngestedVideo = YoutubeVideo & {
  ownerComments: OwnerCommentCandidate[];
  ownerLocationCommentCandidate?: OwnerCommentCandidate;
  commentFetchError?: string;
};

type YoutubeListResponse<T> = {
  items?: T[];
  nextPageToken?: string;
  error?: { message?: string };
};

type ChannelItem = {
  id: string;
  snippet?: { title?: string; customUrl?: string };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};

type PlaylistItem = {
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
  snippet?: { title?: string; publishedAt?: string };
};

type VideoItem = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: Record<string, { url: string; width?: number; height?: number }>;
  };
  contentDetails?: { duration?: string };
};

type CommentThreadItem = {
  snippet?: {
    topLevelComment?: {
      id?: string;
      snippet?: {
        authorChannelId?: { value?: string };
        textDisplay?: string;
        textOriginal?: string;
        publishedAt?: string;
        updatedAt?: string;
        likeCount?: number;
      };
    };
  };
};

function youtubeUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${YOUTUBE_API_ROOT}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url;
}

async function youtubeFetch<T>(
  apiKey: string,
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<YoutubeListResponse<T>> {
  const url = youtubeUrl(path, { ...params, key: apiKey });
  const response = await fetch(url);
  const body = (await response.json()) as YoutubeListResponse<T>;
  if (!response.ok) {
    const message = body.error?.message ?? `${response.status} ${response.statusText}`;
    throw new Error(`YouTube API ${path} failed: ${message}`);
  }
  return body;
}

export function parseYoutubeDurationSeconds(duration: string | undefined) {
  if (!duration) return 0;
  const match = duration.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/u,
  );
  if (!match) return 0;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  return days * 86_400 + hours * 3_600 + minutes * 60 + seconds;
}

export function isLikelyShort(title: string, durationSeconds: number) {
  const folded = title.toLowerCase();
  return durationSeconds <= 90 || folded.includes("#shorts") || folded.includes("shorts");
}

function bestThumbnail(
  thumbnails: Record<string, { url: string; width?: number; height?: number }> | undefined,
) {
  const candidates = Object.values(thumbnails ?? {});
  candidates.sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0));
  return candidates[0]?.url ?? "https://i.ytimg.com/vi/unknown/hqdefault.jpg";
}

export async function resolveChannel(apiKey: string, channelHandle: string) {
  const handles = Array.from(
    new Set([channelHandle, channelHandle.replace(/^@/u, "")].filter(Boolean)),
  );

  for (const handle of handles) {
    const response = await youtubeFetch<ChannelItem>(apiKey, "channels", {
      part: "snippet,contentDetails",
      forHandle: handle,
      maxResults: 1,
    });
    const item = response.items?.[0];
    const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;
    if (item?.id && uploadsPlaylistId) {
      return {
        channelId: item.id,
        channelTitle: item.snippet?.title ?? channelHandle,
        uploadsPlaylistId,
      };
    }
  }

  throw new Error(`Could not resolve YouTube channel handle ${channelHandle}`);
}

export async function listUploadVideoIds(
  apiKey: string,
  uploadsPlaylistId: string,
  maxVideos: number,
) {
  const ids: string[] = [];
  let pageToken: string | undefined;

  while (ids.length < maxVideos) {
    const response = await youtubeFetch<PlaylistItem>(apiKey, "playlistItems", {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: Math.min(50, maxVideos - ids.length),
      pageToken,
    });
    for (const item of response.items ?? []) {
      const id = item.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = response.nextPageToken;
    if (!pageToken) break;
  }

  return ids;
}

export async function listVideoDetails(apiKey: string, videoIds: string[]) {
  const videos: YoutubeVideo[] = [];
  for (let index = 0; index < videoIds.length; index += 50) {
    const chunk = videoIds.slice(index, index + 50);
    const response = await youtubeFetch<VideoItem>(apiKey, "videos", {
      part: "snippet,contentDetails",
      id: chunk.join(","),
      maxResults: 50,
    });

    for (const item of response.items ?? []) {
      const title = item.snippet?.title ?? item.id;
      const durationSeconds = parseYoutubeDurationSeconds(item.contentDetails?.duration);
      videos.push({
        videoId: item.id,
        title,
        description: item.snippet?.description ?? "",
        publishedAt: item.snippet?.publishedAt ?? "",
        durationSeconds,
        isLikelyShort: isLikelyShort(title, durationSeconds),
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnailUrl: bestThumbnail(item.snippet?.thumbnails),
      });
    }
  }
  return videos;
}

async function listTopLevelCommentsByOrder(
  apiKey: string,
  videoId: string,
  order: "relevance" | "time",
  channelId: string,
): Promise<OwnerCommentCandidate[]> {
  const response = await youtubeFetch<CommentThreadItem>(apiKey, "commentThreads", {
    part: "snippet",
    videoId,
    order,
    textFormat: "plainText",
    maxResults: 50,
  });

  return (response.items ?? [])
    .map((item, rank): OwnerCommentCandidate | undefined => {
      const comment = item.snippet?.topLevelComment;
      const snippet = comment?.snippet;
      if (snippet?.authorChannelId?.value !== channelId) return undefined;
      const text = snippet.textOriginal ?? snippet.textDisplay ?? "";
      if (!comment?.id || !text.trim()) return undefined;
      const candidate: OwnerCommentCandidate = {
        commentId: comment.id,
        text,
        order,
        rank,
        candidateScore: scoreOwnerLocationComment(text, rank),
      };
      if (snippet.publishedAt) candidate.publishedAt = snippet.publishedAt;
      if (snippet.updatedAt) candidate.updatedAt = snippet.updatedAt;
      if (typeof snippet.likeCount === "number") candidate.likeCount = snippet.likeCount;
      return candidate;
    })
    .filter((item): item is OwnerCommentCandidate => Boolean(item));
}

export async function listOwnerCommentCandidates(
  apiKey: string,
  videoId: string,
  channelId: string,
) {
  const seen = new Set<string>();
  const comments: OwnerCommentCandidate[] = [];
  for (const order of ["relevance", "time"] as const) {
    const batch = await listTopLevelCommentsByOrder(apiKey, videoId, order, channelId);
    for (const comment of batch) {
      if (seen.has(comment.commentId)) continue;
      seen.add(comment.commentId);
      comments.push(comment);
    }
    if (order === "relevance" && batch.some((comment) => comment.candidateScore >= 40)) {
      break;
    }
  }

  comments.sort((a, b) => b.candidateScore - a.candidateScore);
  return comments;
}
