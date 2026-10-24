import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { EventItem, EventQuery, Pagination } from '../types';
import { eventApi } from '../api/eventApi';
import { EventCard } from '../components/events/EventCard';
import { EventFilter } from '../components/events/EventFilter';
import { ShareModal } from '../components/events/ShareModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [query, setQuery] = useState<EventQuery>({
    page: 1,
    limit: 12,
    sortBy: 'startDateTime',
    sortOrder: 'asc',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareEvent, setShareEvent] = useState<EventItem | null>(null);

  // Fetch unique categories on mount
  useEffect(() => {
    eventApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch events when query changes
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await eventApi.getEvents(query);
      setEvents(res.events);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleQueryChange = (partial: Partial<EventQuery>) => {
    setQuery((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setQuery({
      page: 1,
      limit: 12,
      sortBy: 'startDateTime',
      sortOrder: 'asc',
    });
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-14 border border-brand-500/20 bg-gradient-to-br from-brand-950/80 via-surface-900/90 to-surface-950 shadow-glass">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Top Tech Conferences & Workshops</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where Global Engineers <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Gather, Learn & Build.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Explore world-class tech conferences, virtual hackathons, hands-on masterclasses, and local developer meetups curated by leading organizers.
          </p>
        </div>
      </section>

      {/* Filter and Discovery Section */}
      <section>
        <EventFilter
          query={query}
          categories={categories}
          onChange={handleQueryChange}
          onReset={handleResetFilters}
          totalResults={pagination.total}
        />

        {/* Event Grid or Empty/Loading State */}
        {isLoading ? (
          <LoadingSpinner message="Searching developer events..." />
        ) : events.length === 0 ? (
          <EmptyState
            title="No Matching Events Found"
            description="We couldn't find any events matching your selected criteria. Try adjusting your search query, switching categories, or resetting filters."
            icon="search"
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onShare={(evt) => setShareEvent(evt)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handleQueryChange({ page: pagination.page - 1 })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-xs text-slate-400 font-medium px-2">
                  Page <strong className="text-white">{pagination.page}</strong> of{' '}
                  <strong className="text-white">{pagination.totalPages}</strong>
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handleQueryChange({ page: pagination.page + 1 })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareEvent}
        onClose={() => setShareEvent(null)}
        event={shareEvent}
      />
    </div>
  );
};
