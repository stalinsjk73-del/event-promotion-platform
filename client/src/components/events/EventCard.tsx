import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Video, Share2, ArrowUpRight } from 'lucide-react';
import { EventItem } from '../../types';
import { FormatBadge, CategoryBadge, StatusBadge } from '../common/Badge';
import { formatEventDateTime } from '../../utils/date';

interface EventCardProps {
  event: EventItem;
  onShare?: (event: EventItem) => void;
  showStatus?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onShare, showStatus = false }) => {
  const { dateStr, timeStr } = formatEventDateTime(
    event.startDateTime,
    event.endDateTime,
    event.timezone
  );

  return (
    <article className="glass-card-hover flex flex-col overflow-hidden group border-slate-800/80">
      {/* Event Image & Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={event.imageUrl}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback tech gradient if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={event.category} />
            <FormatBadge format={event.format} />
          </div>
          {showStatus && <StatusBadge status={event.status} />}
        </div>

        {/* Share Button on Cover */}
        {onShare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare(event);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-surface-950/80 backdrop-blur-md text-slate-300 hover:text-white hover:bg-brand-600 transition-colors shadow-lg cursor-pointer"
            aria-label="Share event"
            title="Share event link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date info */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 mb-2">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{dateStr}</span>
            <span>•</span>
            <span className="text-slate-400 font-normal">{timeStr}</span>
          </div>

          {/* Title */}
          <Link to={`/events/${event.slug}`} className="block group-hover:text-brand-300 transition-colors">
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug tracking-tight mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Summary */}
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {event.summary}
          </p>

          {/* Location / Streaming info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            {event.format === 'ONLINE' ? (
              <>
                <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">Online Live Streaming</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{event.venue || 'Venue to be announced'}</span>
              </>
            )}
          </div>
        </div>

        {/* Footer: Tech tags & View Link */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-6">
            {event.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-800/80 text-slate-300 rounded-md border border-slate-700/50"
              >
                {tech}
              </span>
            ))}
            {event.technologies.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{event.technologies.length - 3}
              </span>
            )}
          </div>

          <Link
            to={`/events/${event.slug}`}
            className="flex items-center gap-1 text-xs font-semibold text-brand-400 group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all flex-shrink-0"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
