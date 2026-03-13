import { create } from 'zustand';
import { Dataset, KPI, ChartConfig, DashboardTemplate, Theme, Filter, AppStep } from '@/types/data';

interface DataStore {
  // State
  currentStep: AppStep;
  dataset: Dataset | null;
  kpis: KPI[];
  charts: ChartConfig[];
  selectedTemplate: DashboardTemplate | null;
  selectedTheme: Theme | null;
  filters: Filter[];
  filteredData: Record<string, any>[];
  
  // Actions
  setStep: (step: AppStep) => void;
  setDataset: (dataset: Dataset) => void;
  setKPIs: (kpis: KPI[]) => void;
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  deleteKPI: (id: string) => void;
  addKPI: (kpi: KPI) => void;
  setCharts: (charts: ChartConfig[]) => void;
  updateChart: (id: string, updates: Partial<ChartConfig>) => void;
  setTemplate: (template: DashboardTemplate) => void;
  setTheme: (theme: Theme) => void;
  setFilters: (filters: Filter[]) => void;
  updateFilter: (id: string, value: any) => void;
  setFilteredData: (data: Record<string, any>[]) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'upload' as AppStep,
  dataset: null,
  kpis: [],
  charts: [],
  selectedTemplate: null,
  selectedTheme: null,
  filters: [],
  filteredData: [],
};

export const useDataStore = create<DataStore>((set) => ({
  ...initialState,
  
  setStep: (step) => set({ currentStep: step }),
  
  setDataset: (dataset) => set({ 
    dataset, 
    filteredData: dataset.rows 
  }),
  
  setKPIs: (kpis) => set({ kpis }),
  
  updateKPI: (id, updates) => set((state) => ({
    kpis: state.kpis.map(kpi => 
      kpi.id === id ? { ...kpi, ...updates } : kpi
    ),
  })),
  
  deleteKPI: (id) => set((state) => ({
    kpis: state.kpis.filter(kpi => kpi.id !== id),
  })),
  
  addKPI: (kpi) => set((state) => ({
    kpis: [...state.kpis, kpi],
  })),
  
  setCharts: (charts) => set({ charts }),
  
  updateChart: (id, updates) => set((state) => ({
    charts: state.charts.map(chart =>
      chart.id === id ? { ...chart, ...updates } : chart
    ),
  })),
  
  setTemplate: (template) => set({ selectedTemplate: template }),
  
  setTheme: (theme) => set({ selectedTheme: theme }),
  
  setFilters: (filters) => set({ filters }),
  
  updateFilter: (id, value) => set((state) => ({
    filters: state.filters.map(filter =>
      filter.id === id ? { ...filter, value } : filter
    ),
  })),
  
  setFilteredData: (data) => set({ filteredData: data }),
  
  reset: () => set(initialState),
}));
