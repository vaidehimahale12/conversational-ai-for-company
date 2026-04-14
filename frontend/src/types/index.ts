export interface QueryResponse {
  sql: string;
  data: any[];
  answer: string;
  latency: number;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  response?: QueryResponse;
  error?: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Employee';
