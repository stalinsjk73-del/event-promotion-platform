import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Calendar,
  Layers,
  FileText,
  Radio,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import { EventItem, Status } from '../types';
import { eventApi } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { StatusBadge, FormatBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDateShort } from '../utils/date';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | Status>('ALL');
  const [search, setSearch] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchMyEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await eventApi.getMyEvents({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: search || undefined,
        limit: 50,
      });
      setEvents(res.events);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to fetch your events', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, search, showToast]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleToggleStatus = async (event: EventItem) => {
    const nextStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const updated = await eventApi.updateStatus(event.id, nextStatus);
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
      showToast(
        `"${event.title}" is now ${nextStatus === 'PUBLISHED' ? 'published live' : 'saved as draft'}.`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update event status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await eventApi.deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showToast(`Event "${deleteTarget.title}" deleted successfully.`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalCount = events.length;
  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length;
  const draftCount = events.filter((e) => e.status === 'DRAFT').length;
  const onlineCount = events.filter((e) => e.format === 'ONLINE').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Event Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong>{' '}
            <span className="text-brand-400 uppercase font-semibold">({user?.role})</span>
            {isAdmin && ' — Managing all platform events with Admin privileges.'}
          </p>
        </div>
        <Link to="/events/new">
          <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{totalCount}</p>
        </div>

        <div className="glass-card p-5 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Live</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{publishedCount}</p>
        </div>

        <div className="glass-card p-5 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400">{draftCount}</p>
        </div>

        <div className="glass-card p-5 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Online Streams</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{onlineCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('PUBLISHED')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'PUBLISHED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilterStatus('DRAFT')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'DRAFT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Quick Search inside dashboard */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search your events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Events Table / List */}
      {isLoading ? (
        <LoadingSpinner message="Loading your dashboard events..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No Events Found in Dashboard"
          description="You haven't created any events in this view yet. Start organizing your next developer conference or meetup now!"
          actionLabel="Create Your First Event"
          onAction={() => window.location.assign('/events/new')}
        />
      ) : (
        <div className="glass-card overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Format & Category</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-900/40 transition-colors group"
                  >
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-900 flex-shrink-0"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/events/${event.slug}`}
                            className="font-bold text-white hover:text-brand-300 transition-colors line-clamp-1 text-sm"
                          >
                            {event.title}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                            /events/{event.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Format & Category */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-xs font-semibold text-slate-300">
                          {event.category}
                        </span>
                        <FormatBadge format={event.format} />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-300">
                      {formatDateShort(event.startDateTime)}
                    </td>

                    {/* Status Badge + Toggle */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={event.status} />
                        <button
                          onClick={() => handleToggleStatus(event)}
                          className="text-[11px] underline text-slate-400 hover:text-brand-300 cursor-pointer"
                          title="Toggle publish/draft"
                        >
                          {event.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/events/${event.slug}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View live event page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-slate-800 transition-colors"
                          title="Edit event"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Event"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">&ldquo;{deleteTarget?.title}&rdquo;</strong>? This
            action cannot be undone and the link will become unavailable.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
