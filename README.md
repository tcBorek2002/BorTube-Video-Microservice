# BorTube Video Microservice

npm run dev for development. Runs on localhost:8000

Docker deploying:  
docker build . -t video-microservice  
docker run -p 8000:8000 --name bortube-video-microservice video-microservice

Run db:

docker run -d --name postgres-container -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=bortube-db -p 5432:5432 -v /path/on/host:/var/lib/postgresql/data postgres:latest

connection string: postgres://myuser:mysecretpassword@localhost:5432/bortube-db

CREATE TABLE videos (
id SERIAL PRIMARY KEY,
title VARCHAR(100) NOT NULL,
duration integer NOT NULL
);

CREATE TABLE videos ( id SERIAL PRIMARY KEY, title VARCHAR(100) NOT NULL, duration integer NOT NULL);
