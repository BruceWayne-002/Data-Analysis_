import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/hooks/useDataStore';
import { KPICards } from './KPICards';
import { ChartCard } from './ChartCard';
import { FilterPanel } from './FilterPanel';
import { ExportPanel } from './ExportPanel';

export const Dashboard: React.FC = () => {
  const { dataset, charts, setStep, reset } = useDataStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('template')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{dataset?.name || 'Dashboard'}</h1>
            <p className="text-sm text-muted-foreground">
              {dataset?.rows.length.toLocaleString()} records • {dataset?.columns.length} columns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportPanel />
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Filters */}
      <FilterPanel />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charts.map((chart, index) => (
          <ChartCard key={chart.id} config={chart} index={index} />
        ))}
      </div>

      {charts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>No charts could be generated from your data.</p>
          <p className="text-sm">Try uploading a dataset with more numeric columns.</p>
        </div>
      )}
    </motion.div>
  );
};
