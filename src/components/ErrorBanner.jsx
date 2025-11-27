import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

/**
 * Error Banner Component
 * Displays error notifications with troubleshooting tips and retry options
 */
export const ErrorBanner = ({ error, onDismiss, onRetry, isDark }) => {
  if (!error) return null;

  const getIcon = () => {
    if (error.severity === 'error') {
      return <AlertCircle className="w-6 h-6" style={{ color: '#BF616A' }} />;
    } else if (error.severity === 'warning') {
      return <AlertTriangle className="w-6 h-6" style={{ color: '#D08770' }} />;
    }
    return <AlertCircle className="w-6 h-6" style={{ color: '#88C0D0' }} />;
  };

  const getBackgroundColor = () => {
    if (error.severity === 'error') {
      return isDark ? 'bg-nord1 border-nord11' : 'bg-red-50 border-nord11';
    } else if (error.severity === 'warning') {
      return isDark ? 'bg-nord1 border-nord12' : 'bg-orange-50 border-nord12';
    }
    return isDark ? 'bg-nord1 border-nord8' : 'bg-blue-50 border-nord8';
  };

  return (
    <div className={`mb-6 rounded-xl shadow-lg p-5 border-l-4 transition-all duration-200 ${getBackgroundColor()}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-nord6' : 'text-nord0'}`}>
            {error.message}
          </h3>
          <p className={`text-sm mb-3 ${isDark ? 'text-nord4' : 'text-nord3'}`}>
            {error.details}
          </p>

          {error.troubleshooting && error.troubleshooting.length > 0 && (
            <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-nord2' : 'bg-white'}`}>
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-nord6' : 'text-nord0'}`}>
                💡 Troubleshooting Tips:
              </p>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-nord4' : 'text-nord3'}`}>
                {error.troubleshooting.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-nord10 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {error.canRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 text-white"
                style={{ backgroundColor: '#5E81AC' }}
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
            <button
              onClick={onDismiss}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                isDark ? 'bg-nord3 text-nord6 hover:bg-nord2' : 'bg-nord5 text-nord0 hover:bg-nord4'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className={`flex-shrink-0 p-1 rounded transition ${
            isDark ? 'text-nord4 hover:text-nord6' : 'text-nord3 hover:text-nord0'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
