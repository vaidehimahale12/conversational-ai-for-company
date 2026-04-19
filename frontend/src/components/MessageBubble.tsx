import React, { useState } from 'react';
import DataTable from './DataTable';
import ChartDisplay from './ChartDisplay';
import { Message } from '../types';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, BarChart2, Table } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [showSql, setShowSql] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleFeedback = async (rating: number) => {
    if (feedback) return;
    try {
      await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message.text,
          sql: message.response?.sql || '',
          rating
        })
      });
      setFeedback(rating === 1 ? 'up' : 'down');
    } catch (err) {
      console.error('Feedback failed', err);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
      >
        <div className="text-sm md:text-base whitespace-pre-wrap">{message.text}</div>

        {!isUser && message.response && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* View Toggle */}
            {message.response.chart && (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                  title="Table View"
                >
                  <Table size={18} />
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                  title="Chart View"
                >
                  <BarChart2 size={18} />
                </button>
              </div>
            )}

            {viewMode === 'table' ? (
              <DataTable data={message.response.data} />
            ) : (
              message.response.chart && <ChartDisplay data={message.response.data} metadata={message.response.chart} />
            )}

            {/* Metadata & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  Latency: {(message.response.latency * 1000).toFixed(0)}ms
                </span>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Reasoning
                </button>
                <button
                  onClick={() => setShowSql(!showSql)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {showSql ? 'Hide SQL' : 'View SQL'}
                </button>
              </div>

              {/* Feedback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFeedback(1)}
                  disabled={feedback !== null}
                  className={`p-1.5 rounded-full transition-all ${feedback === 'up' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  onClick={() => handleFeedback(0)}
                  disabled={feedback !== null}
                  className={`p-1.5 rounded-full transition-all ${feedback === 'down' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
            </div>

            {/* Collapsible Panels */}
            {showExplanation && (
              <div className="p-3 bg-blue-50 rounded-lg text-xs space-y-2 border border-blue-100 text-blue-800">
                <p><strong>Intent:</strong> {message.response.explanation.intent}</p>
                <p><strong>Aggregation:</strong> {message.response.explanation.aggregation}</p>
                <p><strong>Reasoning:</strong> {message.response.explanation.reasoning}</p>
              </div>
            )}

            {showSql && (
              <div className="p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono overflow-x-auto shadow-inner">
                {message.response.sql}
              </div>
            )}
          </div>
        )}

        {message.error && (
          <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            <strong>Error:</strong> {message.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
