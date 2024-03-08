# BorTube Video Microservice

npm run dev for development. Runs on localhost:8000

Docker deploying:  
docker build . -t video-microservice  
docker run -p 8000:8000 --name bortube-video-microservice video-microservice

Run db:
docker-compose -f ./docker-compose-db.yml up -d

connection string: postgres://myuser:mysecretpassword@localhost:5432/bortube-db
DATABASE_URL="postgres://postgres.xtrezgfporrocooxhkue:PASSWORD@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
Docker exec: psql -d bortube-db -U myuser

CREATE TABLE videos (
id SERIAL PRIMARY KEY,
title VARCHAR(100) NOT NULL,
duration integer NOT NULL
);

CREATE TABLE videos ( id SERIAL PRIMARY KEY, title VARCHAR(100) NOT NULL, duration integer NOT NULL);
