import { type ChartData, type ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictionChartProps {
  historicalData: { date: Date; price: number }[];
  predictions: { date: Date; price: number }[];
  viewMode: 'historical' | 'prediction';
}

export function PredictionChart({ historicalData, predictions, viewMode }: PredictionChartProps) {
  const isPredictionMode = viewMode === 'prediction';
  
  // Dla trybu predykcji, weź tylko ostatnie 7 dni historii
  const relevantHistoricalData = isPredictionMode
    ? historicalData.slice(-7)
    : historicalData.filter(d => d.date >= subDays(new Date(), 60));

  const data: ChartData<'line'> = {
    labels: [
      ...relevantHistoricalData.map(d => format(d.date, 'd MMM', { locale: pl })),
      ...predictions.map(d => format(d.date, 'd MMM', { locale: pl }))
    ],
    datasets: [
      {
        label: 'Historyczne',
        data: relevantHistoricalData.map(d => d.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: isPredictionMode ? 3 : 2,
        borderWidth: 2,
      },
      {
        label: 'Predykcje',
        data: [
          ...Array(relevantHistoricalData.length).fill(null),
          ...predictions.map(d => d.price)
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [],
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: isPredictionMode 
          ? 'Bitcoin - Predykcja na następne 7 dni'
          : 'Bitcoin - Historia i Predykcje (ostatnie 60 dni)',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            if (value === null) return '';
            return `${context.dataset.label}: $${value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: (value) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value as number);
          },
        },
      },
    },
  };

  return (
    <div className="h-[500px]">
      <Line data={data} options={options} />
    </div>
  );
}