import React, { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import QueryInput from '../components/QueryInput';
import { Message, UserRole, QueryResponse } from '../types';

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('Employee');
  const [history, setHistory] = useState<string[]>([]);

  const handleQuery = useCallback(async (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setHistory((prev) => [query, ...prev]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process query');
      }

      const data: QueryResponse = await response.json();

      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: 'system',
        response: data,
      };

      setMessages((prev) => [...prev, systemMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I encountered an issue while processing your request.',
        sender: 'system',
        error: err.message,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentRole={role}
        onRoleChange={setRole}
        onSampleClick={handleQuery}
        history={history}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 p-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="md:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</span>
            <h1 className="text-lg font-bold text-gray-800">Conversational Data Hub</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                {role} Mode
             </div>
          </div>
        </header>

        <ChatWindow messages={messages} loading={loading} />

        <QueryInput onSend={handleQuery} disabled={loading} />
      </main>
    </div>
  );
};

export default Home;
