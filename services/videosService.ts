import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getAllVideos() {
    const allVideos = await prisma.videos.findMany();
    return allVideos;
}

async function createVideo(title: string, duration: number ) {
    await prisma.videos.create({
        data: {
            title,
            duration
        }
    })
}