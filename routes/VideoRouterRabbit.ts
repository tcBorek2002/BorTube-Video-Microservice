import { Connection } from 'rabbitmq-client';
import { IVideoService } from '../services/IVideoService';
import { ErrorDto } from '../dtos/ErrorDto';
import { NotFoundError } from '../errors/NotFoundError';
import { Video } from '@prisma/client';
import { ResponseDto } from '../dtos/ResponseDto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

export class VideoRouterRabbit {
    private rabbit: Connection;
    private videoService: IVideoService;

    constructor(rabbit: Connection, videoService: IVideoService) {
        this.rabbit = rabbit;
        this.videoService = videoService;
    }

    public start(): void {
        const getAllVideosServer = this.rabbit.createConsumer(
            {
                queue: 'get-all-videos',
            },
            async (req, reply) => {
                console.log('Get all videos request:', req.body);
                const videos = await this.videoService.getAllVideos();
                reply(new ResponseDto<Video[]>(true, videos));
            }
        );

        const getAllVisibleVideosServer = this.rabbit.createConsumer(
            {
                queue: 'get-all-visible-videos',
            },
            async (req, reply) => {
                console.log('Get all visible videos request:', req.body);
                const videos = await this.videoService.getAllVisibleVideos();
                reply(new ResponseDto<Video[]>(true, videos));
            }
        );

        const getVideoByIdServer = this.rabbit.createConsumer(
            {
                queue: 'get-video-by-id',
            },
            async (req, reply) => {
                console.log('Get video by id:', req.body.id);
                let videoId = parseInt(req.body.id);
                if (isNaN(videoId)) {
                    reply(new ResponseDto(false, new ErrorDto(400, 'InputError', 'Invalid video ID. Must be a number.')));
                    return;
                }
                try {
                    const video = await this.videoService.getVideoById(videoId);
                    reply(new ResponseDto<Video>(true, video));
                } catch (error) {
                    if (error instanceof NotFoundError) {
                        reply(new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'Video not found.')));
                    }
                }
            }
        );

        const createVideoServer = this.rabbit.createConsumer(
            {
                queue: 'create-video',
            },
            async (req, reply) => {
                console.log('Create video request:', req.body);

                try {
                    if (req.body == null) {
                        return await reply(new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Title and description are required.')));
                    }
                    // const videoFile = req.file;

                    // if (videoFile == undefined) {
                    //     res.status(400).send("No file was sent or misformed file was sent.");
                    //     return;
                    // }
                    const { title, description } = req.body;
                    if (!title || !description) {
                        return await reply(new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Title and description are required.')));
                    }

                    this.videoService.createVideo(title, description).then(async (video) => {
                        await reply(new ResponseDto<Video>(true, video));
                    });
                } catch (error) {
                    await reply(new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error.')));
                }
            }
        );

        const updateVideoServer = this.rabbit.createConsumer(
            {
                queue: 'update-video',
            },
            async (req, reply) => {
                console.log('Update video request:', req.body);
                const videoId = Number(req.body.id);

                // Check if the video ID is a valid number
                if (isNaN(videoId)) {
                    return reply(new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Invalid video ID. Must be a number.')));
                }
                const { title, description, videoState } = req.body;

                // Update the video in the database
                this.videoService.updateVideo({ id: videoId, title: title, description: description, videoState: videoState }).then((updatedVideo) => {
                    if (updatedVideo != null) { reply(new ResponseDto<Video>(true, updatedVideo)) }
                    else {
                        reply(new ResponseDto(false, new ErrorDto(404, 'NotFoundError', 'Video not found')));
                    }
                }).catch(async (error) => {
                    if (error instanceof PrismaClientValidationError) {
                        console.error('Error updating video:', error);
                        return reply(new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Invalid input.')));
                    }
                    else {
                        return reply(new ResponseDto(false, new ErrorDto(500, 'InternalError', error.message)));
                    }
                });
            }
        );

        const deleteVideoServer = this.rabbit.createConsumer(
            {
                queue: 'delete-video',
            },
            async (req, reply) => {
                console.log('Delete video request:', req.body);
                const videoId = parseInt(req.body.id);

                // Check if the video ID is a valid number
                if (isNaN(videoId)) {
                    return reply(new ResponseDto(false, new ErrorDto(400, 'InvalidInputError', 'Invalid video ID. Must be a number.')));
                }

                this.videoService.deleteVideoByID(videoId).then(async (deleted) => {
                    await reply(new ResponseDto<Video>(true, deleted));
                }).catch(async (error) => {
                    if (error instanceof NotFoundError) {
                        await reply(new ResponseDto(false, new ErrorDto(404, 'NotFoundError', error.message)));
                    }
                    else {
                        await reply(new ResponseDto(false, new ErrorDto(500, 'InternalError', 'Internal Server Error.')));
                    }
                });
            }
        );

        process.on('SIGINT', async () => {
            await Promise.all([
                getAllVideosServer.close(),
                getAllVisibleVideosServer.close(),
                getVideoByIdServer.close(),
                createVideoServer.close(),
                updateVideoServer.close(),
                deleteVideoServer.close(),
            ]);
            await this.rabbit.close();
        });
    }
}