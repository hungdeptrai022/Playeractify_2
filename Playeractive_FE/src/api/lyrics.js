
import express from 'express';
import cheerio from 'cheerio';
import axios from 'axios';

const app = express();

app.get('/api/lyrics', async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Lấy lyrics từ Genius page
    const lyrics = $('div[class*="Lyrics__Container"]').text();
    
    res.json({ lyrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
}); 