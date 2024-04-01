import express from 'express'
import { createVideo, deleteVideoById, getAllVideos, getVideoById, updateVideo } from '../services/videosService'
import multer from 'multer';
import { createVideoFile, uploadVideo } from '../services/videoFileService';
const videosRouter = express.Router()
const upload = multer({ storage: multer.memoryStorage() });

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
    const { title, description, videoState } = req.body;

    // Update the video in the database
    updateVideo({ id: videoId, title: title, description: description, videoState: videoState }).then((updatedVideo) => {
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

videosRouter.post('/', upload.single('video'), async (req, res) => {
  try {
    if (req.body == null) { return res.status(400).json({ error: 'Title and duration are required' }); }
    const videoFile = req.file;

    if (videoFile == undefined) {
      res.status(400).send("No file was sent or misformed file was sent.");
      return;
    }
    const { title, description } = req.body;

    // Validate the presence of required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Create the video in the database
    let newVideo = await createVideo(title, description);
    let uploadSuccess = await uploadVideo(videoFile, newVideo.id);
    if (!uploadSuccess) {
      await deleteVideoById(newVideo.id);
      return res.status(500).send("Something went wrong when uploading the video. Please try again later.");
    }

    return res.status(201).json({ videoId: newVideo.id });

  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


// Upload the video
// videosRouter.post('/upload', upload.single('video'), async (req, res) => {
//   try {
//     const videoFile = req.file;

//     if (videoFile == undefined) {
//       res.status(400).send("No file was sent or misformed file was sent.");
//       return;
//     }

//     let success = await uploadVideo(videoFile);
//     success ? res.status(200).send('Video uploaded successfully') : res.status(500).send("Something went wrong when uploading the video");

//   } catch (error) {
//     console.error('Error uploading video:', error);
//     res.status(500).send('Error uploading video');
//   }
// });

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