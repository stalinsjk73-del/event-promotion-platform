import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Loading events...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className="w-9 h-9 text-brand-500 animate-spin" />
      <p className="text-sm text-slate-400 font-medium tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }
  return content;
};
