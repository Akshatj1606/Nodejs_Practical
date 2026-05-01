const http = require('http');
const fs = require('fs');
const os = require('os');
const url = require('url');
const path = require('path');

const PORT = 3000;
const VISITORS_LOG = path.join(__dirname, 'visitors.log');
const BACKUP_LOG = path.join(__dirname, 'backup.log');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Helper function to set response headers
  const setHeaders = (statusCode = 200, contentType = 'text/plain') => {
    res.writeHead(statusCode, { 'Content-Type': contentType });
  };

  // Route: GET /updateUser - Append visitor entry with timestamp
  if (method === 'GET' && pathname === '/updateUser') {
    const timestamp = new Date().toISOString();
    const visitorEntry = `Visitor logged at: ${timestamp}\n`;

    fs.appendFile(VISITORS_LOG, visitorEntry, (err) => {
      if (err) {
        setHeaders(500);
        res.end('Error appending to visitors.log');
        return;
      }
      setHeaders(200);
      res.end(`Visitor entry added: ${timestamp}`);
    });
  }

  // Route: GET /saveLog - Read and return visitors.log contents
  else if (method === 'GET' && pathname === '/saveLog') {
    fs.readFile(VISITORS_LOG, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          setHeaders(200);
          res.end('visitors.log is empty or does not exist');
          return;
        }
        setHeaders(500);
        res.end('Error reading visitors.log');
        return;
      }
      setHeaders(200);
      res.end(data);
    });
  }

  // Route: POST /backup - Copy visitors.log to backup.log
  else if (method === 'POST' && pathname === '/backup') {
    fs.readFile(VISITORS_LOG, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          setHeaders(200);
          res.end('visitors.log does not exist. Nothing to backup.');
          return;
        }
        setHeaders(500);
        res.end('Error reading visitors.log');
        return;
      }

      fs.writeFile(BACKUP_LOG, data, (writeErr) => {
        if (writeErr) {
          setHeaders(500);
          res.end('Error creating backup.log');
          return;
        }
        setHeaders(200);
        res.end('Backup created successfully. Contents of visitors.log copied to backup.log');
      });
    });
  }

  // Route: GET /clearLog - Clear visitors.log
  else if (method === 'GET' && pathname === '/clearLog') {
    fs.writeFile(VISITORS_LOG, '', (err) => {
      if (err) {
        setHeaders(500);
        res.end('Error clearing visitors.log');
        return;
      }
      setHeaders(200);
      res.end('visitors.log has been cleared');
    });
  }

  // Route: GET /serverInfo - Return system information
  else if (method === 'GET' && pathname === '/serverInfo') {
    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      uptime: `${Math.round(os.uptime())} seconds`,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };

    setHeaders(200, 'application/json');
    res.end(JSON.stringify(systemInfo, null, 2));
  }

  // 404 - Route not found
  else {
    setHeaders(404);
    res.end('404 - Route not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Available routes:`);
  console.log(`  GET /updateUser   - Add visitor entry with timestamp`);
  console.log(`  GET /saveLog      - Read and return visitors.log`);
  console.log(`  POST /backup      - Copy visitors.log to backup.log`);
  console.log(`  GET /clearLog     - Clear visitors.log`);
  console.log(`  GET /serverInfo   - Get system information`);
});
