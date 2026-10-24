import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Share2,
  ExternalLink,
  Edit,
  ArrowLeft,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { EventItem } from '../types';
import { eventApi } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FormatBadge, CategoryBadge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ShareModal } from '../components/events/ShareModal';
import { RegistrationModal } from '../components/events/RegistrationModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatEventDateTime } from '../utils/date';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    eventApi
      .getEventBySlug(slug)
      .then((data) => setEvent(data))
      .catch((err) => {
        console.error('Failed to load event:', err);
        showToast(err.message || 'Event not found or has not been published', 'error');
        navigate('/');
      })
      .finally(() => setIsLoading(false));
  }, [slug, navigate, showToast]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading event details..." />;
  }

  if (!event) return null;

  const isOwner = user && user.id === event.organizerId;
  const canManage = isOwner || isAdmin;

  const { dateStr, timeStr, fullStr } = formatEventDateTime(
    event.startDateTime,
    event.endDateTime,
    event.timezone
  );

  const handleToggleStatus = async () => {
    if (!canManage) return;
    setIsTogglingStatus(true);
    try {
      const nextStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const updated = await eventApi.updateStatus(event.id, nextStatus);
      setEvent(updated);
      showToast(`Event status updated to ${nextStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* Top Bar: Back button and management actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all events</span>
        </Link>

        {canManage && (
          <div className="flex items-center gap-3">
            <Button
              variant={event.status === 'PUBLISHED' ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleToggleStatus}
              isLoading={isTogglingStatus}
            >
              {event.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish Live Now'}
            </Button>
            <Link to={`/events/${event.id}/edit`}>
              <Button variant="secondary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                Edit Event
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Draft Mode Notice Banner */}
      {event.status === 'DRAFT' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-4 shadow-glass animate-slide-up">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              <strong>Draft Mode:</strong> This event is currently hidden from public discovery. Only you and administrators can preview this page.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleToggleStatus} isLoading={isTogglingStatus}>
            Publish Now
          </Button>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden glass-card border-slate-800 shadow-2xl">
        <div className="relative h-64 sm:h-96 w-full bg-slate-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-6 left-6 flex items-center gap-2 flex-wrap">
            <CategoryBadge category={event.category} />
            <FormatBadge format={event.format} />
            <StatusBadge status={event.status} />
          </div>

          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-300">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
              <span>•</span>
              <span className="text-slate-300">{timeStr}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Action bar below hero */}
        <div className="p-6 bg-surface-900/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
            {event.summary}
          </p>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsShareOpen(true)}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsRegisterOpen(true)}
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Info Cards and Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Description and Agenda */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6 sm:p-8 space-y-6 border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-tight pb-3 border-b border-slate-800">
              About This Event
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
              {event.description}
            </div>
          </div>

          {/* Technology & Interests Section */}
          <div className="glass-card p-6 sm:p-8 space-y-4 border-slate-800">
            <h3 className="text-base font-bold text-white tracking-tight">
              Key Technologies & Covered Topics
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {event.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Event Details Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6 border-slate-800">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Event Details
            </h3>

            {/* Date & Time */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  Date & Time
                </p>
                <p className="text-white font-medium text-sm">{dateStr}</p>
                <p className="text-slate-400 mt-0.5">{timeStr}</p>
              </div>
            </div>

            {/* Location or Online link */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                {event.format === 'ONLINE' ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  {event.format === 'ONLINE' ? 'Virtual Attendance' : 'Venue Location'}
                </p>
                {event.format === 'ONLINE' ? (
                  <div>
                    <p className="text-white font-medium text-sm">Online Live Session</p>
                    <p className="text-slate-400 mt-0.5">
                      Stream access instructions provided upon registration
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium text-sm">
                      {event.venue || 'Venue to be confirmed'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Target Audience */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  Who Should Attend
                </p>
                <p className="text-white font-medium text-sm leading-relaxed">
                  {event.targetAudience}
                </p>
              </div>
            </div>

            {/* Organizer Info */}
            {event.organizer && (
              <div className="flex items-start gap-3.5 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
                  {event.organizer.name.charAt(0)}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Organized By
                  </p>
                  <p className="text-white font-semibold text-sm">{event.organizer.name}</p>
                  <span className="text-[10px] text-brand-400 font-medium uppercase">
                    Verified {event.organizer.role}
                  </span>
                </div>
              </div>
            )}

            {/* Registration CTA in sidebar */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsRegisterOpen(true)}
                rightIcon={<ExternalLink className="w-4 h-4" />}
                className="w-full"
              >
                Register on Official Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Share and Registration Modals */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        event={event}
      />
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        event={event}
      />
    </div>
  );
};
