import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { VideoRouter } from './routes/VideoRouter';
import { VideoService } from './services/implementations/VideoService';
import { PrismaVideoRepository } from './repositories/implementations/PrismaVideoRepository';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';

//For env File 
dotenv.config();

const app: Application = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
})
app.use(express.json());
app.use(express.static('public'));
app.use(morgan("tiny"));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger-output.json",
    },
  })
);
app.disable("x-powered-by");
const port = process.env.PORT ?? 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

const videoRouter = new VideoRouter(new VideoService(new PrismaVideoRepository())).getRouter();
app.use(videoRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
