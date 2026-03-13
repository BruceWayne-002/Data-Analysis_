import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/hooks/useDataStore';
import { analyzeColumns } from '@/lib/dataAnalysis';
import { sampleSalesData } from '@/data/sampleData';

export const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { setDataset, setStep } = useDataStore();

  const processFile = useCallback(async (file: File) => {
    setUploadStatus('processing');
    setErrorMessage('');

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let data: Record<string, any>[] = [];

      if (extension === 'csv') {
        data = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as Record<string, any>[]),
            error: (error) => reject(error),
          });
        });
      } else if (['xlsx', 'xls'].includes(extension || '')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }

      if (data.length === 0) {
        throw new Error('The file appears to be empty.');
      }

      const columns = analyzeColumns(data);

      setDataset({
        name: file.name,
        columns,
        rows: data,
        uploadedAt: new Date(),
      });

      setUploadStatus('success');
      
      // Transition to next step after a brief delay
      setTimeout(() => {
        setStep('kpi');
      }, 1000);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
    }
  }, [setDataset, setStep]);

  const loadSampleData = useCallback(() => {
    setUploadStatus('processing');
    
    setTimeout(() => {
      const columns = analyzeColumns(sampleSalesData);
      
      setDataset({
        name: 'Sample Sales Data.csv',
        columns,
        rows: sampleSalesData,
        uploadedAt: new Date(),
      });

      setUploadStatus('success');
      
      setTimeout(() => {
        setStep('kpi');
      }, 800);
    }, 500);
  }, [setDataset, setStep]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 gradient-text">Upload Your Dataset</h2>
        <p className="text-muted-foreground">
          Drop your CSV or Excel file to start analyzing your data
        </p>
      </div>

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`
          relative rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 shadow-glow' 
            : 'border-border hover:border-primary/50 hover:bg-card/50'
          }
          ${uploadStatus === 'success' ? 'border-success bg-success/5' : ''}
          ${uploadStatus === 'error' ? 'border-destructive bg-destructive/5' : ''}
        `}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadStatus === 'processing'}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {uploadStatus === 'idle' && (
            <>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="p-4 rounded-full bg-primary/10"
              >
                <Upload className="w-10 h-10 text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="text-lg font-medium">Drag & drop your file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </div>
              </div>
            </>
          )}

          {uploadStatus === 'processing' && (
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="p-4 rounded-full bg-primary/10"
              >
                <FileSpreadsheet className="w-10 h-10 text-primary" />
              </motion.div>
              <p className="mt-4 text-lg font-medium">Processing your data...</p>
            </div>
          )}

          {uploadStatus === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="p-4 rounded-full bg-success/10">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <p className="mt-4 text-lg font-medium text-success">Upload successful!</p>
              <p className="text-sm text-muted-foreground">Analyzing your data...</p>
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <p className="mt-4 text-lg font-medium text-destructive">Upload failed</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Sample Data Button */}
      {uploadStatus === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px bg-border flex-1 max-w-20" />
            <span className="text-sm text-muted-foreground">or try with</span>
            <div className="h-px bg-border flex-1 max-w-20" />
          </div>
          <Button
            variant="outline"
            onClick={loadSampleData}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            Load Sample Sales Data
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
