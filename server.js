import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Static Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// 2. Data Persistence
const DATA_FILE = path.join(__dirname, 'artworks.json');
const getArtworks = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};
const saveArtworks = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 3. API Routes
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
    const updated = { ...artworks[index], ...req.body };
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

app.post('/api/generate-metadata', async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { prompt } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an elite museum curator for SHAKYA (formerly Mountain Art Gallery). Based on this description: "${prompt}", suggest a formal title, a period-appropriate artist name, the physical medium, and gallery dimensions. Ensure the suggestions feel authentic to Nepalese and Himalayan art history.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            medium: { type: Type.STRING },
            dimensions: { type: Type.STRING },
            year: { type: Type.STRING }
          },
          required: ["title", "artist", "medium", "dimensions", "year"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Serve Frontend
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(express.static(__dirname));
  app.get('*', (req, res) => {
    const indexHtmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      res.sendFile(indexHtmlPath);
    } else {
      res.status(200).send('<h1>Gallery Server is running</h1><p>Frontend build (dist/) not found.</p>');
    }
  });
}

app.listen(PORT, () => {
  console.log(`Gallery Server running on port ${PORT}`);
});