import { AutoPredictionAgent } from './AutoPredictionAgent';

let agent: AutoPredictionAgent | null = null;
let isInitialized = false;

export async function startBackgroundWorker() {
  if (isInitialized) {
    console.log('Worker już działa');
    return;
  }

  try {
    isInitialized = true;
    agent = new AutoPredictionAgent();
  } catch (error) {
    console.error('Błąd podczas uruchamiania workera:', error);
    isInitialized = false;
  }
}

export function cleanup() {
  if (agent) {
    agent.cleanup();
    agent = null;
  }
  isInitialized = false;
}