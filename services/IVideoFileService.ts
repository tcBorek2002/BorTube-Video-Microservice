import { VideoFile } from "@prisma/client";

export interface IVideoFileService {
    getSasUrl(blobName: string): Promise<string>;
    deleteVideoFileById(videoFileId: number): Promise<VideoFile>;
    createVideoFile(blobName: string, duration: number, videoId: number): Promise<VideoFile>;
}