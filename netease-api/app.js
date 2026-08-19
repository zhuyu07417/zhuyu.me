const NeteaseCloudMusicApi = require('NeteaseCloudMusicApi');
const express = require('express');
const http = require('http');
const app = express();

const BACKEND_API = process.env.BACKEND_API || 'http://127.0.0.1:8000';
let MUSIC_U = '';

async function fetchCookie() {
  return new Promise((resolve) => {
    http.get(`${BACKEND_API}/api/site-config`, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.netease_music_u) {
            MUSIC_U = json.netease_music_u;
            console.log('[Cookie] 获取成功，长度:', MUSIC_U.length);
          }
        } catch (e) { console.error('[Cookie] 解析失败'); }
        resolve();
      });
    }).on('error', () => resolve());
  });
}

fetchCookie();
setInterval(fetchCookie, 5 * 60 * 1000);

app.use(async (req, res) => {
  try {
    const funcName = req.path.replace(/^\//, '').replace(/\//g, '_');
    const func = NeteaseCloudMusicApi[funcName];
    if (!func) return res.status(404).json({ error: 'not found: ' + funcName });
    const cookie = MUSIC_U ? `MUSIC_U=${MUSIC_U}` : '';
    const result = await func({ ...req.query, cookie });
    res.json(result.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(3001, () => console.log('Netease API running on port 3001'));
