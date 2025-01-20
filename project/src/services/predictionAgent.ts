import * as tf from '@tensorflow/tfjs';
import { supabase } from '../lib/supabase';

export class PredictionAgent {
  private model: tf.LayersModel | null = null;
  private historicalData: number[][] = [];
  private windowSize = 14;
  private learningRate = 0.001;
  private maxRetries = 3;
  private retryDelay = 5000;

  private async retry<T>(operation: () => Promise<T>, retries = this.maxRetries): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  private async fetchWithTimeout(url: string, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Błąd API: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Przekroczono limit czasu zapytania');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async getHistoricalData() {
    try {
      // Najpierw spróbuj pobrać z Supabase
      const { data: savedData, error: supabaseError } = await supabase
        .from('historical_data')
        .select('*')
        .eq('cryptocurrency', 'bitcoin')
        .order('timestamp', { ascending: true })
        .limit(90);

      if (supabaseError) {
        throw supabaseError;
      }

      if (savedData && savedData.length > 0) {
        this.historicalData = savedData.map(d => [new Date(d.timestamp).getTime(), d.price]);
        return this.historicalData;
      }

      // Jeśli nie ma w bazie, pobierz z API
      const response = await this.retry(async () => {
        const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=90&interval=daily`;
        return this.fetchWithTimeout(url);
      });

      if (!response?.prices || !Array.isArray(response.prices)) {
        throw new Error('Nieprawidłowy format danych z API');
      }

      this.historicalData = response.prices;

      // Zapisz do Supabase
      const dataToSave = this.historicalData.map(([timestamp, price]) => ({
        cryptocurrency: 'bitcoin',
        timestamp: new Date(timestamp),
        price: price
      }));

      const { error: insertError } = await supabase
        .from('historical_data')
        .insert(dataToSave);

      if (insertError) {
        console.error('Błąd podczas zapisywania do bazy:', insertError);
      }

      return this.historicalData;
    } catch (error: any) {
      console.error('Błąd podczas pobierania danych:', error);
      throw new Error('Nie udało się pobrać danych historycznych: ' + error.message);
    }
  }

  public async predictFutureDays(days: number): Promise<{ date: Date; price: number }[]> {
    if (!this.historicalData.length) {
      throw new Error('Brak danych historycznych');
    }

    const predictions: { date: Date; price: number }[] = [];
    const lastPrice = this.historicalData[this.historicalData.length - 1][1];
    
    try {
      // Generuj wszystkie predykcje najpierw
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const price = lastPrice * (1 + (Math.random() * 0.02 - 0.01)); // +/- 1%
        predictions.push({ date, price });
      }

      // Przygotuj dane do zapisu
      const predictionsToSave = predictions.map(pred => ({
        cryptocurrency: 'bitcoin',
        timestamp: pred.date,
        predicted_price: pred.price,
        actual_price: lastPrice
      }));

      // Zapisz wszystkie predykcje w jednej operacji
      const { error: insertError } = await supabase
        .from('predictions')
        .insert(predictionsToSave);

      if (insertError) {
        // Loguj błąd, ale nie przerywaj działania aplikacji
        console.error('Błąd podczas zapisywania predykcji:', insertError);
      }

      return predictions;
    } catch (error: any) {
      console.error('Błąd podczas generowania predykcji:', error);
      // Zwróć wygenerowane predykcje nawet jeśli zapis do bazy się nie powiódł
      return predictions;
    }
  }

  public async train(): Promise<void> {
    if (!this.historicalData.length) {
      throw new Error('Brak danych do treningu');
    }
    
    try {
      // Symulacja treningu
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error('Błąd podczas treningu:', error);
      throw new Error('Nie udało się przeprowadzić treningu: ' + error.message);
    }
  }
}