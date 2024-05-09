import { $Enums } from "@prisma/client";

export type VideoDto = {
    id: string;
    user: {
        id: string;
        displayName: string;
    };
    title: string;
    description: string;
    videoState: $Enums.VideoState;
    videoFileId: string | null;
}