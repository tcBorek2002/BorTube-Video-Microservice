import express from 'express'
import { createVideo, deleteVideoById, getAllVideos, getVideoById, updateVideo } from '../services/videosService'
const videosRouter = express.Router()

videosRouter.get('/', (req, res) => {
  getAllVideos().then((videos) => res.send(videos));
})

videosRouter.get('/:id', (req, res) => {
  const videoId = Number(req.params.id);

  // Check if the video ID is a valid number
  if (isNaN(videoId)) {
    res.status(400).send('Invalid video ID. Must be a number.');
    return;
  }

  getVideoById(videoId).then((video) => {
    if (!video) {
      res.status(404).send("Video not found.");
    }
    else {
      res.send(video);
    }
  })
})

videosRouter.put('/:id', (req, res) => {
  try {
    const videoId = Number(req.params.id);

    // Check if the video ID is a valid number
    if (isNaN(videoId)) {
      res.status(400).send('Invalid video ID. Must be a number.');
      return;
    }
    const { title, duration } = req.body;

    // Validate the presence of required fields
    if (!title && !duration) {
      return res.status(400).json({ error: 'Title or duration are required' });
    }

    // Update the video in the database
    updateVideo(videoId, title, duration).then((updatedVideo) => {
      if (updatedVideo != null) { res.status(200).json(updatedVideo) }
      else {
        res.status(404).send("Video not found");
      }
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

videosRouter.post('/', (req, res) => {
  try {
    if (req.body == null) { return res.status(400).json({ error: 'Title and duration are required' }); }
    const { title, duration } = req.body;

    // Validate the presence of required fields
    if (!title || !duration) {
      return res.status(400).json({ error: 'Title and duration are required' });
    }

    // Create the video in the database
    createVideo(title, duration).then((createdVideo) => res.status(201).json(createdVideo));
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

videosRouter.delete('/:id', (req, res) => {
  try {
    const videoId = Number(req.params.id);

    // Check if the video ID is a valid number
    if (isNaN(videoId)) {
      res.status(400).send('Invalid video ID. Must be a number.');
      return;
    }

    // Update the video in the database
    deleteVideoById(videoId).then((isDeleted) => {
      if (isDeleted) { res.status(200).send(); }
      else { res.status(404).send("Video not found"); }
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: error });
  }
})
export default videosRouter;