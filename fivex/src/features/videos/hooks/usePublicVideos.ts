import { useQuery } from "@tanstack/react-query";
import type {
  PublicVideosParams,
  PublicVideosResponse,
} from "../api/publicVideos.api";
import type { PublicVideo } from "../types/publicVideo.types";

const mockVideos: PublicVideo[] = [
  {
    id: "1",
    title: "The Story Behind the Numbers",
    thumbnailUrl: "/src/assets/images/time-to-move.jpg",
    category: "Investigations",
    categorySlug: "investigations",
    slug: "the-story-behind-the-numbers",
  },
  {
    id: "2",
    title: "What the Evidence Actually Shows",
    thumbnailUrl: "/src/assets/images/speak-up.jpg",
    category: "Fact Checks",
    categorySlug: "fact-checks",
    slug: "what-the-evidence-actually-shows",
  },
  {
    id: "3",
    title: "Inside a Changing Community",
    thumbnailUrl: "/src/assets/images/same-blood.png",
    category: "Local",
    categorySlug: "local",
    slug: "inside-a-changing-community",
  },
  {
    id: "4",
    title: "The Facts Behind the Claim",
    thumbnailUrl: "/src/assets/images/power.png",
    category: "Fact Checks",
    categorySlug: "fact-checks",
    slug: "the-facts-behind-the-claim",
  },
  {
    id: "5",
    title: "What Happens When Systems Fail",
    thumbnailUrl: "/src/assets/images/lost.png",
    category: "Investigations",
    categorySlug: "investigations",
    slug: "what-happens-when-systems-fail",
  },
  {
    id: "6",
    title: "The People Behind the Story",
    thumbnailUrl: "/src/assets/images/sophie.png",
    category: "Culture",
    categorySlug: "culture",
    slug: "the-people-behind-the-story",
  },
  {
    id: "7",
    title: "Understanding the Bigger Picture",
    thumbnailUrl: "/src/assets/images/caitlin-clark.png",
    category: "Explainers",
    categorySlug: "explainers",
    slug: "understanding-the-bigger-picture",
  },
  {
    id: "8",
    title: "A Closer Look at What Changed",
    thumbnailUrl: "/src/assets/images/time-to-move.jpg",
    category: "Local",
    categorySlug: "local",
    slug: "a-closer-look-at-what-changed",
  },
  {
    id: "9",
    title: "Separating Fact From Fiction",
    thumbnailUrl: "/src/assets/images/speak-up.jpg",
    category: "Explainers",
    categorySlug: "explainers",
    slug: "separating-fact-from-fiction",
  },
  {
    id: "10",
    title: "Following the Evidence",
    thumbnailUrl: "/src/assets/images/power.png",
    category: "Investigations",
    categorySlug: "investigations",
    slug: "following-the-evidence",
  },
];

const featuredIds = new Set(["1", "2"]);

const mockResponse: PublicVideosResponse = {
  featured: mockVideos.filter((video) => featuredIds.has(video.id)),
  categories: Array.from(
    new Map(
      mockVideos.map((video) => [
        video.categorySlug,
        {
          id: video.categorySlug,
          name: video.category,
          slug: video.categorySlug,
          videos: mockVideos.filter(
            (item) => item.categorySlug === video.categorySlug,
          ),
        },
      ]),
    ).values(),
  ),
};

export const publicVideosQueryKeys = {
  all: ["public-videos"] as const,

  lists: () => [...publicVideosQueryKeys.all, "list"] as const,

  list: (params?: PublicVideosParams) =>
    [...publicVideosQueryKeys.lists(), params] as const,
};

export function usePublicVideos(params?: PublicVideosParams) {
  return useQuery<PublicVideosResponse>({
    queryKey: publicVideosQueryKeys.list(params),
    queryFn: async () => {
      // Temporary mock data.
      // Replace this with publicVideosApi.getVideos(params)
      // when the backend endpoint is ready.
      return mockResponse;
    },
  });
}

export default usePublicVideos;