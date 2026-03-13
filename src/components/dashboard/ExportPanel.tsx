import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDataStore } from '@/hooks/useDataStore';
import * as XLSX from 'xlsx';

export const ExportPanel: React.FC = () => {
  const { dataset, kpis, filteredData } = useDataStore();

  const exportToExcel = (type: 'data' | 'kpis' | 'full') => {
    if (!dataset) return;

    const workbook = XLSX.utils.book_new();

    if (type === 'data' || type === 'full') {
      const dataSheet = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');
    }

    if (type === 'kpis' || type === 'full') {
      const kpiData = kpis.map(kpi => ({
        'KPI Name': kpi.name,
        'Value': kpi.value,
        'Format': kpi.format,
        'Trend': kpi.trend,
        'Trend Value (%)': kpi.trendValue,
        'Source Column': kpi.column || 'N/A',
      }));
      const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');
    }

    const fileName = type === 'full' 
      ? `${dataset.name.replace(/\.[^/.]+$/, '')}_full_report.xlsx`
      : type === 'kpis'
      ? `${dataset.name.replace(/\.[^/.]+$/, '')}_kpis.xlsx`
      : `${dataset.name.replace(/\.[^/.]+$/, '')}_data.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  if (!dataset) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => exportToExcel('data')} className="gap-2 cursor-pointer">
          <Table className="w-4 h-4" />
          <span>Export Data</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel('kpis')} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          <span>Export KPIs</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel('full')} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Full Report</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
