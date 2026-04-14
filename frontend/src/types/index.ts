export interface QueryExplanation {
  intent: string;
  filters: Record<string, any>;
  aggregation: string;
  reasoning: string;
}

export interface ChartMetadata {
  type: 'line' | 'bar' | 'pie';
  x_axis: string;
  y_axis: string;
}

export interface QueryResponse {
  sql: string;
  data: any[];
  answer: string;
  latency: number;
  explanation: QueryExplanation;
  chart?: ChartMetadata;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  response?: QueryResponse;
  error?: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Employee';
