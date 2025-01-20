import express from 'express';
import cors from 'cors';
import { AutoPredictionAgent } from './AutoPredictionAgent';
import { supabase } from '../src/lib/supabase';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicjalizacja agenta jako singleton
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

// Uruchom serwer i rozpocznij autonomiczne operacje agenta
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Rozpocznij autonomiczne operacje agenta
  agent.startAutonomousOperation().catch(error => {
    console.error('Błąd podczas uruchamiania agenta:', error);
  });
});

// Obsługa zamykania
process.on('SIGTERM', () => {
  console.log('Otrzymano sygnał SIGTERM - zamykanie aplikacji...');
  agent.cleanup();
  server.close(() => {
    console.log('Serwer został zamknięty');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Otrzymano sygnał SIGINT - zamykanie aplikacji...');
  agent.cleanup();
  server.close(() => {
    console.log('Serwer został zamknięty');
    process.exit(0);
  });
});