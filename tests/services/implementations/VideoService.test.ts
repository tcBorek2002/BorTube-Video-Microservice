import Connection from "rabbitmq-client";
import { NotFoundError } from "../../../errors/NotFoundError";
import { IVideoRepository } from "../../../repositories/IVideoRepository";
import { PrismaVideoRepository } from "../../../repositories/implementations/PrismaVideoRepository";
import { IVideoFileService } from "../../../services/IVideoFileService";
import { IVideoService } from "../../../services/IVideoService";
import { VideoFileService } from "../../../services/implementations/VideoFileService";
import { VideoService } from "../../../services/implementations/VideoService";
import * as redis from 'redis';
import { IUserService } from "../../../services/IUserService";
import { RabbitUserService } from "../../../services/implementations/RabbitUserService";
import prisma from "../../../client";
import dotenv from 'dotenv';
import { UserDto } from "../../../dtos/UserDto";

dotenv.config();


describe("VideoService", () => {
    let redisClient: redis.RedisClientType<any, any, any>;
    let videoService: IVideoService;
    let videoFileService: IVideoFileService;
    let userService: IUserService;
    let videoRepo: IVideoRepository
    let connection: Connection;

    beforeAll(() => {
        const redisConnectionString = process.env.REDIS_CONNECTION_STRING;
        if (!redisConnectionString) {
            throw new Error('Redis connection string not set')
        }
        redisClient = redis.createClient({ url: redisConnectionString });
        redisClient.connect();
        redisClient.on('error', (err) => {
            console.log('Redis connection error', err)
        });
        connection = {
            createRPCClient: jest.fn().mockReturnValue({
                send: jest.fn().mockImplementation((queue, message) => {
                    if (queue === "get-users-by-id") {
                        return Promise.resolve({ body: { success: true, data: [{ id: "56a325fb-fe58-4aba-9bf5-40230e92b91b", displayName: "Henk" }, { id: "f2b241a9-f749-4a0c-b060-1be175295ecf", displayName: "Oka" }] as UserDto[] } }
                        );
                    }
                    else if (queue === "get-user-dto-by-id") {
                        return Promise.resolve({ body: { success: true, data: { id: "56a325fb-fe58-4aba-9bf5-40230e92b91b", displayName: "Henk" } }, contentType: 'application/json' });
                    }
                }),
                close: jest.fn(),
            }),
        } as unknown as Connection;

        videoRepo = new PrismaVideoRepository();
        videoFileService = {
            getSasUrl: jest.fn().mockResolvedValue("MockedSasUrl"),
            deleteVideoFileById: jest.fn(),
        } as unknown as IVideoFileService;
        userService = new RabbitUserService(connection);

        videoService = new VideoService(videoRepo, videoFileService, userService, redisClient);

    });

    afterAll(() => {
        redisClient.quit();
    });

    describe("getAllVisibleVideos", () => {
        it("should return all visible videos", async () => {
            const videos = await videoService.getAllVisibleVideos();
            expect(videos).toBeDefined();
            expect(videos.length).toBeGreaterThan(0);
        });
    });

    describe("getAllVideos", () => {
        it("should return all videos", async () => {
            const videos = await videoService.getAllVideos();
            expect(videos).toBeDefined();
            expect(videos.length).toBeGreaterThan(0);
        });
    });

    describe("getVideoById", () => {
        connection = {
            createRPCClient: jest.fn().mockReturnValue({
                send: jest.fn().mockResolvedValue({ body: { success: true, data: { id: "56a325fb-fe58-4aba-9bf5-40230e92b91b", displayName: "Henk" } }, contentType: 'application/json' }),
                close: jest.fn(),
            }),
        } as unknown as Connection;

        it("should return a video by id", async () => {
            const video = await videoService.getVideoById("823ae36d-8668-4164-aca0-17fac0897776");
            expect(video).toBeDefined();
            expect(video.id).toBe("823ae36d-8668-4164-aca0-17fac0897776");
        });

        it("should throw NotFoundError when video not found", async () => {
            try {
                await videoService.getVideoById("abcd");
            } catch (error) {
                expect(error).toBeInstanceOf(NotFoundError);
            }
        });
    });

    describe("createVideo", () => {
        it("should create a video", async () => {
            const video = await videoService.createVideo("56a325fb-fe58-4aba-9bf5-40230e92b91b", "title", "description", "filename");
            expect(video).toBeDefined();
            expect(video.video.title).toBe("title");
            await videoService.deleteVideoByID(video.video.id);
        });
    });

    describe("updateVideo", () => {
        it("should update a video", async () => {
            const video = await videoService.createVideo("56a325fb-fe58-4aba-9bf5-40230e92b91b", "title", "description", "filename");
            const updatedVideo = await videoService.updateVideo({ id: video.video.id, title: "new title", description: "new description" });
            expect(updatedVideo).toBeDefined();
            expect(updatedVideo.title).toBe("new title");
            expect(updatedVideo.description).toBe("new description");
            await videoService.deleteVideoByID(video.video.id);
        });
    })
});
