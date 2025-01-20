import { type FC } from 'react';

interface PriceStatsProps {
  currentPrice: number;
  predictedChange?: number;
  accuracy?: number;
}

export const PriceStats: FC<PriceStatsProps> = ({ currentPrice, predictedChange, accuracy }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Aktualna cena
        </h3>
        <div className="text-2xl font-bold text-blue-600">
          {formatPrice(currentPrice)}
        </div>
      </div>

      {predictedChange !== undefined && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Przewidywana zmiana (7 dni)
          </h3>
          <div className={`text-2xl font-bold ${
            predictedChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {predictedChange >= 0 ? '+' : ''}{predictedChange.toFixed(2)}%
          </div>
        </div>
      )}

      {accuracy !== undefined && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Dokładność modelu
          </h3>
          <div className="text-2xl font-bold text-purple-600">
            {accuracy.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
};