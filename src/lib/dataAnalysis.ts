import { DataColumn, KPI, ChartConfig } from '@/types/data';

export function detectColumnType(values: any[]): 'string' | 'number' | 'date' | 'boolean' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'string';
  
  // Check for boolean
  const boolValues = nonNullValues.filter(v => 
    typeof v === 'boolean' || 
    ['true', 'false', 'yes', 'no', '1', '0'].includes(String(v).toLowerCase())
  );
  if (boolValues.length === nonNullValues.length) return 'boolean';
  
  // Check for number
  const numValues = nonNullValues.filter(v => !isNaN(parseFloat(String(v).replace(/[,$%]/g, ''))));
  if (numValues.length > nonNullValues.length * 0.8) return 'number';
  
  // Check for date
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^[A-Za-z]+ \d{1,2}, \d{4}$/,
  ];
  const dateValues = nonNullValues.filter(v => 
    datePatterns.some(p => p.test(String(v))) || !isNaN(Date.parse(String(v)))
  );
  if (dateValues.length > nonNullValues.length * 0.8) return 'date';
  
  return 'string';
}

export function analyzeColumns(data: Record<string, any>[]): DataColumn[] {
  if (!data.length) return [];
  
  const columns = Object.keys(data[0]);
  
  return columns.map(name => {
    const values = data.map(row => row[name]);
    const type = detectColumnType(values);
    const sample = values.slice(0, 5);
    
    return { name, type, sample };
  });
}

const kpiKeywords = {
  revenue: ['revenue', 'income', 'sales', 'earnings', 'turnover'],
  profit: ['profit', 'margin', 'net income', 'gross profit'],
  loss: ['loss', 'expense', 'cost', 'deficit'],
  growth: ['growth', 'increase', 'change', 'yoy', 'qoq'],
  count: ['count', 'quantity', 'units', 'volume', 'total'],
  rate: ['rate', 'ratio', 'percentage', '%'],
  amount: ['amount', 'value', 'price', 'fee'],
};

