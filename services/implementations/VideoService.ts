import { VideoState } from "@prisma/client";
import { IVideoRepository } from "../../repositories/IVideoRepository";
import { IVideoService } from "../IVideoService";
import { NotFoundError } from "../../errors/NotFoundError";
import { IVideoFileService } from "../IVideoFileService";
import { IUserService } from "../IUserService";
import { VideoDto } from "../../dtos/VideoDto";
import { RedisClientType } from "redis";

export class VideoService implements IVideoService {
    constructor(private videoRepository: IVideoRepository, private videoFileService: IVideoFileService, private userService: IUserService, private redisClient: RedisClientType<any, any, any>) { }

    async getAllVideos() {
        let videos = await this.videoRepository.findAllVideos();
        let userIds = videos.map(v => v.userId);
        let users = await this.userService.getUsersByIds(userIds);
        let videoDtos: VideoDto[] = videos.map(v => {
            let user = users.find(u => u.id == v.userId);
            if (user == null) return null;
            return { ...v, user: user! };
        }).filter(v => v !== null) as VideoDto[]; // remove null values and assert the result as VideoDto[];
        return videoDtos;
    }

    async getAllVisibleVideos() {
        let redisVideos = await this.redisClient.get("visible-videos");
        if (redisVideos) {
            let parsedVideos = JSON.parse(redisVideos) as VideoDto[];
            console.log("Fetched visible videos from cache");
            return parsedVideos;
        }
        else {
            let videos = await this.videoRepository.findAllVisibleVideos();
            let userIds = videos.map(v => v.userId);
            let users = await this.userService.getUsersByIds(userIds);
            let videoDtos: VideoDto[] = videos.map(v => {
                let user = users.find(u => u.id == v.userId);
                if (user == null) return null;
                return { ...v, user: user! };
            }).filter(v => v !== null) as VideoDto[]; // remove null values and assert the result as VideoDto[];
            this.redisClient.set("visible-videos", JSON.stringify(videoDtos), { EX: 60 });
            console.log("Cached the visible videos");
            return videoDtos;
        }
    }

    async getVideoById(id: string) {
        let redisVideo = await this.redisClient.get("video:" + id);
        if (redisVideo) {
            let parsedVideo = JSON.parse(redisVideo) as VideoDto;
            console.log("Fetched video from cache");
            return parsedVideo;
        }

        let video = await this.videoRepository.findVideoByID(id);
        if (video == null) throw new NotFoundError(404, "Video not found");
        let user = await this.userService.getUserById(video.userId);
        if (user == null) throw new NotFoundError(404, "User belonging to video not found");
        let videoDto: VideoDto = { ...video, user: user! };
        this.redisClient.set("video:" + id, JSON.stringify(videoDto), { EX: 120 });
        console.log("Cached the video");
        return videoDto;
    }

    async deleteVideoByID(id: string) {
        let video = await this.videoRepository.findVideoByID(id);
        if (video == null) throw new NotFoundError(404, "Video not found");
        let user = await this.userService.getUserById(video.userId).catch(e => { throw e });

        if (video?.videoFileId) {
            this.videoFileService.deleteVideoFileById(video?.videoFileId);
        }
        let deleted = await this.videoRepository.deleteVideoByID(id);
        return { ...deleted, user: user! } as VideoDto;
    }

    async deleteVideoBydIdBoolean(id: string): Promise<boolean> {
        let video = await this.videoRepository.findVideoByID(id);
        if (video == null) throw new NotFoundError(404, "Video not found");
        if (video?.videoFileId) {
            this.videoFileService.deleteVideoFileById(video?.videoFileId);
        }
        let deleted = await this.videoRepository.deleteVideoByID(id);
        return true;
    }

    async deleteVideosByUserId(userId: string): Promise<boolean> {
        let videos = await this.videoRepository.findAllVideosByUserId(userId);
        videos.forEach(async v => {
            await this.deleteVideoBydIdBoolean(v.id).catch(e => { throw e });
        });
        return true;
    }


    async createVideo(userId: string, title: string, description: string, fileName: string) {
        const createdVideo = await this.videoRepository.createVideo(userId, title, description, VideoState.UPLOADING);
        const videoId = createdVideo.id;
        const blobName = videoId + "_" + fileName;
        const sasUrl = await this.videoFileService.getSasUrl(blobName);
        return { video: createdVideo, sasUrl: sasUrl }
    }

    async updateVideo({ id, title, description, videoState }: { id: string; title?: string; description?: string; videoState?: VideoState }) {
        return await this.videoRepository.updateVideo(id, title, description, videoState);
    }
}
