import { VideoState } from "@prisma/client";
import { IVideoRepository } from "../../repositories/IVideoRepository";
import { IVideoService } from "../IVideoService";
import { deleteVideoFileById } from "../videoFileService";
import { NotFoundError } from "../../errors/NotFoundError";
import { IVideoFileService } from "../IVideoFileService";

export class VideoService implements IVideoService {
    constructor(private videoRepository: IVideoRepository, private videoFileService: IVideoFileService) { }

    async getAllVideos() {
        return await this.videoRepository.findAllVideos();
    }

    async getAllVisibleVideos() {
        return await this.videoRepository.findAllVisibleVideos();
    }

    async getVideoById(id: number) {
        let video = await this.videoRepository.findVideoByID(id);
        if (video == null) throw new NotFoundError(404, "Video not found");
        return video;
    }

    async deleteVideoByID(id: number) {
        let video = await this.videoRepository.findVideoByID(id);
        if (video == null) throw new NotFoundError(404, "Video not found");
        if (video?.videoFileId) {
            await deleteVideoFileById(video?.videoFileId);
        }
        let deleted = await this.videoRepository.deleteVideoByID(id);
        return deleted;
    }


    async createVideo(title: string, description: string, fileName: string) {
        const createdVideo = await this.videoRepository.createVideo(title, description, VideoState.UPLOADING);
        const videoId = createdVideo.id;
        const blobName = videoId + "_" + fileName;
        console.log('bkobName:', blobName);
        const sasUrl = await this.videoFileService.getSasUrl(blobName);
        return { video: createdVideo, sasUrl: sasUrl }
    }

    async updateVideo({ id, title, description, videoState }: { id: number; title?: string; description?: string; videoState?: VideoState }) {
        return await this.videoRepository.updateVideo(id, title, description, videoState);
    }
}
