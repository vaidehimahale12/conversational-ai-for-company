import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartMetadata } from '../types';

interface ChartDisplayProps {
  data: any[];
  metadata: ChartMetadata;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ChartDisplay: React.FC<ChartDisplayProps> = ({ data, metadata }) => {
  const renderChart = () => {
    switch (metadata.type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={metadata.x_axis} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={metadata.y_axis} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={metadata.x_axis} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={metadata.y_axis}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={metadata.y_axis}
              nameKey={metadata.x_axis}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-64 w-full mt-4 p-4 bg-white rounded-xl border border-gray-100 shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() || <div>Unsupported chart type</div>}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartDisplay;
