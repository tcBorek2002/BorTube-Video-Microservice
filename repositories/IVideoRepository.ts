import { Video, VideoState } from "@prisma/client";

export interface IVideoRepository {
    findAllVideos(): Promise<Video[]>;
    findAllVisibleVideos(): Promise<Video[]>;
    findVideoByID(id: number): Promise<Video | null>;
    deleteVideoByID(id: number): Promise<Video>;
    createVideo(title: string, description: string, videoState: VideoState): Promise<Video>;
    updateVideo(id: number, title?: string, description?: string, videoState?: VideoState): Promise<Video>;
}