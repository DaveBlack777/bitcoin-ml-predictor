// Zmodyfikuj importy
import { supabaseWithRetry } from '../lib/supabase';

// Zmodyfikuj funkcję fetchPredictions
const fetchPredictions = useCallback(async () => {
  try {
    const { data: latestTraining, error: trainingError } = await supabaseWithRetry
      .from('training_results')
      .select('*');

    if (trainingError && trainingError.code !== 'PGRST116') {
      throw trainingError;
    }

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

// Zmodyfikuj funkcję fetchHistoricalData
const fetchHistoricalData = useCallback(async () => {
  try {
    const { data: historical, error: historicalError } = await supabaseWithRetry
      .from('historical_data')
      .select('*');

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