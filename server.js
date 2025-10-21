import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

app.use(cors());
app.use(bodyParser.json());

function gerarCoquiTTS(texto, callback) {
  const outputFile = path.resolve(`tts_output_${Date.now()}.wav`);
  const command = `python3 -m TTS --text "${texto}" --out_path ${outputFile}`;
  exec(command, (error) => {
    if (error) { callback(error, null); return; }
    fs.readFile(outputFile, (err, data) => {
      if (err) { callback(err, null); return; }
      fs.unlinkSync(outputFile);
      callback(null, data);
    });
  });
}

app.post('/api/tts', async (req, res) => {
  const { text, voice = 'Jeremy' } = req.body;
  if (!text || text.trim() === '') return res.status(400).json({ error: 'Texto é obrigatório.' });

  if (!ELEVENLABS_API_KEY) {
    console.log('⚙️ Usando Coqui TTS offline');
    gerarCoquiTTS(text, (err, audioData) => {
      if (err) return res.status(500).json({ error: 'Falha ao gerar áudio Coqui.' });
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', 'inline; filename="tts.wav"');
      res.send(audioData);
    });
    return;
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      { text, voice_settings: { stability: 0.4, similarity_boost: 0.7 } },
      { headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' }, responseType: 'arraybuffer' }
    );
    const audioBuffer = Buffer.from(response.data, 'binary');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="tts.mp3"');
    res.send(audioBuffer);
  } catch (error) {
    console.error('Erro ElevenLabs:', error.response?.data || error.message);
    res.status(500).json({ error: 'Falha ao gerar áudio ElevenLabs.' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'index.html')));
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));