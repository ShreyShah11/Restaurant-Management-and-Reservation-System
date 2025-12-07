'use client';

import type React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface Step {
    number: number;
    label: string;
    icon: React.ReactNode;
}

interface ProgressIndicatorProps {
    steps: Step[];
    currentStep: number;
    completedSteps: number[];
}

export function ProgressIndicator({ steps, currentStep, completedSteps }: ProgressIndicatorProps) {
    return (
        <div className="w-full mb-8 sm:mb-12">
            <div className="flex items-center justify-between gap-1 sm:gap-2">
                {steps.map((step, index) => {
                    const isActive = step.number === currentStep;
                    const isCompleted = completedSteps.includes(step.number);

                    return (
                        <div key={step.number} className="flex items-center flex-1 relative">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center justify-center shrink-0 w-full">
                                <div
                                    className={`
                    relative z-10 flex items-center justify-center rounded-full
                    border-2 transition-all duration-300 shrink-0
                    h-12 w-12 sm:h-16 sm:w-16
                    ${
                        isCompleted
                            ? ' border-green-400 bg-muted dark:bg-muted'
                            : isActive
                              ? 'border-accent bg-accent/10 dark:border-accent dark:bg-accent/20 scale-105 sm:scale-110 shadow-lg'
                              : 'border-border bg-card dark:bg-card'
                    }
                  `}
                                    style={{
                                        aspectRatio: '1 / 1', // ensures circle stays perfectly round
                                    }}
                                >
                                    {isCompleted ? (
                                        <CheckCheck
                                            color="#28cc51"
                                            className="h-6 w-6 sm:h-8 sm:w-8 border-green-400 text-primary"
                                        />
                                    ) : (
                                        <div className="text-base sm:text-lg font-semibold text-foreground">
                                            {step.icon}
                                        </div>
                                    )}
                                </div>
                                <p
                                    className={`
                    text-center text-xs sm:text-sm font-medium transition-colors mt-2 sm:mt-3
                    ${isActive || isCompleted ? 'text-foreground font-semibold' : 'text-muted-foreground'}
                  `}
                                >
                                    {step.label}
                                </p>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                    flex-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 h-1
                    ${isCompleted ? 'bg-primary' : 'bg-border'}
                  `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
