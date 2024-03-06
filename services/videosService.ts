import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllVideos() {
    return await prisma.videos.findMany();
}

export async function getVideoById(id: number) {
    return prisma.videos.findUnique({where: {id}});
}

export async function createVideo(title: string, duration: number ) {
    await prisma.videos.create({
        data: {
            title,
            duration
        }
    })
}

export async function updateVideo(id: number, title?: string, duration?: number) {
    await prisma.videos.update({where: {id}, data: {title, duration}});
}