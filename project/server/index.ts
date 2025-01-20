import express from 'express';
import cors from 'cors';
import { AutoPredictionAgent } from './AutoPredictionAgent';
import { supabase } from '../src/lib/supabase';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicjalizacja agenta
const agent = new AutoPredictionAgent();

// Endpoint do sprawdzania statusu
app.get('/api/status', async (req, res) => {
  try {
    const { data: agentState } = await supabase
      .from('agent_state')
      .select('*')
      .eq('agent_id', 'bitcoin_predictor')
      .single();

    res.json(agentState);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania statusu' });
  }
});

// Endpoint do ręcznego wywołania treningu
app.post('/api/train', async (req, res) => {
  try {
    await agent.startTraining();
    res.json({ message: 'Trening rozpoczęty' });
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas rozpoczynania treningu' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Rozpocznij autonomiczne operacje agenta
  agent.startAutonomousOperation();
});

// Obsługa zamykania
process.on('SIGTERM', () => {
  agent.cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  agent.cleanup();
  process.exit(0);
});