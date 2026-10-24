import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { EventItem } from '../types';
import { eventApi } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EventForm } from '../components/events/EventForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoadingEvent(true);
    eventApi
      .getEventById(id)
      .then((data) => {
        // Ownership check
        if (user && user.id !== data.organizerId && !isAdmin) {
          showToast('You are only authorized to edit events you created.', 'error');
          navigate('/dashboard');
          return;
        }
        setEvent(data);
      })
      .catch((err) => {
        showToast(err.message || 'Failed to load event for editing', 'error');
        navigate('/dashboard');
      })
      .finally(() => setIsLoadingEvent(false));
  }, [id, user, isAdmin, navigate, showToast]);

  const handleUpdate = async (formData: any) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const updated = await eventApi.updateEvent(id, formData);
      showToast('Event updated successfully!', 'success');
      navigate(`/events/${updated.slug}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update event', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingEvent) {
    return <LoadingSpinner fullPage message="Loading event editor..." />;
  }

  if (!event) return null;

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
            Edit Event: {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Modify event agenda, dates, venue, or publish status.
          </p>
        </div>
      </div>

      <EventForm
        initialData={event}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        submitLabel="Save Changes"
      />
    </div>
  );
};
