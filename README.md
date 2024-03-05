# BorTube Video Microservice

npm run dev for development. Runs on localhost:8000   

Run db:   

docker run -d --name postgres-container -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=bortube-db -p 5432:5432 -v /path/on/host:/var/lib/postgresql/data postgres:latest

connection string: postgres://myuser:mysecretpassword@localhost:5432/bortube-db
