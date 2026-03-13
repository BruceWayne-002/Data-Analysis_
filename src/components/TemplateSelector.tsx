import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, LayoutList, Grid3X3, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/hooks/useDataStore';
import { DashboardTemplate, Theme } from '@/types/data';
import { suggestCharts } from '@/lib/dataAnalysis';

const templates: DashboardTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Overview',
    description: 'High-level KPIs with trend charts for leadership dashboards',
    layout: 'grid',
    charts: [],
  },
  {
    id: 'analytics',
    name: 'Analytics Deep Dive',
    description: 'Detailed charts and data exploration for analysts',
    layout: 'flex',
    charts: [],
  },
  {
    id: 'sales',
    name: 'Sales Performance',
    description: 'Sales metrics, regional data, and pipeline visualization',
    layout: 'masonry',
    charts: [],
  },
];

const themes: Theme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
    primaryColor: '#0EA5E9',
    backgroundColor: '#0A0F1A',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#22C55E'],
    primaryColor: '#F97316',
    backgroundColor: '#1A0A0F',
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#10B981', '#06B6D4', '#3B82F6', '#F59E0B', '#EF4444'],
    primaryColor: '#10B981',
    backgroundColor: '#0A1A0F',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: ['#8B5CF6', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B'],
    primaryColor: '#8B5CF6',
    backgroundColor: '#0F0A1A',
  },
];

const layoutIcons = {
  grid: LayoutGrid,
  flex: LayoutList,
  masonry: Grid3X3,
};

export const TemplateSelector: React.FC = () => {
  const { selectedTemplate, selectedTheme, setTemplate, setTheme, setStep, setCharts, dataset } = useDataStore();

  const handleContinue = () => {
    if (dataset) {
      const charts = suggestCharts(dataset.columns, dataset.rows);
      setCharts(charts);
    }
    setStep('dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3 gradient-text">Choose Your Dashboard Style</h2>
        <p className="text-muted-foreground">
          Select a template and color theme for your data visualization
        </p>
      </div>

      {/* Templates */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Dashboard Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template, index) => {
            const LayoutIcon = layoutIcons[template.layout];
            const isSelected = selectedTemplate?.id === template.id;
            
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => setTemplate(template)}
                  className={`
                    p-6 cursor-pointer transition-all duration-300 glass-card
                    ${isSelected 
                      ? 'border-primary shadow-glow' 
                      : 'hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <LayoutIcon className="w-6 h-6 text-primary" />
                    </div>
                    {isSelected && (
                      <div className="p-1.5 rounded-full bg-primary">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold mb-2">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Themes */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {themes.map((theme, index) => {
            const isSelected = selectedTheme?.id === theme.id;
            
            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card
                  onClick={() => setTheme(theme)}
                  className={`
                    p-4 cursor-pointer transition-all duration-300 glass-card
                    ${isSelected 
                      ? 'border-primary shadow-glow' 
                      : 'hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{theme.name}</span>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-primary">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {theme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleContinue} 
          size="lg"
          className="gap-2 px-8"
          disabled={!selectedTemplate || !selectedTheme}
        >
          Generate Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
