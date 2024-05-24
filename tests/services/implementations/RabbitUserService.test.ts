import Connection from "rabbitmq-client";
import { RabbitUserService } from "../../../services/implementations/RabbitUserService";
import { InternalServerError } from "../../../errors/InternalServerError";
import { NotFoundError } from "../../../errors/NotFoundError";

describe("RabbitUserService", () => {
    let userService: RabbitUserService;
    // Create a mock object that implements the Connection interface
    const connectionMock: Partial<Connection> = {
        on: jest.fn(),
        acquire: jest.fn(),
        close: jest.fn(),
        unsafeDestroy: jest.fn(),
        // Add other required properties and methods here
    };

    beforeEach(() => {
        // Initialize the RabbitUserService instance with the mock connection
        userService = new RabbitUserService(connectionMock as Connection);
    });

    describe("getUserById", () => {
        it("should return a user when a valid id is provided", async () => {
            // Mock the RPC client and its send method
            const rpcClientMock = {
                send: jest.fn().mockResolvedValue({
                    body: {
                        success: true,
                        data: {
                            id: "1",
                            name: "John Doe",
                            email: "john@example.com",
                        },
                    },
                    contentType: "application/json",
                }),
                close: jest.fn(),
            };

            // Set up the RabbitMQ connection mock to return the RPC client mock
            connectionMock.createRPCClient = jest.fn().mockReturnValue(rpcClientMock);

            // Create the RabbitUserService instance with the mocked connection
            const userService = new RabbitUserService(connectionMock as Connection);

            // Call the getUserById method with a valid id
            const user = await userService.getUserById("1");

            // Assert that the user is returned correctly
            expect(user).toEqual({
                id: "1",
                name: "John Doe",
                email: "john@example.com",
            });

            // Assert that the RPC client's send and close methods were called
            expect(rpcClientMock.send).toHaveBeenCalledWith("get-user-dto-by-id", { id: "1" });
            expect(rpcClientMock.close).toHaveBeenCalled();
        });

        it("should throw an InternalServerError when the response is invalid", async () => {
            // Mock the RPC client and its send method to return an invalid response
            const rpcClientMock = {
                send: jest.fn().mockResolvedValue({
                    body: "Invalid response",
                    contentType: "application/json",
                }),
                close: jest.fn(),
            };

            // Set up the RabbitMQ connection mock to return the RPC client mock
            connectionMock.createRPCClient = jest.fn().mockReturnValue(rpcClientMock);


            // Create the RabbitUserService instance with the mocked connection
            const userService = new RabbitUserService(connectionMock as Connection);

            // Call the getUserById method with a valid id
            await expect(userService.getUserById("1")).rejects.toThrow(TypeError);

            // Assert that the RPC client's send and close methods were called
            expect(rpcClientMock.send).toHaveBeenCalledWith("get-user-dto-by-id", { id: "1" });
            expect(rpcClientMock.close).toHaveBeenCalled();
        });

        // Add more test cases for different scenarios
    });

    describe("getUsersByIds", () => {
        let userService: RabbitUserService;
        // Create a mock object that implements the Connection interface
        const connectionMock: Partial<Connection> = {
            on: jest.fn(),
            acquire: jest.fn(),
            close: jest.fn(),
            unsafeDestroy: jest.fn(),
            // Add other required properties and methods here
        };

        beforeEach(() => {
            // Initialize the RabbitUserService instance with the mock connection
            userService = new RabbitUserService(connectionMock as Connection);
        });

        it("should return an array of UserDto when successful", async () => {
            // Mock the RPCClient's send method to return a successful response
            const rpcClientMock = {
                send: jest.fn().mockResolvedValue({
                    body: {
                        success: true,
                        data: [
                            { id: "1", name: "User 1" },
                            { id: "2", name: "User 2" },
                        ],
                    },
                }),
                close: jest.fn(),
            };

            // Replace the createRPCClient method with the mock
            connectionMock.createRPCClient = jest.fn().mockReturnValue(rpcClientMock);


            // Call the getUsersByIds method
            const result = await userService.getUsersByIds(["1", "2"]);

            // Assert that the result is an array of UserDto
            expect(result).toEqual([
                { id: "1", name: "User 1" },
                { id: "2", name: "User 2" },
            ]);

            // Assert that the createRPCClient and close methods were called
            expect(connectionMock.createRPCClient).toHaveBeenCalledWith({ confirm: true });
            expect(rpcClientMock.close).toHaveBeenCalled();
        });

        it("should throw NotFoundError when response has success=false and code=404", async () => {
            // Mock the RPCClient's send method to return a response with success=false and code=404
            const rpcClientMock = {
                send: jest.fn().mockResolvedValue({
                    body: {
                        success: false,
                        data: { code: 404, message: "User not found" },
                    },
                }),
                close: jest.fn(),
            };

            // Replace the createRPCClient method with the mock
            connectionMock.createRPCClient = jest.fn().mockReturnValue(rpcClientMock);

            // Call the getUsersByIds method and expect it to throw NotFoundError
            await expect(userService.getUsersByIds(["1"])).rejects.toThrow(NotFoundError);

            // Assert that the createRPCClient and close methods were called
            expect(connectionMock.createRPCClient).toHaveBeenCalledWith({ confirm: true });
            expect(rpcClientMock.close).toHaveBeenCalled();
        });

    });


});