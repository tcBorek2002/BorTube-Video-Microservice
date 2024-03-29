import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllVideos() {
    return await prisma.videos.findMany();
}

export async function getVideoById(id: number) {
    return prisma.videos.findUnique({ where: { id } });
}

export async function deleteVideoById(id: number) {
    try {
        await prisma.videos.delete({ where: { id } });
        return true;
    }
    catch (error) {
        return false;
    }
}

export async function createVideo(title: string, duration: number) {
    await prisma.videos.create({
        data: {
            title,
            duration
        }
    })
}

export async function updateVideo(id: number, title?: string, duration?: number) {
    try {
        return await prisma.videos.update({ where: { id }, data: { title, duration } });
    }
    catch (error) {
        return null;
    }
}