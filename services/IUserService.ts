
import { UserDto } from "../dtos/UserDto";

export interface IUserService {
    getUserById(id: string): Promise<UserDto>;
    getUsersByIds(ids: string[]): Promise<UserDto[]>;
}