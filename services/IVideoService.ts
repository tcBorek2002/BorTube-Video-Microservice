import { Video, VideoState } from "@prisma/client";

export interface IVideoService {
    getAllVideos(): Promise<Video[]>;
    getAllVisibleVideos(): Promise<Video[]>;
    getVideoById(id: number): Promise<Video>;
    deleteVideoByID(id: number): Promise<Video>;
    createVideo(title: string, description: string): Promise<Video>;
    updateVideo({ id, title, description, videoState }: { id: number; title?: string; description?: string; videoState?: VideoState }): Promise<Video>;
}