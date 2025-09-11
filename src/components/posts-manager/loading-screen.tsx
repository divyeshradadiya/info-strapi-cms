'use client';

import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-card border-border">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="space-y-2">
            <FileText className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Posts Manager</h1>
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
