import { Connection } from 'rabbitmq-client';
import { IVideoService } from '../services/IVideoService';

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
                reply(videos);
            }
        );

        const getAllVisibleVideosServer = this.rabbit.createConsumer(
            {
                queue: 'get-all-visible-videos',
            },
            async (req, reply) => {
                console.log('Get all visible videos request:', req.body);
                const videos = await this.videoService.getAllVisibleVideos();
                reply(videos);
            }
        );

        const createVideoServer = this.rabbit.createConsumer(
            {
                queue: 'create-video',
            },
            async (req, reply) => {
                console.log('Create video request:', req.body);
                await reply('Video created');
            }
        );

        const updateVideoServer = this.rabbit.createConsumer(
            {
                queue: 'update-video',
            },
            async (req, reply) => {
                console.log('Update video request:', req.body);
                await reply('Video updated');
            }
        );

        const deleteVideoServer = this.rabbit.createConsumer(
            {
                queue: 'delete-video',
            },
            async (req, reply) => {
                console.log('Delete video request:', req.body);
                await reply('Video deleted');
            }
        );

        process.on('SIGINT', async () => {
            await Promise.all([
                getAllVideosServer.close(),
                getAllVisibleVideosServer.close(),
                createVideoServer.close(),
                updateVideoServer.close(),
                deleteVideoServer.close(),
            ]);
            await this.rabbit.close();
        });
    }
}