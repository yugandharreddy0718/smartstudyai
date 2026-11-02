import http from 'http';
import https from 'https';
import net from 'net';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function isPortInUse(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export function findProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr LISTENING | findstr :${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split(/\r?\n/);
      const pids = [];
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) pids.push(Number(pid));
      }
      return [...new Set(pids)];
    } else {
      const output = execSync(`lsof -t -i :${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      return output.trim().split(/\n/).map(p => Number(p)).filter(Boolean);
    }
  } catch (e) {
    return [];
  }
}

export function killProcessTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch (e) {
        process.kill(pid, 'SIGKILL');
      }
    }
  } catch (e) {
    // Process might already be dead
  }
}

export function probeEndpoint(urlStr, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https') ? https : http;
    const req = client.get(urlStr, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout probing ${urlStr}`));
    });
  });
}

export async function startManagedFrontendServer({
  port = 5173,
  host = '127.0.0.1',
  timeoutMs = 30000,
  logFilePath = path.resolve(rootDir, 'reports/frontend-server.log')
} = {}) {
  const baseUrl = `http://${host}:${port}`;
  console.log(`[ManagedServer] Checking port ${port}...`);

  // 1. Check if server is already responding and healthy
  try {
    const probe = await probeEndpoint(`${baseUrl}/`);
    if (probe.statusCode === 200 || probe.statusCode === 304) {
      console.log(`[ManagedServer] Existing healthy frontend found at ${baseUrl}`);
      return {
        baseUrl,
        port,
        isExisting: true,
        stop: () => {},
        getLogs: () => 'Existing server running.'
      };
    }
  } catch (e) {
    // Expected if server is offline
  }

  // 2. Check if port is occupied by another process that is NOT responding
  const inUse = await isPortInUse(port, host);
  if (inUse) {
    const occupyingPids = findProcessOnPort(port);
    throw new Error(
      `Port ${port} is occupied by process(es): [${occupyingPids.join(', ')}] but not responding with HTTP 200.\n` +
      `Please stop the lingering process on port ${port} before starting the test server.`
    );
  }

  // 3. Ensure reports directory exists for logs
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  const logStream = fs.createWriteStream(logFilePath, { flags: 'w' });

  console.log(`[ManagedServer] Spawning Vite dev server on ${baseUrl} (strictPort: true)...`);
  const logsBuffer = [];

  const env = {
    ...process.env,
    PORT: String(port),
    VITE_PORT: String(port),
    HOST: host,
    LOCAL_TEST: 'true',
    DISABLE_HMR: 'true'
  };

  const serverProcess = spawn('npx', ['vite', '--port', String(port), '--host', host, '--strictPort'], {
    cwd: path.resolve(rootDir, 'web'),
    shell: true,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const appendLog = (chunk, streamName) => {
    const str = chunk.toString();
    logsBuffer.push(str);
    if (logsBuffer.length > 200) logsBuffer.shift();
    logStream.write(`[${streamName}] ${str}`);
  };

  serverProcess.stdout.on('data', (d) => appendLog(d, 'STDOUT'));
  serverProcess.stderr.on('data', (d) => appendLog(d, 'STDERR'));

  let stopped = false;
  const stopServer = () => {
    if (stopped) return;
    stopped = true;
    console.log(`[ManagedServer] Stopping frontend test server (PID: ${serverProcess.pid})...`);
    killProcessTree(serverProcess.pid);
    try { logStream.end(); } catch (e) {}
  };

  // Safe process exit handlers
  const cleanup = () => stopServer();
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // 4. Wait for readiness
  const startTime = Date.now();
  console.log(`[ManagedServer] Waiting for frontend readiness at ${baseUrl}...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const probeHome = await probeEndpoint(`${baseUrl}/`);
      if (probeHome.statusCode === 200 || probeHome.statusCode === 304) {
        // Also check login route
        const probeLogin = await probeEndpoint(`${baseUrl}/login`);
        if (probeLogin.statusCode === 200 || probeLogin.statusCode === 304) {
          console.log(`[ManagedServer] Frontend healthy! (Home: ${probeHome.statusCode}, Login: ${probeLogin.statusCode})`);
          return {
            baseUrl,
            port,
            pid: serverProcess.pid,
            isExisting: false,
            stop: stopServer,
            getLogs: () => logsBuffer.join('')
          };
        }
      }
    } catch (err) {
      // Still booting up
    }
    await new Promise(r => setTimeout(r, 800));
  }

  // If timed out, terminate and report captured logs
  stopServer();
  const capturedOutput = logsBuffer.join('');
  throw new Error(
    `[ManagedServer] Frontend server failed to become ready at ${baseUrl} within ${timeoutMs}ms.\n` +
    `Captured Vite logs:\n${capturedOutput || '(No output produced by Vite)'}`
  );
}

export async function canBindPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

export async function findAvailablePort(startPort = 3001, host = '127.0.0.1') {
  let p = startPort;
  while (p < startPort + 50) {
    const inUse = await isPortInUse(p, host);
    if (!inUse) {
      const bindable = await canBindPort(p, host);
      if (bindable) return p;
    }
    p++;
  }
  return startPort;
}

export async function startManagedBackendServer({
  port = Number(process.env.BACKEND_PORT) || 3001,
  host = '127.0.0.1',
  timeoutMs = 20000,
  logFilePath = path.resolve(rootDir, 'reports/backend-server.log')
} = {}) {
  // If the requested port is not bindable (e.g. Windows reserved port 3000), discover an available port
  let targetPort = port;
  const initialBindable = await canBindPort(targetPort, host);
  if (!initialBindable) {
    console.log(`[ManagedServer] Port ${targetPort} is occupied or reserved on this OS. Resolving next open port...`);
    targetPort = await findAvailablePort(targetPort + 1, host);
    console.log(`[ManagedServer] Selected available backend port: ${targetPort}`);
  }

  const baseUrl = `http://${host}:${targetPort}`;
  console.log(`[ManagedServer] Checking backend API on port ${targetPort}...`);

  // Check if already healthy
  try {
    const probe = await probeEndpoint(`${baseUrl}/health`);
    if (probe.statusCode === 200) {
      console.log(`[ManagedServer] Existing healthy backend found at ${baseUrl}/health`);
      return {
        baseUrl,
        port: targetPort,
        isExisting: true,
        stop: () => {},
        getLogs: () => 'Existing backend running.'
      };
    }
  } catch (e) {}

  const inUse = await isPortInUse(targetPort, host);
  if (inUse) {
    const occupyingPids = findProcessOnPort(targetPort);
    throw new Error(`Port ${targetPort} occupied by process(es): [${occupyingPids.join(', ')}]`);
  }

  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  const logStream = fs.createWriteStream(logFilePath, { flags: 'w' });

  console.log(`[ManagedServer] Spawning backend API server on ${baseUrl}...`);
  const logsBuffer = [];

  const env = {
    ...process.env,
    PORT: String(targetPort),
    NODE_ENV: 'test'
  };

  // Use built dist if available, else tsx
  const backendDistPath = path.resolve(rootDir, 'backend/dist/server.js');
  const useDist = fs.existsSync(backendDistPath);

  const command = useDist ? 'node' : 'npx';
  const args = useDist ? ['dist/server.js'] : ['tsx', 'src/server.ts'];

  const serverProcess = spawn(command, args, {
    cwd: path.resolve(rootDir, 'backend'),
    shell: true,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const appendLog = (chunk, streamName) => {
    const str = chunk.toString();
    logsBuffer.push(str);
    logStream.write(`[${streamName}] ${str}`);
  };

  serverProcess.stdout.on('data', (d) => appendLog(d, 'STDOUT'));
  serverProcess.stderr.on('data', (d) => appendLog(d, 'STDERR'));

  let stopped = false;
  const stopServer = () => {
    if (stopped) return;
    stopped = true;
    console.log(`[ManagedServer] Stopping backend test server (PID: ${serverProcess.pid})...`);
    killProcessTree(serverProcess.pid);
    try { logStream.end(); } catch (e) {}
  };

  process.on('exit', stopServer);
  process.on('SIGINT', stopServer);
  process.on('SIGTERM', stopServer);

  const startTime = Date.now();
  console.log(`[ManagedServer] Waiting for backend readiness at ${baseUrl}/health...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const probe = await probeEndpoint(`${baseUrl}/health`);
      if (probe.statusCode === 200) {
        console.log(`[ManagedServer] Backend API healthy! Status: 200 at ${baseUrl}/health`);
        return {
          baseUrl,
          port: targetPort,
          pid: serverProcess.pid,
          isExisting: false,
          stop: stopServer,
          getLogs: () => logsBuffer.join('')
        };
      }
    } catch (err) {}
    await new Promise(r => setTimeout(r, 600));
  }

  stopServer();
  throw new Error(`[ManagedServer] Backend failed to start at ${baseUrl}/health within ${timeoutMs}ms.`);
}
