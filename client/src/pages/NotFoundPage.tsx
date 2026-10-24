import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shadow-glow mb-6">
        <Compass className="w-10 h-10 animate-pulseSlow" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-3">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-3">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The event or page you are looking for doesn&apos;t exist, has been removed, or is currently in draft mode.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg" leftIcon={<Home className="w-5 h-5" />}>
          Return to Events Discovery
        </Button>
      </Link>
    </div>
  );
};
