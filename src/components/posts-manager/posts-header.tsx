'use client';

import { FileText } from 'lucide-react';

export const PostsHeader = () => {
  return (
    <div className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Posts Manager</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
