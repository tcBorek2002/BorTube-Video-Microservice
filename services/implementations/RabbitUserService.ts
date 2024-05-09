import { IVideoRepository } from "../../repositories/IVideoRepository";
import { IVideoFileService } from "../IVideoFileService";
import { IUserService } from "../IUserService";
import { UserDto } from "../../dtos/UserDto";
import Connection from "rabbitmq-client";
import { ResponseDto } from "../../dtos/ResponseDto";
import { InternalServerError } from "../../errors/InternalServerError";
import { ErrorDto } from "../../dtos/ErrorDto";
import { NotFoundError } from "../../errors/NotFoundError";
import { InvalidInputError } from "../../errors/InvalidInputError";

export class RabbitUserService implements IUserService {
    private rabbit: Connection;

    constructor(connection: Connection) {
        this.rabbit = connection;
    }
    async getUserById(id: string): Promise<UserDto> {
        const rpcClient = this.rabbit.createRPCClient({ confirm: true })

        const res = await rpcClient.send('get-user-dto-by-id', { id });
        await rpcClient.close()

        if (!res || !res.body || res.contentType !== 'application/json' || !ResponseDto.isResponseDto(res.body)) {
            throw new InternalServerError(500, 'Invalid response get-user-by-id: ' + res.body);
        }

        const response = res.body;
        if (response.success === false) {
            let error: ErrorDto = response.data as ErrorDto;
            if (error.code == 404) {
                throw new NotFoundError(404, error.message);
            }
            else if (error.code == 400) {
                throw new InvalidInputError(400, error.message);
            }
            else {
                throw new InternalServerError(500, error.message);
            }
        }
        else {
            let user: UserDto = response.data as UserDto;
            return user;
        }
    }
    async getUsersByIds(ids: string[]): Promise<UserDto[]> {
        const rpcClient = this.rabbit.createRPCClient({ confirm: true })

        const res = await rpcClient.send('get-users-by-id', { ids });
        await rpcClient.close()

        const response = res.body;
        if (response.success === false) {
            let error: ErrorDto = response.data as ErrorDto;
            if (error.code == 404) {
                throw new NotFoundError(404, error.message);
            }
            else if (error.code == 400) {
                throw new InvalidInputError(400, error.message);
            }
            else {
                throw new InternalServerError(500, error.message);
            }
        }
        else {
            let users: UserDto[] = response.data as UserDto[];
            return users;
        }
    }

}
