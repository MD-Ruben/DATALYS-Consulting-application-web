import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import next from 'next';
import compression from 'compression';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req: IncomingMessage, res: ServerResponse) => {
    // Compression middleware
    compression()(req as any, res as any, () => {
      // Parsing the request URL
      const parsedUrl = parse(req.url || '', true);
      // Handling the request with Next.js
      handle(req, res, parsedUrl);
    });
  }).listen(port, (err?: Error) => {
    if (err) {
      console.error('Erreur lors du démarrage du serveur:', err);
    } else {
      console.log(
        `> Server listening at http://localhost:${port} in ${
          dev ? 'development' : process.env.NODE_ENV
        } mode`
      );
    }
  });
});