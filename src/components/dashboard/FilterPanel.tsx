import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/hooks/useDataStore';
import { applyFilters } from '@/lib/dataAnalysis';

export const FilterPanel: React.FC = () => {
  const { dataset, filters, setFilters, updateFilter, setFilteredData, filteredData } = useDataStore();

  // Initialize filters from string columns
  useEffect(() => {
    if (dataset && filters.length === 0) {
      const stringColumns = dataset.columns.filter(col => col.type === 'string');
      const newFilters = stringColumns.slice(0, 4).map((col, index) => {
        const uniqueValues = [...new Set(dataset.rows.map(row => row[col.name]))].filter(Boolean);
        return {
          id: `filter-${index}`,
          column: col.name,
          type: 'select' as const,
          value: 'all',
          options: ['all', ...uniqueValues.slice(0, 20)],
        };
      });
      setFilters(newFilters);
    }
  }, [dataset, filters.length, setFilters]);

  // Apply filters to data
  useEffect(() => {
    if (dataset) {
      const activeFilters = filters
        .filter(f => f.value && f.value !== 'all')
        .map(f => ({ column: f.column, value: f.value }));
      
      if (activeFilters.length > 0) {
        const filtered = applyFilters(dataset.rows, activeFilters);
        setFilteredData(filtered);
      } else {
        setFilteredData(dataset.rows);
      }
    }
  }, [filters, dataset, setFilteredData]);

  if (filters.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 glass-card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Filters</span>
          <span className="text-xs text-muted-foreground ml-auto">
            Showing {filteredData.length} of {dataset?.rows.length || 0} records
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filters.map(filter => (
            <div key={filter.id}>
              <label className="text-xs text-muted-foreground mb-1 block">{filter.column}</label>
              <select
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-secondary border border-input text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {filter.options?.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All' : option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
