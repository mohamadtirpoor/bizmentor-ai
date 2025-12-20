import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = join(__dirname, 'dist');

const AI_CONFIG = {
  baseURL: 'https://ai.liara.ir/api/6946d394731abb305a4559c1/v1',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI2OTQ2ZDNkOWRjNTc3Zjg1ZTc0OTAzZTEiLCJ0eXBlIjoiYWlfa2V5IiwiaWF0IjoxNzY2MjQ5NDMzfQ.CiexmFC6YFOTc7CfHLBGW77SMLcaD9kQ22wKg4t6_Pc',
  model: 'google/gemini-3-pro-preview'
};

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = createServer(async (req, res) => {
  // Handle API chat endpoint
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(body);
        
        const postData = JSON.stringify({
          model: AI_CONFIG.model,
          messages: messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 4096
        });

        const url = new URL(AI_CONFIG.baseURL + '/chat/completions');
        const options = {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const apiReq = https.request(options, (apiRes) => {
          apiRes.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  res.write('data: [DONE]\n\n');
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                  } catch {}
                }
              }
            }
          });
          apiRes.on('end', () => res.end());
          apiRes.on('error', (e) => {
            console.error('API Response Error:', e);
            res.end();
          });
        });

        apiReq.on('error', (e) => {
          console.error('API Request Error:', e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        apiReq.write(postData);
        apiReq.end();
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Serve static files
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  if (!existsSync(filePath) || !extname(filePath)) {
    filePath = join(DIST_DIR, 'index.html');
  }

  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    try {
      const indexContent = readFileSync(join(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexContent);
    } catch (e) {
      res.writeHead(500);
      res.end('Server Error');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});