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
  endpoint: 'https://arvancloudai.ir/gateway/models/Qwen3-30B-A3B/MzngmyQ1gA1LhnhOwlLFW4xAv3F4mH_B-aDTOTJCiCyggiFk4qUOtP-TJ02Vao2geVMmoSTiu2EMHg8HqwJQNzMHr7abTuS3Xy6do9APpuIs-yXdqd_S-s597MXlaLDTiURmaY47xj--xPHdHBtLO3GLcTllV_IIvxS62f7mHyCpQzNQpL66GwbZrwRNyHepubqq9hOIRwNIfpKcUV6i-qZNdxyUROnUkZs7HFbQWuHg90CUsQQP5RZogWFCgE97/v1',
  apiKey: 'b6a3781c-f36c-5631-939c-b3c1c0230d4b',
  model: 'Qwen3-30B-A3B'
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
          max_tokens: 3000
        });

        const url = new URL(AI_CONFIG.endpoint + '/chat/completions');
        const options = {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `apikey ${AI_CONFIG.apiKey}`,
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