const { spawn } = require('child_process');

console.log('Starting development servers...');

// Start the API server
const apiServer = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'pipe',
  env: { ...process.env, PORT: '3001' }
});

apiServer.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

// Start Vite frontend (delay to ensure API server starts first)
setTimeout(() => {
  const viteServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });

  viteServer.on('close', (code) => {
    console.log(`Vite server exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
  });
}, 2000);

apiServer.on('close', (code) => {
  console.log(`API server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  apiServer.kill();
  process.exit(0);
});
