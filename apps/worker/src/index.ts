import dotenv from 'dotenv';
import { Worker } from './worker';
import { startRecoveryLoop } from './recovery';
import { startSchedulerLoop } from './scheduler';

dotenv.config();

const workerName = process.env.WORKER_NAME || `worker-${Math.random().toString(36).substring(7)}`;
const pollIntervalMs = parseInt(process.env.POLL_INTERVAL_MS || '1000', 10);

const worker = new Worker(workerName, pollIntervalMs);

const start = async () => {
  console.log('Initializing JobFlow Worker...');
  
  worker.start();
  startRecoveryLoop();
  startSchedulerLoop();

  console.log('Worker is fully operational.');
};

start().catch(console.error);

process.on('SIGINT', () => {
  console.log('Gracefully shutting down worker...');
  worker.stop();
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('Gracefully shutting down worker...');
  worker.stop();
  process.exit(0);
});
