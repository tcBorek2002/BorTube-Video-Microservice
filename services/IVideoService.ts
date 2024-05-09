import { Video, VideoState } from "@prisma/client";
import { VideoDto } from "../dtos/VideoDto";

export interface IVideoService {
    getAllVideos(): Promise<VideoDto[]>;
    getAllVisibleVideos(): Promise<VideoDto[]>;
    getVideoById(id: string): Promise<VideoDto>;
    deleteVideoByID(id: string): Promise<VideoDto>;
    createVideo(userId: string, title: string, description: string, fileName: string): Promise<{ video: Video, sasUrl: string }>;
    updateVideo({ id, title, description, videoState }: { id: string; title?: string; description?: string; videoState?: VideoState }): Promise<Video>;
}