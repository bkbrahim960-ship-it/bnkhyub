import fs from 'fs';
import path from 'path';

/**
 * Converts SRT content to VTT format (Basic conversion)
 */
export const srtToVtt = (srtContent: string): string => {
  let vtt = "WEBVTT\n\n";
  vtt += srtContent
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2") // Fix timestamps
    .replace(/^\d+$/gm, ""); // Remove subtitle indices
  return vtt;
};

/**
 * Save file locally
 */
export const saveSubtitleLocally = (imdb_id: string, content: string): string => {
  const dir = path.join(process.cwd(), 'storage', 'subtitles');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, `${imdb_id}.vtt`);
  fs.writeFileSync(filePath, content);
  return filePath;
};
