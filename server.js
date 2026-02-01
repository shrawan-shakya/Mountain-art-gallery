
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname)); // Serve the frontend files

// Data Persistence (Simple File-based for demo, swap for Postgres in production)
const DATA_FILE = path.join(__dirname, 'artworks.json');
const getArtworks = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};
const saveArtworks = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Ensure Uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// API Endpoints
app.get('/api/artworks', (req, res) => {
  res.json(getArtworks());
});

app.post('/api/artworks', upload.single('image'), (req, res) => {
  const artworks = getArtworks();
  const newArtwork = {
    id: Date.now().toString(),
    ...req.body,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl
  };
  artworks.unshift(newArtwork);
  saveArtworks(artworks);
  res.status(201).json(newArtwork);
});

app.put('/api/artworks/:id', upload.single('image'), (req, res) => {
  let artworks = getArtworks();
  const index = artworks.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    const updated = {
      ...artworks[index],
      ...req.body,
    };
    if (req.file) updated.imageUrl = `/uploads/${req.file.filename}`;
    artworks[index] = updated;
    saveArtworks(artworks);
    res.json(updated);
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/api/artworks/:id', (req, res) => {
  let artworks = getArtworks();
  const filtered = artworks.filter(a => a.id !== req.params.id);
  saveArtworks(filtered);
  res.status(204).send();
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Gallery Server running on port ${PORT}`);
});
