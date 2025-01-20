import * as tf from '@tensorflow/tfjs';
import { supabaseWithRetry } from '../lib/supabase';

export class MLService {
  private model: tf.LayersModel | null = null;
  private isTraining: boolean = false;
  private readonly windowSize = 30;
  private readonly predictionDays = 7;
  private modelAccuracy: number = 0;
  private lastPredictions: { date: Date; price: number }[] = [];

  constructor() {
    // Usuwamy automatyczną inicjalizację w konstruktorze
  }

  public async initialize(): Promise<void> {
    try {
      if (this.model) {
        this.model.dispose();
      }

      // Upewnij się, że TensorFlow.js jest gotowy
      await tf.ready();

      // Spróbuj załadować zapisany model
      const modelLoaded = await this.loadModel();

      // Jeśli nie udało się załadować modelu, stwórz nowy
      if (!modelLoaded) {
        console.log('Tworzenie nowego modelu...');
        this.model = tf.sequential({
          layers: [
            tf.layers.lstm({
              units: 50,
              returnSequences: true,
              inputShape: [this.windowSize, 1]
            }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.lstm({
              units: 50,
              returnSequences: false
            }),
            tf.layers.dense({ units: this.predictionDays })
          ]
        });

        this.model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'meanSquaredError',
          metrics: ['mse']
        });
      } else {
        console.log('Model załadowany z bazy danych');
      }
    } catch (error) {
      console.error('Błąd podczas inicjalizacji modelu:', error);
      await this.logError('initialize', error);
      throw error;
    }
  }

  private async logError(context: string, error: any) {
    try {
      await supabaseWithRetry.from('error_logs').insert({
        context,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_stack: error instanceof Error ? error.stack : '',
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Błąd podczas logowania błędu:', logError);
    }
  }

  public async saveModel() {
    if (!this.model) return;
    
    try {
      const modelJSON = this.model.toJSON();
      const { error } = await supabaseWithRetry.from('models').insert({
        cryptocurrency: 'bitcoin',
        model_data: modelJSON,
        accuracy: this.modelAccuracy,
        version: '1.0',
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      console.log('Model zapisany pomyślnie');
    } catch (error) {
      console.error('Błąd podczas zapisywania modelu:', error);
      await this.logError('save_model', error);
    }
  }

  public async loadModel(): Promise<boolean> {
    try {
      const { data, error } = await supabaseWithRetry
        .from('models')
        .order('updated_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.log('Brak zapisanego modelu w bazie');
        return false;
      }

      const latestModel = data[0];
      this.model = await tf.models.modelFromJSON(latestModel.model_data);
      this.modelAccuracy = latestModel.accuracy || 0;
      return true;
    } catch (error) {
      console.error('Błąd podczas ładowania modelu:', error);
      await this.logError('load_model', error);
      return false;
    }
  }

  // ... reszta metod pozostaje bez zmian
}