"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const startServer = async () => {
  try {
    await app.prepare();
    
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    })
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying another port...`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? 'development' : process.env.NODE_ENV
        }`
      );
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
