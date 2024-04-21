import { PrismaClient, VideoState } from '@prisma/client'
import 'dotenv/config'
import { deleteVideoFileById } from './videoFileService';

const prisma = new PrismaClient()


export async function getAllVideos() {
    return await prisma.video.findMany({ where: { videoState: VideoState.VISIBLE }, include: { videoFile: true } });
}

export async function getVideoById(id: number) {
    return prisma.video.findUnique({ where: { id }, include: { videoFile: true } });
}

export async function deleteVideoById(id: number) {
    try {
        let video = await getVideoById(id);
        if (video?.videoFileId) {
            await deleteVideoFileById(video?.videoFileId);
        }
        await prisma.video.delete({ where: { id } });
        return true;
    }
    catch (error) {
        return false;
    }
}

export async function createVideo(title: string, description: string) {
    return await prisma.video.create({
        data: {
            title,
            description,
            videoState: VideoState.UPLOADING,
        }
    })
}

export async function updateVideo({ id, title, description, videoState }: { id: number; title?: string; description?: string; videoState?: VideoState }) {
    try {
        return await prisma.video.update({ where: { id }, data: { title, description, videoState } });
    }
    catch (error) {
        return null;
    }
}