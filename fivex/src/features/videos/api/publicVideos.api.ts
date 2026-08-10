import apiClient from "../../../api/client";
import type { PublicVideo } from "../types/videoStudio.types";

export interface PublicVideoCategory {
  id: string;
  name: string;
  slug: string;
  videos: PublicVideo[];
}

export interface PublicVideosResponse {
  featured: PublicVideo[];
  categories: PublicVideoCategory[];
}

export interface PublicVideosParams {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const publicVideosApi = {
  /**
   * Get the public videos landing page data.
   *
   * Returns:
   * - Featured videos
   * - Videos grouped by category
   */
  async getVideos(
    params?: PublicVideosParams,
  ): Promise<PublicVideosResponse> {
    const response = await apiClient.get<PublicVideosResponse>("/videos", {
      params,
    });

    return response.data;
  },

  /**
   * Get a single public video by ID.
   */
  async getVideoById(id: string): Promise<PublicVideo> {
    const response = await apiClient.get<PublicVideo>(`/videos/${id}`);

    return response.data;
  },

  /**
   * Get videos belonging to a specific category.
   */
  async getVideosByCategory(
    category: string,
    params?: Omit<PublicVideosParams, "category">,
  ): Promise<PublicVideo[]> {
    const response = await apiClient.get<PublicVideo[]>(
      `/videos/category/${category}`,
      {
        params,
      },
    );

    return response.data;
  },
};

export default publicVideosApi;