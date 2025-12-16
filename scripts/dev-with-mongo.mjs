import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';

async function start() {
  console.log("Starting MongoDB Memory Server...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  console.log(`MongoDB started at: ${uri}`);
  console.log("Starting Next.js...");

  // Start Next.js with the URI
  // We use --webpack flag as we discovered earlier
  const next = spawn('npm', ['run', 'dev', '--', '--webpack'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGODB_URI: uri,
      ADMIN_EMAILS: 'admin@example.com',
      NEXTAUTH_SECRET: 'secret',
      NEXTAUTH_URL: 'http://localhost:3000'
    },
    shell: true
  });

  next.on('close', async (code) => {
    console.log(`Next.js process exited with code ${code}`);
    await mongod.stop();
  });

  // Handle termination
  process.on('SIGINT', async () => {
    await mongod.stop();
    process.exit();
  });
}

start();
