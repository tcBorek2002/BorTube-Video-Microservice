import express, { Request, Response, Application } from 'express';
import videosRouter from './routes/videosRouter';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

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
app.disable("x-powered-by");
const port = process.env.PORT ?? 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.use('/videos', videosRouter)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
