import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { eventApi } from '../api/eventApi';
import { useToast } from '../context/ToastContext';
import { EventForm } from '../components/events/EventForm';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (formData: any) => {
    setIsLoading(true);
    try {
      const created = await eventApi.createEvent(formData);
      showToast(`Event "${created.title}" created successfully!`, 'success');
      navigate(`/events/${created.slug}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create event. Please verify all fields.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create a New Tech Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Set up dates, format, ticketing redirect URL, and live streaming links.
          </p>
        </div>
      </div>

      <EventForm
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="Create & Save Event"
      />
    </div>
  );
};
