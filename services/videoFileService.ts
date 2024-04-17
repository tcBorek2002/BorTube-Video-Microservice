import { VideoState } from '@prisma/client'
import { BlobDeleteOptions, BlobServiceClient } from '@azure/storage-blob';
import 'dotenv/config'
import { getVideoDurationInSeconds } from 'get-video-duration';
import { Readable } from 'stream';
import { Storage } from '@google-cloud/storage';
import prisma from '../client';
import { VideoService } from './implementations/VideoService';
import { PrismaVideoRepository } from '../repositories/implementations/PrismaVideoRepository';


const azureStorageConnectionString = process.env.AZURESTORAGECONNECTIONSTRING;
const containerName = 'bortube-container';

export async function getVideoFileById(id: number) {
    return prisma.videoFile.findUnique({ where: { id } });
}

export async function deleteVideoFileById(id: number) {
    try {
        let videoFile = await getVideoFileById(id);
        if (videoFile?.videoUrl) {
            await deleteVideoCloud(videoFile.videoUrl);
        }
        await prisma.videoFile.delete({ where: { id } });
        return true;
    }
    catch (error) {
        return false;
    }
}

export async function createVideoFile(duration: number, videoUrl: string, videoId: number) {
    return await prisma.videoFile.create({
        data: {
            duration,
            videoUrl,
            video: {
                connect: {
                    id: videoId,
                }
            }
        }
    })
}

export async function deleteVideoCloud(videoUrl: string) {
    const options: BlobDeleteOptions = {
        deleteSnapshots: 'include' // or 'only'
    }

    if (azureStorageConnectionString == undefined) {
        return false;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = extractFileNameFromURL(videoUrl);
    if (!blobName) {
        return false;
    }
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.deleteIfExists(options);
    }
    catch (error) {
        return false;
    }
}

export async function uploadVideo(videoFile: Express.Multer.File, videoId: number) {
    let videoService = new VideoService(new PrismaVideoRepository());
    if (azureStorageConnectionString == undefined) {
        return false;
    }
    const blobName = videoId + "_" + videoFile.originalname;
    const videoUrl = "https://storagebortube.blob.core.windows.net/bortube-container/" + blobName;

    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        const stream = Readable.from(videoFile.buffer);
        const durationSeconds = await getVideoDurationInSeconds(stream);
        await blockBlobClient.upload(videoFile.buffer, videoFile.size);
        await createVideoFile(durationSeconds, videoUrl, videoId);
        await videoService.updateVideo({ id: videoId, videoState: VideoState.VISIBLE });
        return true;
    } catch (error) {
        console.error("Error uploading video:", error);
        return false;
    }
}

export async function uploadVideoGoogleCloud(videoFile: Express.Multer.File, videoId: number) {
    if (azureStorageConnectionString == undefined) {
        return false;
    }

    const storage = new Storage({ projectId: 'theta-grid-417116', keyFilename: 'assets\\gcp-key.json' });
    const blobName = videoId + "_" + videoFile.originalname;

    try {
        await storage.bucket('bortube_bucket').file(blobName).save(videoFile.buffer);
        return true;
    } catch (error) {
        console.error("Error uploading video:", error);
        return false;
    }
}


export async function deleteVideoGoogleCloud(videoUrl: string) {
    if (azureStorageConnectionString == undefined) {
        return false;
    }

    const storage = new Storage({ projectId: 'theta-grid-417116', keyFilename: 'assets\\gcp-key.json' });
    const blobName = extractFileNameFromURL(videoUrl);
    if (!blobName) {
        return false;
    }

    try {
        await storage.bucket('bortube_bucket').file(blobName).delete();
        return true;
    } catch (error) {
        console.error("Error uploading video:", error);
        return false;
    }
}

export function extractFileNameFromURL(url: string): string | null {
    const lastSlashIndex = url.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
        return url.substring(lastSlashIndex + 1);
    } else {
        return null;
    }
}