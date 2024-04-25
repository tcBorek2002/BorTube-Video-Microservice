
export interface IUploadService {
    getSasUrl(blobName: string): Promise<string>;
}