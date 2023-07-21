import express from 'express';
import path from 'path';
import { EventEmitter } from 'node:events';
import { v4 as uuidv4} from 'uuid';

class CustomEmitter extends EventEmitter {}
const emitter = new CustomEmitter();

const app = express();
const port = 3000;
let pusher = 0;

const __dirname = path.resolve();
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));

  pusher = setInterval(() => {
    const data = new Date();
    emitter.emit('usermessage', data);
  }, 2000);
});

app.get('/api', (req, res) => {
  res.header('Content-Type', 'text/event-stream; charset=utf-8');
  res.header('Cache-Control', 'no-cache');
  res.header('Connection', 'keep-alive');
  res.header('Access-Control-Allow-Origin', '*');

  const handler = v => {
    const msg = {
      event: 'update',
      id: 'event_' + new Date().getTime(),
      data: uuidv4().toLocaleUpperCase()
    };
    const content = Object.keys(msg).map(item => `${item}: ${msg[item]}\n`).join('') + '\n';

    res.write(content);
  };

  emitter.on('usermessage', handler);

  res.on('close', () => {
    console.log('close connection.');
    emitter.off('usermessage', handler);
    clearInterval(pusher);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
