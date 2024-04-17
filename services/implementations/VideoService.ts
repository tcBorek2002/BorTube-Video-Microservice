import { VideoState } from "@prisma/client";
import { IVideoRepository } from "../../repositories/IVideoRepository";
import { IVideoService } from "../IVideoService";
import { deleteVideoFileById } from "../videoFileService";

export class VideoService implements IVideoService {
    constructor(private videoRepository: IVideoRepository) { }

    async getAllVideos() {
        return await this.videoRepository.findAllVideos();
    }

    async getAllVisibleVideos() {
        return await this.videoRepository.findAllVisibleVideos();
    }

    async getVideoById(id: number) {
        return await this.videoRepository.findVideoByID(id);
    }

    async deleteVideoByID(id: number) {
        try {
            let video = await this.videoRepository.findVideoByID(id);
            if (video?.videoFileId) {
                await deleteVideoFileById(video?.videoFileId);
            }
            let deleted = await this.videoRepository.deleteVideoByID(id);
            if (deleted) return true;
            return false;
        }
        catch (error) {
            return false;
        }
    }

    async createVideo(title: string, description: string) {
        return await this.videoRepository.createVideo(title, description, VideoState.UPLOADING);
    }

    async updateVideo({ id, title, description, videoState }: { id: number; title?: string; description?: string; videoState?: VideoState }) {
        return await this.videoRepository.updateVideo(id, title, description, videoState);
    }
}