export function detectKPIs(columns: DataColumn[], data: Record<string, any>[]): KPI[] {
  const kpis: KPI[] = [];
  
  const numericColumns = columns.filter(col => col.type === 'number');
  
  numericColumns.forEach((col, index) => {
    const colNameLower = col.name.toLowerCase();
    const values = data.map(row => parseFloat(String(row[col.name]).replace(/[,$%]/g, '')) || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    let format: KPI['format'] = 'number';
    let kpiName = col.name;
    let value = sum;
    
    // Detect format and name based on column name
    for (const [type, keywords] of Object.entries(kpiKeywords)) {
      if (keywords.some(k => colNameLower.includes(k))) {
        switch (type) {
          case 'revenue':
          case 'profit':
          case 'loss':
          case 'amount':
            format = 'currency';
            kpiName = `Total ${col.name}`;
            break;
          case 'rate':
            format = 'percentage';
            kpiName = `Average ${col.name}`;
            value = avg;
            break;
          case 'count':
            format = 'number';
            kpiName = `Total ${col.name}`;
            break;
          case 'growth':
            format = 'percentage';
            kpiName = col.name;
            value = avg;
            break;
        }
        break;
      }
    }
    
    // Calculate trend
    const midpoint = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const secondHalfAvg = values.slice(midpoint).reduce((a, b) => a + b, 0) / (values.length - midpoint);
    const trendValue = firstHalfAvg !== 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trend: KPI['trend'] = trendValue > 1 ? 'up' : trendValue < -1 ? 'down' : 'neutral';
    
    kpis.push({
      id: `kpi-${index}`,
      name: kpiName,
      value: format === 'percentage' ? avg : sum,
      format,
      trend,
      trendValue: Math.abs(trendValue),
      column: col.name,
    });
  });
  
  // Add count KPI
  kpis.unshift({
    id: 'kpi-count',
    name: 'Total Records',
    value: data.length,
    format: 'number',
    trend: 'neutral',
  });
  
  return kpis.slice(0, 6); // Limit to 6 KPIs
}

export function suggestCharts(columns: DataColumn[], data: Record<string, any>[]): ChartConfig[] {
  const charts: ChartConfig[] = [];
  
  const numericCols = columns.filter(col => col.type === 'number');
  const dateCols = columns.filter(col => col.type === 'date');
  const stringCols = columns.filter(col => col.type === 'string');
  
  // Time series chart
  if (dateCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: 'chart-timeseries',
      type: 'area',
      title: `${numericCols[0].name} Over Time`,
      xAxis: dateCols[0].name,
      yAxis: numericCols[0].name,
    });
  }
  
  // Bar chart for categories
  if (stringCols.length > 0 && numericCols.length > 0) {
    const categoryCol = stringCols.find(col => {
      const uniqueValues = new Set(data.map(row => row[col.name]));
      return uniqueValues.size <= 10 && uniqueValues.size > 1;
    });
    
    if (categoryCol) {
      charts.push({
        id: 'chart-bar',
        type: 'bar',
        title: `${numericCols[0].name} by ${categoryCol.name}`,
        xAxis: categoryCol.name,
        yAxis: numericCols[0].name,
      });
    }
  }
  
  // Pie chart for distribution
  if (stringCols.length > 0 && numericCols.length > 0) {
    const pieCol = stringCols.find(col => {
      const uniqueValues = new Set(data.map(row => row[col.name]));
      return uniqueValues.size <= 6 && uniqueValues.size > 1;
    });
    
    if (pieCol) {
      charts.push({
        id: 'chart-pie',
        type: 'pie',
        title: `${numericCols[0].name} Distribution`,
        dataKey: numericCols[0].name,
        colorKey: pieCol.name,
      });
    }
  }
  
  // Line chart for trend
  if (numericCols.length >= 2) {
    charts.push({
      id: 'chart-line',
      type: 'line',
      title: `${numericCols[0].name} vs ${numericCols[1].name}`,
      xAxis: numericCols[1].name,
      yAxis: numericCols[0].name,
    });
  }
  
  // Additional bar chart if multiple numeric columns
  if (numericCols.length >= 2 && stringCols.length > 0) {
    charts.push({
      id: 'chart-bar-2',
      type: 'bar',
      title: `${numericCols[1].name} Analysis`,
      xAxis: stringCols[0].name,
      yAxis: numericCols[1].name,
    });
  }
  
  return charts;
}

export function aggregateData(
  data: Record<string, any>[],
  groupBy: string,
  valueColumn: string,
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min' = 'sum'
): Record<string, any>[] {
  const grouped = data.reduce((acc, row) => {
    const key = String(row[groupBy] || 'Unknown');
    if (!acc[key]) {
      acc[key] = { values: [], count: 0 };
    }
    const value = parseFloat(String(row[valueColumn]).replace(/[,$%]/g, '')) || 0;
    acc[key].values.push(value);
    acc[key].count++;
    return acc;
  }, {} as Record<string, { values: number[]; count: number }>);
  
  return Object.entries(grouped).map(([key, { values, count }]) => {
    let aggregatedValue: number;
    switch (aggregation) {
      case 'sum':
        aggregatedValue = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        aggregatedValue = values.reduce((a, b) => a + b, 0) / count;
        break;
      case 'count':
        aggregatedValue = count;
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
    }
    return {
      [groupBy]: key,
      [valueColumn]: aggregatedValue,
    };
  });
}

export function formatValue(value: number, format: KPI['format']): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: value >= 1000000 ? 'compact' : 'standard',
        maximumFractionDigits: value >= 1000000 ? 1 : 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('en-US', {
        notation: value >= 1000000 ? 'compact' : 'standard',
        maximumFractionDigits: value >= 1000000 ? 1 : 0,
      }).format(value);
    default:
      return String(value);
  }
}

export function applyFilters(
  data: Record<string, any>[],
  filters: { column: string; value: any }[]
): Record<string, any>[] {
  return data.filter(row => {
    return filters.every(filter => {
      if (!filter.value || filter.value === 'all') return true;
      return String(row[filter.column]) === String(filter.value);
    });
  });
}
