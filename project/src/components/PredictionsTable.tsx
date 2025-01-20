import { type FC } from 'react';

interface PredictionsTableProps {
  predictions: { date: Date; price: number }[];
}

export const PredictionsTable: FC<PredictionsTableProps> = ({ predictions }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Przewidywana cena
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {predictions.map((prediction, index) => {
            const predDate = new Date(prediction.date);
            predDate.setHours(0, 0, 0, 0);
            const isOld = predDate < today;

            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prediction.date.toLocaleDateString('pl-PL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${prediction.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {isOld ? (
                    <span className="text-gray-500">Zarchiwizowana</span>
                  ) : predDate.getTime() === today.getTime() ? (
                    <span className="text-blue-600">Dzisiaj</span>
                  ) : (
                    <span className="text-green-600">Aktywna</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};