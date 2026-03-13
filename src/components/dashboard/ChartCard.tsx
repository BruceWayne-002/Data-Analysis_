import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/hooks/useDataStore';
import { aggregateData } from '@/lib/dataAnalysis';
import { ChartConfig } from '@/types/data';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface ChartCardProps {
  config: ChartConfig;
  index: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ config, index }) => {
  const { filteredData, selectedTheme, dataset } = useDataStore();
  const colors = selectedTheme?.colors || ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];

  const chartData = useMemo(() => {
    if (!filteredData.length || !config.xAxis || !config.yAxis) {
      if (config.type === 'pie' && config.colorKey && config.dataKey) {
        return aggregateData(filteredData, config.colorKey, config.dataKey);
      }
      return filteredData.slice(0, 20);
    }
    return aggregateData(filteredData, config.xAxis, config.yAxis).slice(0, 15);
  }, [filteredData, config]);

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey={config.xAxis} 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey={config.yAxis} 
                fill={colors[index % colors.length]} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey={config.xAxis} 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey={config.yAxis} 
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey={config.xAxis} 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey={config.yAxis} 
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                fill={`url(#gradient-${config.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={config.dataKey || config.yAxis || ''}
                nameKey={config.colorKey || config.xAxis || ''}
                cx="50%"
                cy="50%"
                innerRadius={config.type === 'donut' ? 60 : 0}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Chart type not supported
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-4 glass-card hover:shadow-glow transition-all duration-300">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground">{config.title}</h3>
        {renderChart()}
      </Card>
    </motion.div>
  );
};
