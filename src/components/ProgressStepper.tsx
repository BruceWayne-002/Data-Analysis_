import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart3, Sparkles } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: 'upload' | 'kpi' | 'template' | 'dashboard';
}

const steps = [
  { id: 'upload', label: 'Upload', icon: Database },
  { id: 'kpi', label: 'KPIs', icon: Sparkles },
  { id: 'template', label: 'Style', icon: BarChart3 },
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  if (currentStep === 'dashboard') return null;

  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={step.id}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-glow' 
                  : isCompleted 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary text-muted-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{step.label}</span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${
                isCompleted ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
