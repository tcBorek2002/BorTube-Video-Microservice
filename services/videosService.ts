import { PrismaClient } from '@prisma/client'
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import 'dotenv/config'

const prisma = new PrismaClient()

const upload = multer({ storage: multer.memoryStorage() });

const azureStorageConnectionString = process.env.AZURESTORAGECONNECTIONSTRING;
const containerName = 'bortube-container';

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

export async function uploadVideo(videoFile: Express.Multer.File) {
    if (azureStorageConnectionString == undefined) {
        return false;
    }
    const blobName = videoFile.originalname;

    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        await blockBlobClient.upload(videoFile.buffer, videoFile.size);
        return true;
    } catch (error) {
        console.error("Error uploading video:", error);
        return false;
    }
}