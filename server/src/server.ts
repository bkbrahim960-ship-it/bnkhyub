import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { searchOpenSubtitlesFree } from './services/discovery/subtitleScrapers';
import { translateWithOllama } from './services/ai/translationService';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Subtitle Search Endpoint
app.post('/api/subtitles/fetch', async (req, res) => {
  const { imdb_id, title } = req.body;
  try {
    const sub = await searchOpenSubtitlesFree(imdb_id);
    if (!sub) return res.status(404).json({ error: "No subtitles found" });
    
    // Check if already in DB
    let record = await prisma.subtitle.findUnique({ where: { imdb_id } });
    if (!record) {
      record = await prisma.subtitle.create({
        data: {
          imdb_id,
          source_lang: "en",
          source_name: "opensubtitles",
          status: "pending"
        }
      });
    }
    
    res.json({ found: true, ...sub, record });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

import path from 'path';
import axios from 'axios';
import { srtToVtt, saveSubtitleLocally } from './utils/subtitleUtils';

// ... existing middleware ...
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Translate Endpoint
app.post('/api/subtitles/translate', async (req, res) => {
  const { imdb_id, subtitle_url } = req.body;
  try {
    const record = await prisma.subtitle.findUnique({ where: { imdb_id } });
    if (!record) return res.status(404).json({ error: "Record not found" });

    if (record.status === 'done') {
      return res.json({ vtt_url: `/storage/subtitles/${imdb_id}.vtt` });
    }

    // Start translation process (In a real app, this should be a BullMQ job)
    await prisma.subtitle.update({ where: { imdb_id }, data: { status: 'processing' } });

    // 1. Download original SRT
    const response = await axios.get(subtitle_url);
    const srtContent = response.data;

    // 2. Translate with Ollama (Aya Expanse)
    const translatedSrt = await translateWithOllama(srtContent);

    // 3. Convert and Save
    const vttContent = srtToVtt(translatedSrt);
    const localPath = saveSubtitleLocally(imdb_id, vttContent);

    await prisma.subtitle.update({
      where: { imdb_id },
      data: {
        status: 'done',
        vtt_path: localPath,
        model_used: 'ollama/aya-expanse'
      }
    });

    res.json({ vtt_url: `/storage/subtitles/${imdb_id}.vtt` });
  } catch (error) {
    console.error(error);
    await prisma.subtitle.update({ where: { imdb_id }, data: { status: 'failed' } });
    res.status(500).json({ error: "Translation failed" });
  }
});

app.get('/api/subtitles/:imdb_id/status', async (req, res) => {
  const { imdb_id } = req.params;
  const sub = await prisma.subtitle.findUnique({ where: { imdb_id } });
  if (!sub) return res.json({ status: 'not_found' });
  res.json({ 
    status: sub.status, 
    vtt_url: sub.status === 'done' ? `/storage/subtitles/${imdb_id}.vtt` : null 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BNKhub Free Subtitle Server running on port ${PORT}`);
});
