import React, { useState } from 'react';
import DataTable from './DataTable';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [showSql, setShowSql] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
      >
        <div className="text-sm md:text-base whitespace-pre-wrap">{message.text}</div>

        {!isUser && message.response && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <DataTable data={message.response.data} />

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">
                Latency: {(message.response.latency * 1000).toFixed(0)}ms
              </span>
              <button
                onClick={() => setShowSql(!showSql)}
                className="text-blue-600 hover:underline font-medium"
              >
                {showSql ? 'Hide SQL' : 'View SQL'}
              </button>
            </div>

            {showSql && (
              <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono overflow-x-auto">
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
