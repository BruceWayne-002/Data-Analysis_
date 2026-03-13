import React from 'react';
import { motion } from 'framer-motion';
import { useDataStore } from '@/hooks/useDataStore';
import { FileUpload } from '@/components/FileUpload';
import { KPIEditor } from '@/components/KPIEditor';
import { TemplateSelector } from '@/components/TemplateSelector';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProgressStepper } from '@/components/ProgressStepper';
import { BarChart3, Sparkles, Zap } from 'lucide-react';

const Index = () => {
  const { currentStep } = useDataStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-primary/10 shadow-glow">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Data Analyser</h1>
                  <p className="text-xs text-muted-foreground">Intelligent Analytics Tool </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>v1.0.0</span>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <ProgressStepper currentStep={currentStep} />

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'upload' && <FileUpload />}
            {currentStep === 'kpi' && <KPIEditor />}
            {currentStep === 'template' && <TemplateSelector />}
            {currentStep === 'dashboard' && <Dashboard />}
          </motion.div>
        </main>

        {/* Footer */}
        {currentStep === 'upload' && (
          <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground border-t border-border/50 backdrop-blur-xl">
            <p>Upload your data to unlock intelligent insights and beautiful visualizations</p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Index;
