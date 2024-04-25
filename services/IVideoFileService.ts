import { VideoFile } from "@prisma/client";

export interface IVideoFileService {
    getSasUrl(blobName: string): Promise<string>;
    deleteVideoFileById(videoFileId: number): Promise<VideoFile>;
}