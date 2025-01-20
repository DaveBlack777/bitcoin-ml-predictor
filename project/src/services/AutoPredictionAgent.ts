import { MLService } from './MLService';
import { DataService } from './DataService';
import { supabaseWithRetry } from '../lib/supabase';

export class AutoPredictionAgent {
  private readonly TRAINING_INTERVAL = 6 * 60 * 60 * 1000; // 6 godzin
  private isTraining: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private mlService: MLService;
  private dataService: DataService;

  constructor() {
    this.mlService = new MLService();
    this.dataService = new DataService();
  }

  public async startAutonomousOperation() {
    try {
      // Inicjalizacja stanu agenta jeśli nie istnieje
      const { data: agentState } = await supabaseWithRetry
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor');

      if (!agentState || agentState.length === 0) {
        await supabaseWithRetry
          .from('agent_state')
          .insert({
            agent_id: 'bitcoin_predictor',
            training_count: 0,
            last_training_time: null,
            accuracy: 0
          });
      }

      // Sprawdź czy trening jest potrzebny od razu
      await this.checkAndStartTraining();

      // Ustaw interval do regularnego sprawdzania
      this.intervalId = setInterval(() => {
        this.checkAndStartTraining();
      }, 5 * 60 * 1000); // Sprawdzaj co 5 minut
    } catch (error) {
      console.error('Błąd podczas inicjalizacji agenta:', error);
      await this.logError('initialization', error);
    }
  }

  private async checkAndStartTraining() {
    try {
      const shouldTrain = await this.shouldStartTraining();
      if (shouldTrain) {
        await this.startTraining();
      }
    } catch (error) {
      console.error('Błąd podczas sprawdzania treningu:', error);
      await this.logError('check_training', error);
    }
  }

  private async shouldStartTraining(): Promise<boolean> {
    try {
      if (this.isTraining) return false;

      const { data } = await supabaseWithRetry
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor');

      if (!data?.[0]?.last_training_time) return true;

      const lastTrainingTime = new Date(data[0].last_training_time);
      const timeSinceLastTraining = Date.now() - lastTrainingTime.getTime();

      return timeSinceLastTraining >= this.TRAINING_INTERVAL;
    } catch (error) {
      console.error('Błąd podczas sprawdzania czasu treningu:', error);
      await this.logError('check_training', error);
      return false;
    }
  }

  public async startTraining() {
    if (this.isTraining) {
      console.log('Trening już trwa');
      return;
    }

    try {
      this.isTraining = true;
      await this.mlService.initialize();

      const historicalData = await this.dataService.fetchHistoricalData();
      const accuracy = await this.mlService.train(historicalData);
      await this.mlService.saveModel();
      const predictions = await this.mlService.getPredictions(historicalData);

      const { data: currentState } = await supabaseWithRetry
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor');

      const trainingCount = (currentState?.[0]?.training_count || 0) + 1;

      await supabaseWithRetry
        .from('training_results')
        .insert({
          training_id: trainingCount,
          accuracy,
          predictions: predictions.map(p => ({
            date: p.date.toISOString(),
            price: p.price
          }))
        });

      await supabaseWithRetry
        .from('agent_state')
        .upsert({
          agent_id: 'bitcoin_predictor',
          training_count: trainingCount,
          last_training_time: new Date().toISOString(),
          accuracy
        });

    } catch (error) {
      console.error('Błąd podczas treningu:', error);
      await this.logError('training', error);
    } finally {
      this.isTraining = false;
    }
  }

  private async logError(context: string, error: any) {
    try {
      await supabaseWithRetry
        .from('error_logs')
        .insert({
          context,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          error_stack: error instanceof Error ? error.stack : '',
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Błąd podczas logowania błędu:', logError);
    }
  }

  public cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}