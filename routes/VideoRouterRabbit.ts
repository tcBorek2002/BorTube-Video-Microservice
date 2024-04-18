import { Connection } from 'rabbitmq-client';

export class VideoRouterRabbit {
    private rabbit: Connection;

    constructor(rabbit: Connection) {
        this.rabbit = rabbit;
    }

    public start(): void {
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
                createVideoServer.close(),
                updateVideoServer.close(),
                deleteVideoServer.close(),
            ]);
            await this.rabbit.close();
        });
    }
}