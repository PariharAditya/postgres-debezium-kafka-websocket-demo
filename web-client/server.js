import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Simple config injection for client via global var
app.get('/config.js', (req, res) => {
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    res.type('application/javascript');
    res.send(`window.REACT_APP_WEBSOCKET_URL = '${wsUrl}'; window.REACT_APP_API_URL='${apiUrl}';`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Web client listening on ${PORT}`);
});
