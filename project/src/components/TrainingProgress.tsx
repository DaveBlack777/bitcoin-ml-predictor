import { type FC } from 'react';

interface TrainingProgressProps {
  isTraining: boolean;
  currentEpoch?: number;
  totalEpochs?: number;
  loss?: number;
}

export const TrainingProgress: FC<TrainingProgressProps> = ({ 
  isTraining, 
  currentEpoch, 
  totalEpochs, 
  loss 
}) => {
  if (!isTraining) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        Trening modelu w toku
      </h3>
      <div className="space-y-2">
        {currentEpoch !== undefined && totalEpochs !== undefined && (
          <div>
            <div className="flex justify-between text-sm text-blue-600 mb-1">
              <span>Postęp:</span>
              <span>{currentEpoch} / {totalEpochs}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentEpoch / totalEpochs) * 100}%` }}
              />
            </div>
          </div>
        )}
        {loss !== undefined && (
          <div className="text-sm text-blue-600">
            Błąd: {loss.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
};