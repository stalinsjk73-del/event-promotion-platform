import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { EventQuery, Format } from '../../types';

interface EventFilterProps {
  query: EventQuery;
  categories: string[];
  onChange: (newQuery: Partial<EventQuery>) => void;
  onReset: () => void;
  totalResults: number;
}

export const EventFilter: React.FC<EventFilterProps> = ({
  query,
  categories,
  onChange,
  onReset,
  totalResults,
}) => {
  const isFiltered = !!(
    query.search ||
    query.category ||
    query.format ||
    query.sortBy !== 'startDateTime'
  );

  return (
    <div className="glass-card p-6 border-slate-800/80 mb-8 space-y-6">
      {/* Top row: Search input & Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title, summary, topic, or tech tag..."
            value={query.search || ''}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          {query.search && (
            <button
              onClick={() => onChange({ search: '', page: 1 })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Format quick controls */}
        <div className="flex items-center gap-3">
          {/* Format selector buttons */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onChange({ format: undefined, page: 1 })}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !query.format
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onChange({ format: 'ONLINE', page: 1 })}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                query.format === 'ONLINE'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => onChange({ format: 'IN_PERSON', page: 1 })}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                query.format === 'IN_PERSON'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In-Person
            </button>
          </div>

          {/* Sort By */}
          <select
            value={`${query.sortBy || 'startDateTime'}-${query.sortOrder || 'asc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
              onChange({ sortBy, sortOrder, page: 1 });
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="startDateTime-asc">Upcoming First</option>
            <option value="createdAt-desc">Newest Added</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>

          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
            Categories
          </span>
          <span className="font-medium">
            Found <span className="text-white font-bold">{totalResults}</span> events
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onChange({ category: undefined, page: 1 })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
              !query.category
                ? 'bg-brand-500 text-white shadow-glow'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ category: cat, page: 1 })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
                query.category === cat
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
