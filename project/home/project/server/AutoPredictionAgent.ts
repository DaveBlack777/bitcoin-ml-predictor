import { MLService } from './MLService';
import { DataService } from './DataService';
import { supabase } from '../src/lib/supabase';

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
      console.log('Rozpoczynanie autonomicznej operacji agenta...');
      
      // Inicjalizacja stanu agenta jeśli nie istnieje
      const { data: agentState } = await supabase
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor')
        .single();

      if (!agentState) {
        await supabase
          .from('agent_state')
          .insert({
            agent_id: 'bitcoin_predictor',
            training_count: 0,
            last_training_time: null,
            accuracy: 0
          });
      }

      // Inicjalizacja modelu ML
      await this.mlService.initialize();

      // Sprawdź czy trening jest potrzebny od razu
      await this.checkAndStartTraining();

      // Ustaw interval do regularnego sprawdzania
      this.intervalId = setInterval(() => {
        this.checkAndStartTraining().catch(error => {
          console.error('Błąd podczas regularnego sprawdzania treningu:', error);
          this.logError('check_training', error);
        });
      }, 5 * 60 * 1000); // Sprawdzaj co 5 minut

      console.log('Agent został pomyślnie uruchomiony');
    } catch (error) {
      console.error('Błąd podczas inicjalizacji agenta:', error);
      await this.logError('initialization', error);
      throw error;
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
      if (this.isTraining) {
        console.log('Trening już trwa - pomijanie sprawdzania');
        return false;
      }

      const { data } = await supabase
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor')
        .single();

      if (!data?.last_training_time) {
        console.log('Brak poprzedniego treningu - rozpoczynanie pierwszego treningu');
        return true;
      }

      const lastTrainingTime = new Date(data.last_training_time);
      const timeSinceLastTraining = Date.now() - lastTrainingTime.getTime();

      const shouldTrain = timeSinceLastTraining >= this.TRAINING_INTERVAL;
      if (shouldTrain) {
        console.log('Upłynął wymagany czas - rozpoczynanie nowego treningu');
      } else {
        console.log('Za wcześnie na kolejny trening');
      }

      return shouldTrain;
    } catch (error) {
      console.error('Błąd podczas sprawdzania czasu treningu:', error);
      await this.logError('check_training_time', error);
      return false;
    }
  }

  public async startTraining() {
    if (this.isTraining) {
      console.log('Trening już trwa');
      return;
    }

    try {
      console.log('Rozpoczynanie treningu...');
      this.isTraining = true;

      const historicalData = await this.dataService.fetchHistoricalData();
      console.log(`Pobrano ${historicalData.length} rekordów danych historycznych`);

      const accuracy = await this.mlService.train(historicalData);
      console.log(`Trening zakończony z dokładnością: ${accuracy}%`);

      await this.mlService.saveModel();
      console.log('Model został zapisany');

      const predictions = await this.mlService.getPredictions(historicalData);
      console.log(`Wygenerowano ${predictions.length} predykcji`);

      const { data: currentState } = await supabase
        .from('agent_state')
        .eq('agent_id', 'bitcoin_predictor')
        .single();

      const trainingCount = (currentState?.training_count || 0) + 1;

      // Zapisz wyniki treningu
      await supabase
        .from('training_results')
        .insert({
          accuracy,
          predictions: predictions.map(p => ({
            date: p.date.toISOString(),
            price: p.price
          }))
        });

      // Aktualizuj stan agenta
      await supabase
        .from('agent_state')
        .upsert({
          agent_id: 'bitcoin_predictor',
          training_count: trainingCount,
          last_training_time: new Date().toISOString(),
          accuracy
        });

      console.log('Trening został pomyślnie zakończony i zapisany');
    } catch (error) {
      console.error('Błąd podczas treningu:', error);
      await this.logError('training', error);
    } finally {
      this.isTraining = false;
    }
  }

  private async logError(context: string, error: any) {
    try {
      await supabase
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
    console.log('Czyszczenie zasobów agenta...');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}