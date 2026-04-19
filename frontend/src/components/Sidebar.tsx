import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSampleClick: (query: string) => void;
  history: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  onSampleClick,
  history,
}) => {
  const sampleQueries = [
    "Show me all sales",
    "Total revenue for Widget A",
    "List all employees",
    "Average salary by department",
    "Who is in the Engineering department?",
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">D</span>
          DataChat AI
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            User Role
          </h3>
          <div className="space-y-1">
            {(['Admin', 'Manager', 'Employee'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentRole === role
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Sample Queries
          </h3>
          <div className="space-y-2">
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => onSampleClick(q)}
                className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-xs text-gray-500 truncate italic"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            {currentRole[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{currentRole} User</p>
            <p className="text-xs text-gray-500 truncate">active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
