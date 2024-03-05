import express from 'express'
const videosRouter = express.Router()

const videos = [{id: 1, title: "First video!", duration: 180}, {id: 2, title: "Announcement", duration: 323}]

videosRouter.get('/', (req, res) => {
    res.send(videos)
})

videosRouter.get('/:id', (req, res) => {
    const videoId = Number(req.params.id);

    // Check if the video ID is a valid number
    if (isNaN(videoId)) {
        res.status(400).send('Invalid video ID. Must be a number.');
        return;
    }

    let video = videos.find((vid) => vid.id == videoId)
    if(video) {
        res.send(video)
    }
    else {
        res.status(404).send('Video not found');
    }
})

export default videosRouter;