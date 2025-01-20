import { format } from 'date-fns';

export interface TechnicalIndicators {
  sma: number;
  ema: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  obv: number;
  atr: number;
  williamsR: number;
}

export class TechnicalAnalysis {
  // Parametry dla wskaźników
  private readonly smaLength = 20;
  private readonly emaLength = 20;
  private readonly rsiLength = 14;
  private readonly macdParams = {
    fastLength: 12,
    slowLength: 26,
    signalLength: 9
  };
  private readonly bollingerLength = 20;
  private readonly bollingerStdDev = 2;
  private readonly williamsRLength = 14;
  private readonly atrLength = 14;

  // Oblicz Simple Moving Average (SMA)
  private calculateSMA(prices: number[], length: number): number {
    if (prices.length < length) return prices[prices.length - 1];
    const slice = prices.slice(-length);
    return slice.reduce((sum, price) => sum + price, 0) / length;
  }

  // Oblicz Exponential Moving Average (EMA)
  private calculateEMA(prices: number[], length: number): number {
    if (prices.length < length) return prices[prices.length - 1];
    
    const k = 2 / (length + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * k) + (ema * (1 - k));
    }
    
    return ema;
  }

  // Oblicz Relative Strength Index (RSI)
  private calculateRSI(prices: number[], length: number): number {
    if (prices.length < length + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= length; i++) {
      const difference = prices[prices.length - i] - prices[prices.length - i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }

    const avgGain = gains / length;
    const avgLoss = losses / length;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Oblicz MACD
  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const fastEMA = this.calculateEMA(prices, this.macdParams.fastLength);
    const slowEMA = this.calculateEMA(prices, this.macdParams.slowLength);
    const macd = fastEMA - slowEMA;
    
    const macdLine = prices.map((_, i) => {
      const slice = prices.slice(0, i + 1);
      return this.calculateEMA(slice, this.macdParams.fastLength) - 
             this.calculateEMA(slice, this.macdParams.slowLength);
    });
    
    const signal = this.calculateEMA(macdLine, this.macdParams.signalLength);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  // Oblicz Bollinger Bands
  private calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } {
    const middle = this.calculateSMA(prices, this.bollingerLength);
    
    const slice = prices.slice(-this.bollingerLength);
    const stdDev = Math.sqrt(
      slice.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / this.bollingerLength
    );
    
    return {
      upper: middle + (this.bollingerStdDev * stdDev),
      middle,
      lower: middle - (this.bollingerStdDev * stdDev)
    };
  }

  // Oblicz On Balance Volume (OBV)
  private calculateOBV(prices: number[], volumes: number[]): number {
    let obv = volumes[0];
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) {
        obv += volumes[i];
      } else if (prices[i] < prices[i - 1]) {
        obv -= volumes[i];
      }
    }
    
    return obv;
  }

  // Oblicz Average True Range (ATR)
  private calculateATR(high: number[], low: number[], close: number[]): number {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < close.length; i++) {
      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - close[i - 1]);
      const tr3 = Math.abs(low[i] - close[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.calculateSMA(trueRanges, this.atrLength);
  }

  // Oblicz Williams %R
  private calculateWilliamsR(close: number[], high: number[], low: number[]): number {
    const period = this.williamsRLength;
    const highestHigh = Math.max(...high.slice(-period));
    const lowestLow = Math.min(...low.slice(-period));
    const currentClose = close[close.length - 1];
    
    return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
  }

  // Główna metoda do obliczania wszystkich wskaźników
  public calculateIndicators(data: { date: Date; price: number; volume?: number }[]): TechnicalIndicators {
    const prices = data.map(d => d.price);
    const volumes = data.map(d => d.volume || 0);
    const high = prices.map(p => p * 1.001); // Symulowane dane high
    const low = prices.map(p => p * 0.999);  // Symulowane dane low

    return {
      sma: this.calculateSMA(prices, this.smaLength),
      ema: this.calculateEMA(prices, this.emaLength),
      rsi: this.calculateRSI(prices, this.rsiLength),
      macd: this.calculateMACD(prices),
      bollingerBands: this.calculateBollingerBands(prices),
      obv: this.calculateOBV(prices, volumes),
      atr: this.calculateATR(high, low, prices),
      williamsR: this.calculateWilliamsR(prices, high, low)
    };
  }
}