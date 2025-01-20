import * as tf from '@tensorflow/tfjs';
import { supabase } from '../lib/supabase';

export class MLModel {
  private model: tf.LayersModel | null = null;
  private readonly sequenceLength = 30; // 30 dni danych historycznych
  private readonly features = 1; // cena jako feature
  private readonly outputSize = 7; // predykcja na 7 dni
  
  constructor() {
    this.initializeModel();
  }

  private initializeModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          inputShape: [this.sequenceLength, this.features],
          returnSequences: true
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: this.outputSize,
          activation: 'linear'
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });
  }

  private async preprocessData(data: number[][]): Promise<{
    trainX: tf.Tensor3D,
    trainY: tf.Tensor2D
  }> {
    const sequences: number[][][] = [];
    const targets: number[][] = [];

    for (let i = 0; i < data.length - this.sequenceLength - this.outputSize; i++) {
      const sequence = data.slice(i, i + this.sequenceLength)
        .map(d => [d[1]]); // Bierzemy tylko cenę
      
      const target = data.slice(i + this.sequenceLength, i + this.sequenceLength + this.outputSize)
        .map(d => d[1]);
      
      sequences.push(sequence);
      targets.push(target);
    }

    // Normalizacja danych
    const flatPrices = data.map(d => d[1]);
    const min = Math.min(...flatPrices);
    const max = Math.max(...flatPrices);
    
    const normalizedSequences = sequences.map(seq =>
      seq.map(price => [(price[0] - min) / (max - min)])
    );
    
    const normalizedTargets = targets.map(target =>
      target.map(price => (price - min) / (max - min))
    );

    return {
      trainX: tf.tensor3d(normalizedSequences),
      trainY: tf.tensor2d(normalizedTargets)
    };
  }

  public async train(epochs: number = 50, batchSize: number = 32): Promise<tf.History> {
    try {
      const { data: historicalData, error } = await supabase
        .from('historical_data')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const formattedData = historicalData.map(d => [
        new Date(d.timestamp).getTime(),
        d.price
      ]);

      const { trainX, trainY } = await this.preprocessData(formattedData);

      const history = await this.model!.fit(trainX, trainY, {
        epochs,
        batchSize,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}`);
            await this.saveTrainingProgress(epoch, logs);
          }
        }
      });

      // Zwolnij pamięć
      trainX.dispose();
      trainY.dispose();

      return history;
    } catch (error) {
      console.error('Błąd podczas treningu:', error);
      throw error;
    }
  }

  private async saveTrainingProgress(epoch: number, logs: tf.Logs | undefined) {
    try {
      await supabase.from('training_progress').insert({
        epoch,
        loss: logs?.loss,
        val_loss: logs?.val_loss,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Błąd podczas zapisywania postępu:', error);
    }
  }

  public async predict(days: number = 7): Promise<{ date: Date; price: number }[]> {
    if (!this.model) {
      throw new Error('Model nie został zainicjalizowany');
    }

    try {
      const { data: historicalData, error } = await supabase
        .from('historical_data')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(this.sequenceLength);

      if (error) throw error;

      const formattedData = historicalData.map(d => [
        new Date(d.timestamp).getTime(),
        d.price
      ]);

      const { trainX } = await this.preprocessData(formattedData);
      
      const prediction = this.model.predict(trainX) as tf.Tensor;
      const predictionData = await prediction.array() as number[][];

      // Zwolnij pamięć
      trainX.dispose();
      prediction.dispose();

      // Denormalizacja i formatowanie wyników
      const lastDate = new Date(historicalData[historicalData.length - 1].timestamp);
      const predictions = predictionData[0].map((price, index) => {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + index + 1);
        return { date, price };
      });

      return predictions;
    } catch (error) {
      console.error('Błąd podczas generowania predykcji:', error);
      throw error;
    }
  }

  public async saveModel() {
    if (!this.model) return;
    
    try {
      const modelJSON = this.model.toJSON();
      await supabase.from('models').insert({
        model_data: modelJSON,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
    } catch (error) {
      console.error('Błąd podczas zapisywania modelu:', error);
      throw error;
    }
  }

  public async loadModel() {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return false;

      const modelJSON = data[0].model_data;
      this.model = await tf.models.modelFromJSON(modelJSON);
      return true;
    } catch (error) {
      console.error('Błąd podczas ładowania modelu:', error);
      throw error;
    }
  }
}