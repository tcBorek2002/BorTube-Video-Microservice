import { PrismaClient, Video, VideoState } from '@prisma/client'
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import 'dotenv/config'
import { getVideoDurationInSeconds } from 'get-video-duration';
import { updateVideo } from './videosService';

const prisma = new PrismaClient()

const upload = multer({ storage: multer.memoryStorage() });

const azureStorageConnectionString = process.env.AZURESTORAGECONNECTIONSTRING;
const containerName = 'bortube-container';

export async function getVideoFileById(id: number) {
    return prisma.videoFile.findUnique({ where: { id } });
}

export async function deleteVideoFileById(id: number) {
    try {
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

export async function uploadVideo(videoFile: Express.Multer.File, videoId: number) {
    if (azureStorageConnectionString == undefined) {
        return false;
    }
    const blobName = videoId + "_" + videoFile.originalname;
    const videoUrl = "https://storagebortube.blob.core.windows.net/bortube-container/" + blobName;
    // const durationSeconds = await getVideoDurationInSeconds(videoFile.stream);
    const durationSeconds = 100;

    const blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        await blockBlobClient.upload(videoFile.buffer, videoFile.size);
        await createVideoFile(durationSeconds, videoUrl, videoId);
        await updateVideo({ id: videoId, videoState: VideoState.VISIBLE });
        return true;
    } catch (error) {
        console.error("Error uploading video:", error);
        return false;
    }
}