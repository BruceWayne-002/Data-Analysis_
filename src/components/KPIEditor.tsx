import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, Edit2, Trash2, Plus, 
  DollarSign, Percent, Hash, ArrowRight, Check, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/hooks/useDataStore';
import { detectKPIs, formatValue } from '@/lib/dataAnalysis';
import { KPI } from '@/types/data';

const formatIcons = {
  currency: DollarSign,
  percentage: Percent,
  number: Hash,
  text: Hash,
};

export const KPIEditor: React.FC = () => {
  const { dataset, kpis, setKPIs, updateKPI, deleteKPI, addKPI, setStep } = useDataStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKPI, setNewKPI] = useState({ name: '', column: '', format: 'number' as KPI['format'] });

  useEffect(() => {
    if (dataset && kpis.length === 0) {
      const detectedKPIs = detectKPIs(dataset.columns, dataset.rows);
      setKPIs(detectedKPIs);
    }
  }, [dataset, kpis.length, setKPIs]);

  const handleEdit = (kpi: KPI) => {
    setEditingId(kpi.id);
    setEditValue(kpi.name);
  };

  const handleSaveEdit = (id: string) => {
    updateKPI(id, { name: editValue });
    setEditingId(null);
  };

  const handleAddKPI = () => {
    if (!newKPI.name || !newKPI.column) return;
    
    const column = dataset?.columns.find(c => c.name === newKPI.column);
    if (!column) return;

    const values = dataset?.rows.map(row => 
      parseFloat(String(row[newKPI.column]).replace(/[,$%]/g, '')) || 0
    ) || [];
    const sum = values.reduce((a, b) => a + b, 0);

    addKPI({
      id: `kpi-custom-${Date.now()}`,
      name: newKPI.name,
      value: sum,
      format: newKPI.format,
      column: newKPI.column,
      trend: 'neutral',
    });

    setNewKPI({ name: '', column: '', format: 'number' });
    setShowAddForm(false);
  };

  const numericColumns = dataset?.columns.filter(c => c.type === 'number') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 gradient-text">Key Performance Indicators</h2>
        <p className="text-muted-foreground">
          We've detected these KPIs from your data. Edit or add custom metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <AnimatePresence>
          {kpis.map((kpi, index) => {
            const FormatIcon = formatIcons[kpi.format];
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 glass-card hover:shadow-glow transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FormatIcon className="w-4 h-4 text-primary" />
                      </div>
                      {editingId === kpi.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 w-32 text-sm"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveEdit(kpi.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {kpi.name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEdit(kpi)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteKPI(kpi.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">
                      {formatValue(Number(kpi.value), kpi.format)}
                    </span>
                    {kpi.trend && kpi.trendValue !== undefined && (
                      <div className={`flex items-center gap-1 text-sm ${
                        kpi.trend === 'up' ? 'text-success' : 
                        kpi.trend === 'down' ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`}>
                        {kpi.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                        {kpi.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                        {kpi.trend === 'neutral' && <Minus className="w-4 h-4" />}
                        <span>{kpi.trendValue.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {kpi.column && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {kpi.column}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add KPI Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: kpis.length * 0.05 }}
        >
          {showAddForm ? (
            <Card className="p-5 glass-card border-dashed">
              <div className="space-y-3">
                <Input
                  placeholder="KPI Name"
                  value={newKPI.name}
                  onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                />
                <select
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-input text-sm"
                  value={newKPI.column}
                  onChange={(e) => setNewKPI({ ...newKPI, column: e.target.value })}
                >
                  <option value="">Select Column</option>
                  {numericColumns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
                <select
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-input text-sm"
                  value={newKPI.format}
                  onChange={(e) => setNewKPI({ ...newKPI, format: e.target.value as KPI['format'] })}
                >
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="percentage">Percentage</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleAddKPI} className="flex-1" size="sm">
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)} 
                    className="flex-1"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card 
              className="p-5 glass-card border-dashed cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-center min-h-[140px]"
              onClick={() => setShowAddForm(true)}
            >
              <div className="flex flex-col items-center text-muted-foreground">
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Custom KPI</span>
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => setStep('template')} 
          size="lg"
          className="gap-2 px-8"
        >
          Continue to Templates
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
