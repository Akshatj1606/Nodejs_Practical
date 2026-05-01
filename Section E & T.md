## Part 1: Node.js HTTP Server (Core Modules Only)

Create an HTTP server using only Node.js core modules (no Express, no npm packages). The server must run on **port 3000** and support the following routes:

* **GET /updateUser**
  Append a new visitor entry with the current timestamp to `visitors.log`.

* **GET /saveLog**
  Read and return the full contents of `visitors.log`.

* **POST /backup**
  Copy the contents of `visitors.log` into a new file called `backup.log`.

* **GET /clearLog**
  Clear the contents of `visitors.log`.

* **GET /serverInfo**
  Return system information in JSON format.

