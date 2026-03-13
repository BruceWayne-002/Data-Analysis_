import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/hooks/useDataStore';
import { formatValue } from '@/lib/dataAnalysis';

export const KPICards: React.FC = () => {
  const { kpis, selectedTheme } = useDataStore();
  const colors = selectedTheme?.colors || ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 glass-card hover:shadow-glow transition-all duration-300 h-full">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-xs text-muted-foreground truncate">{kpi.name}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold">
                {formatValue(Number(kpi.value), kpi.format)}
              </span>
              {kpi.trend && kpi.trendValue !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs ${
                  kpi.trend === 'up' ? 'text-success' : 
                  kpi.trend === 'down' ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {kpi.trend === 'neutral' && <Minus className="w-3 h-3" />}
                  <span>{kpi.trendValue.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
