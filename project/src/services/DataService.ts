import { supabase } from '../lib/supabase';

interface HistoricalData {
  date: Date;
  price: number;
}

export class DataService {
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minut
  private static readonly HISTORICAL_DAYS = 730; // 2 lata historii
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000; // 2 sekundy
  private lastPrice: { value: number; timestamp: number } | null = null;

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = DataService.MAX_RETRIES): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, DataService.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  public async fetchHistoricalData(): Promise<HistoricalData[]> {
    try {
      // Najpierw spróbuj pobrać z cache'u Supabase
      const { data: cachedData, error: dbError } = await supabase
        .from('historical_data')
        .select('*')
        .order('timestamp', { ascending: true });

      if (cachedData && cachedData.length > 0) {
        return cachedData.map((d: { timestamp: string; price: number }) => ({
          date: new Date(d.timestamp),
          price: d.price
        }));
      }

      // Jeśli nie ma w cache'u, pobierz z API
      const response = await this.fetchWithRetry(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${DataService.HISTORICAL_DAYS}&interval=daily`
      );

      const data = await response.json();
      
      if (!data?.prices || !Array.isArray(data.prices)) {
        throw new Error('Nieprawidłowy format danych z API');
      }

      const formattedData = data.prices.map((entry: [number, number]) => ({
        date: new Date(entry[0]),
        price: entry[1]
      }));

      // Zapisz do cache'u
      try {
        const dataToInsert = formattedData.map((d: HistoricalData) => ({
          cryptocurrency: 'bitcoin',
          timestamp: d.date.toISOString(),
          price: d.price
        }));

        const { error: insertError } = await supabase
          .from('historical_data')
          .insert(dataToInsert);

        if (insertError) {
          console.error('Błąd podczas zapisywania do cache:', insertError);
        }
      } catch (cacheError) {
        console.error('Błąd podczas zapisywania do cache:', cacheError);
      }

      return formattedData;
    } catch (error: any) {
      console.error('Błąd podczas pobierania danych historycznych:', error);
      
      try {
        await supabase.from('error_logs').insert({
          context: 'historical_data_fetch',
          error_message: error.message,
          error_stack: error.stack,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Błąd podczas logowania błędu:', logError);
      }

      return [];
    }
  }

  public async getLatestPrice(): Promise<number | null> {
    try {
      if (
        this.lastPrice &&
        Date.now() - this.lastPrice.timestamp < DataService.CACHE_DURATION
      ) {
        return this.lastPrice.value;
      }

      const response = await this.fetchWithRetry(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );

      const data = await response.json();
      
      if (!data?.bitcoin?.usd) {
        throw new Error('Nieprawidłowy format danych cenowych');
      }

      this.lastPrice = {
        value: data.bitcoin.usd,
        timestamp: Date.now()
      };

      return data.bitcoin.usd;
    } catch (error: any) {
      console.error('Błąd podczas pobierania aktualnej ceny:', error);
      
      try {
        await supabase.from('error_logs').insert({
          context: 'latest_price_fetch',
          error_message: error.message,
          error_stack: error.stack,
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Błąd podczas logowania błędu:', logError);
      }

      return null;
    }
  }
}