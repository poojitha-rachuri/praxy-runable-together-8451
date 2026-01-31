import { useState } from 'react';
import { FiDatabase, FiEye } from 'react-icons/fi';
import { DataSource } from '../../lib/rca';

interface DataRequestPanelProps {
  availableData: DataSource[];
  requestedData: string[];
  onDataRequest: (dataId: string) => void;
}

const DataRequestPanel = ({ 
  availableData, 
  requestedData, 
  onDataRequest 
}: DataRequestPanelProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRequest = async (dataId: string) => {
    setLoadingId(dataId);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    onDataRequest(dataId);
    setLoadingId(null);
  };

  const isRequested = (dataId: string) => requestedData.includes(dataId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <FiDatabase className="w-5 h-5 text-coral" />
        <h3 className="font-nunito font-700 text-lg text-charcoal">
          Available Data Sources
        </h3>
      </div>

      <p className="font-inter text-sm text-charcoal/60 mb-4">
        Click on data sources to reveal their information. Choose wisely!
      </p>

      <div className="space-y-3">
        {availableData.map((source) => {
          const requested = isRequested(source.id);
          const loading = loadingId === source.id;

          return (
            <div key={source.id} className="space-y-2">
              {/* Data source button */}
              <button
                onClick={() => !requested && handleRequest(source.id)}
                disabled={requested || loading}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                  requested
                    ? 'bg-white border-teal/30 shadow-sm'
                    : loading
                    ? 'bg-charcoal/5 border-charcoal/20 animate-pulse'
                    : 'bg-charcoal/5 border-charcoal/20 hover:border-teal hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      requested ? 'bg-teal/10' : 'bg-charcoal/10'
                    }`}>
                      {requested ? (
                        <FiEye className="w-5 h-5 text-teal" />
                      ) : (
                        <FiDatabase className="w-5 h-5 text-charcoal/40" />
                      )}
                    </div>
                    <div>
                      <p className={`font-inter font-600 text-sm ${
                        requested ? 'text-charcoal' : 'text-charcoal/60'
                      }`}>
                        {source.name}
                      </p>
                      {!requested && (
                        <p className="font-inter text-xs text-charcoal/40">
                          Click to view data
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {requested && (
                    <span className="px-2 py-1 rounded-full text-xs font-inter font-600 bg-teal/10 text-teal">
                      Viewed
                    </span>
                  )}
                </div>
              </button>

              {/* Data reveal (shown after request) */}
              {requested && (
                <div className="ml-4 p-4 bg-cream/50 rounded-lg border border-teal/10 animate-fadeIn">
                  <pre className="font-mono text-sm text-charcoal/80 whitespace-pre-wrap">
                    {JSON.stringify(source.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-charcoal/10">
        <p className="font-inter text-xs text-charcoal/50">
          Data sources viewed: {requestedData.length} / {availableData.length}
        </p>
      </div>
    </div>
  );
};

export default DataRequestPanel;
