import { createServer, type Server } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export const serveDirectory = (
  directory: string,
  port: number,
): Promise<{ server: Server; url: string }> =>
  new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      const urlPath = request.url === "/" ? "/index.html" : (request.url ?? "/index.html");
      const filePath = join(directory, urlPath.split("?")[0]);

      if (!existsSync(filePath)) {
        const indexPath = join(directory, "index.html");
        if (existsSync(indexPath)) {
          response.writeHead(200, { "Content-Type": "text/html" });
          response.end(readFileSync(indexPath));
          return;
        }
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const extension = extname(filePath);
      const contentType = MIME_TYPES[extension] ?? "application/octet-stream";
      response.writeHead(200, { "Content-Type": contentType });
      response.end(readFileSync(filePath));
    });

    server.listen(port, () => {
      resolve({ server, url: `http://localhost:${port}` });
    });

    server.on("error", reject);
  });
