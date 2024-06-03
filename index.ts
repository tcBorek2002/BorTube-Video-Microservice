import dotenv from 'dotenv';
import { VideoService } from './services/implementations/VideoService';
import { PrismaVideoRepository } from './repositories/implementations/PrismaVideoRepository';
import Connection, { ConnectionOptions } from 'rabbitmq-client';
import { VideoRouterRabbit } from './routes/VideoRouterRabbit';
import { VideoFileService } from './services/implementations/VideoFileService';
import { RabbitUserService } from './services/implementations/RabbitUserService';
import * as redis from 'redis';

//For env File 
dotenv.config();

// RabbitMQ connection
const userName = "NodeUser";
const password = process.env.RABBITMQ_PASSWORD;
const hostname = process.env.RABBITMQ_HOSTNAME;
const redisConnectionString = process.env.REDIS_CONNECTION_STRING;
if (!password || !hostname) {
  throw new Error('RabbitMQ connection parameters not set')
}
if (!redisConnectionString) {
  throw new Error('Redis connection string not set')
}
const options: ConnectionOptions = { username: userName, password: password, connectionName: 'Video Microservice', hostname: hostname };
const rabbit = new Connection(options);

const redisClient = redis.createClient({ url: redisConnectionString });
redisClient.connect();

redisClient.on('error', (err) => {
  console.log('Redis connection error', err)
});

redisClient.on('ready', () => {
  console.log('Connected to Redis and ready to use')
});


rabbit.on('error', (err) => {
  console.log('RabbitMQ connection error', err)
})
rabbit.on('connection', () => {
  console.log('Connection successfully (re)established')
})
const videoRouterRabbit = new VideoRouterRabbit(rabbit, new VideoService(new PrismaVideoRepository(), new VideoFileService(rabbit), new RabbitUserService(rabbit), redisClient), new VideoFileService(rabbit));
videoRouterRabbit.start();
