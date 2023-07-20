import express from 'express';
import path from 'path';
import { EventEmitter } from 'node:events';

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
    console.log('an event occurred!', v);
    // res.write(`data: ${new Date()} \n\n`);
    
    let data = 'event: ' + 'update' + '\n';
    data += 'id: ' + 'test123' + '\n';
    data += 'data: ' + new Date().getTime().toString() + '\n';
    data += '\n';

    res.write(data);
  };

  const test = v => {
    const cell = {
      event: 'server-time',
      data: new Date().toTimeString()
    };
    res.write(`data: ${JSON.stringify(cell)} \n\n`);
  };

  emitter.on('usermessage', handler);
  // emitter.on('usermessage', test);

  // res.on('update', () => {
  //   console
  // });

  res.on('close', () => {
    console.log('close connection.');
    emitter.off('usermessage', handler);
    clearInterval(pusher);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});


