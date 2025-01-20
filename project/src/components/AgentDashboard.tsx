import { useEffect, useState, useCallback } from 'react';
import { supabaseWithRetry } from '../lib/supabase';
import { PredictionChart } from './PredictionChart';
import { PredictionsTable } from './PredictionsTable';
import { TrainingProgress } from './TrainingProgress';
import { ErrorLogs } from './ErrorLogs';

interface HistoricalData {
  timestamp: string;
  price: number;
  cryptocurrency: string;
}

interface AgentState {
  training_count: number;
  last_training_time: string | null;
  accuracy: number;
}

export function AgentDashboard() {
  const [status, setStatus] = useState<{
    trainingCount: number;
    lastTrainingTime: string | null;
    accuracy: number;
    isTraining: boolean;
  } | null>(null);
  
  const [predictions, setPredictions] = useState<{
    date: Date;
    price: number;
  }[]>([]);

  const [historicalData, setHistoricalData] = useState<{
    date: Date;
    price: number;
  }[]>([]);

  const [chartViewMode, setChartViewMode] = useState<'historical' | 'prediction'>('historical');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = useCallback(async () => {
    try {
      const { data: latestTraining, error: trainingError } = await supabaseWithRetry
        .from('training_results')
        .order('timestamp', { ascending: false });

      if (trainingError) throw trainingError;

      if (latestTraining && latestTraining.length > 0) {
        const latest = latestTraining[0];
        setPredictions(latest.predictions.map((p: any) => ({
          date: new Date(p.date),
          price: p.price
        })));
      }
    } catch (error) {
      console.error('Błąd podczas pobierania predykcji:', error);
    }
  }, []);

  const fetchHistoricalData = useCallback(async () => {
    try {
      const { data: historical, error: historicalError } = await supabaseWithRetry
        .from('historical_data')
        .order('timestamp', { ascending: true });

      if (historicalError) throw historicalError;

      if (historical) {
        const uniqueHistorical = historical.reduce((acc: HistoricalData[], curr) => {
          const date = new Date(curr.timestamp).toDateString();
          const existingIndex = acc.findIndex(item => 
            new Date(item.timestamp).toDateString() === date
          );
          
          if (existingIndex >= 0) {
            if (new Date(curr.timestamp) > new Date(acc[existingIndex].timestamp)) {
              acc[existingIndex] = curr;
            }
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);

        setHistoricalData(uniqueHistorical.map(h => ({
          date: new Date(h.timestamp),
          price: h.price
        })));
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych historycznych:', error);
      throw error;
    }
  }, []);

  const fetchAgentState = useCallback(async () => {
    try {
      const { data: agentState, error: agentError } = await supabaseWithRetry
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor');

      if (agentError) throw agentError;

      if (agentState && agentState.length > 0) {
        setStatus({
          trainingCount: agentState[0].training_count || 0,
          lastTrainingTime: agentState[0].last_training_time,
          accuracy: agentState[0].accuracy || 0,
          isTraining: false
        });
      }
    } catch (error) {
      console.error('Błąd podczas pobierania stanu agenta:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchHistoricalData(),
          fetchPredictions(),
          fetchAgentState()
        ]);
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
        setError('Wystąpił problem z połączeniem. Spróbuj odświeżyć stronę.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // Odświeżaj co minutę
    return () => clearInterval(interval);
  }, [fetchHistoricalData, fetchPredictions, fetchAgentState]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Ładowanie danych...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">Bitcoin AI Predictor</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Liczba treningów</h3>
              <div className="text-2xl font-bold text-blue-600">
                {status?.trainingCount || 0}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Dokładność modelu</h3>
              <div className="text-2xl font-bold text-green-600">
                {(status?.accuracy || 0).toFixed(2)}%
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Ostatni trening</h3>
              <div className="text-lg font-bold text-purple-600">
                {status?.lastTrainingTime 
                  ? new Date(status.lastTrainingTime).toLocaleString('pl-PL')
                  : 'Brak'}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Status</h3>
              <div className="text-lg font-bold text-orange-600">
                {status?.isTraining ? 'Trening w toku' : 'Gotowy'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Wykres Bitcoin</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartViewMode('historical')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  chartViewMode === 'historical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Widok historyczny
              </button>
              <button
                onClick={() => setChartViewMode('prediction')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  chartViewMode === 'prediction'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tylko predykcja
              </button>
            </div>
          </div>
          <PredictionChart
            historicalData={historicalData}
            predictions={predictions}
            viewMode={chartViewMode}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Szczegółowe predykcje</h2>
          <PredictionsTable predictions={predictions} />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Logi błędów</h2>
          <ErrorLogs />
        </div>
      </div>
    </div>
  );
}