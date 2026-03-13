export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sample: any[];
}

export interface Dataset {
  name: string;
  columns: DataColumn[];
  rows: Record<string, any>[];
  uploadedAt: Date;
}

export interface KPI {
  id: string;
  name: string;
  value: number | string;
  format: 'number' | 'currency' | 'percentage' | 'text';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  column?: string;
  formula?: string;
  icon?: string;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'map';
  title: string;
  xAxis?: string;
  yAxis?: string;
  dataKey?: string;
  colorKey?: string;
  width?: number;
  height?: number;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'grid' | 'flex' | 'masonry';
  charts: ChartConfig[];
  thumbnail?: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: string[];
  primaryColor: string;
  backgroundColor: string;
}

export interface Filter {
  id: string;
  column: string;
  type: 'select' | 'range' | 'date' | 'search';
  value: any;
  options?: any[];
}

export type AppStep = 'upload' | 'kpi' | 'template' | 'dashboard';
