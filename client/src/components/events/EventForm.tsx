import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Image as ImageIcon,
  Tag,
  Users,
  Link as LinkIcon,
  Globe,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';
import { EventItem } from '../../types';
import { Button } from '../common/Button';
import { toInputDateTime } from '../../utils/date';

interface EventFormProps {
  initialData?: Partial<EventItem>;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

const COMMON_CATEGORIES = [
  'Artificial Intelligence',
  'Cloud & DevOps',
  'Web Development',
  'Cybersecurity',
  'Mobile',
  'Data Science',
  'Design & UX',
  'Blockchain & Web3',
];

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  );
  const [category, setCategory] = useState(
    initialData?.category || 'Artificial Intelligence'
  );
  const [format, setFormat] = useState<'ONLINE' | 'IN_PERSON'>(
    initialData?.format || 'ONLINE'
  );
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [onlineUrl, setOnlineUrl] = useState(initialData?.onlineUrl || '');
  const [startDateTime, setStartDateTime] = useState(
    toInputDateTime(initialData?.startDateTime) ||
      toInputDateTime(new Date(Date.now() + 86400000 * 7).toISOString())
  );
  const [endDateTime, setEndDateTime] = useState(
    toInputDateTime(initialData?.endDateTime) ||
      toInputDateTime(new Date(Date.now() + 86400000 * 8).toISOString())
  );
  const [timezone, setTimezone] = useState(initialData?.timezone || 'UTC');
  const [targetAudience, setTargetAudience] = useState(
    initialData?.targetAudience || 'Developers, Architects & Tech Leaders'
  );
  const [registrationUrl, setRegistrationUrl] = useState(
    initialData?.registrationUrl || 'https://eventsphere.io/tickets'
  );
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    initialData?.status || 'DRAFT'
  );

  // Technologies tag state
  const [technologies, setTechnologies] = useState<string[]>(
    initialData?.technologies || ['AI', 'Python', 'LLMs']
  );
  const [techInput, setTechInput] = useState('');

  // Client validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-slug generator from title if slug not manually customized
  useEffect(() => {
    if (!initialData?.slug && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, initialData]);

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setTechnologies(technologies.filter((_, idx) => idx !== index));
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!summary.trim() || summary.trim().length < 10) {
      errs.summary = 'Summary must be at least 10 characters.';
    }
    if (!description.trim() || description.trim().length < 20) {
      errs.description = 'Description must be at least 20 characters.';
    }
    if (!imageUrl.trim() || !imageUrl.startsWith('http')) {
      errs.imageUrl = 'Please provide a valid image URL starting with http/https.';
    }
    if (!startDateTime) {
      errs.startDateTime = 'Start date and time is required.';
    }
    if (!endDateTime) {
      errs.endDateTime = 'End date and time is required.';
    } else if (new Date(endDateTime) <= new Date(startDateTime)) {
      errs.endDateTime = 'End date and time must be after the start date and time.';
    }
    if (format === 'ONLINE') {
      if (!onlineUrl.trim() || !onlineUrl.startsWith('http')) {
        errs.onlineUrl = 'A valid online meeting/streaming URL is required for Online events.';
      }
    } else {
      if (!venue.trim()) {
        errs.venue = 'Physical venue address is required for In-Person events.';
      }
    }
    if (technologies.length === 0) {
      errs.technologies = 'Add at least one technology or topic tag.';
    }
    if (!registrationUrl.trim() || !registrationUrl.startsWith('http')) {
      errs.registrationUrl = 'A valid registration URL is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      summary: summary.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      category: category.trim(),
      technologies,
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      timezone,
      format,
      venue: format === 'IN_PERSON' ? venue.trim() : null,
      onlineUrl: format === 'ONLINE' ? onlineUrl.trim() : null,
      targetAudience: targetAudience.trim(),
      registrationUrl: registrationUrl.trim(),
      status,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Basic Info Section */}
      <div className="glass-card p-6 md:p-8 space-y-6 border-slate-800">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-bold text-white">Event Basics</h2>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-200">
            Event Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Next-Generation AI & Autonomous Agents Conference"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm"
          />
          {errors.title && <p className="text-xs text-rose-400">{errors.title}</p>}
        </div>

        {/* Slug Preview */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
            <span>URL Slug</span>
            <span className="text-xs font-normal text-slate-400">
              Live link: /events/{slug || '...'}
            </span>
          </label>
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden focus-within:border-brand-500">
            <span className="px-3 py-3 text-xs text-slate-400 bg-slate-800/60 border-r border-slate-800 select-none">
              /events/
            </span>
            <input
              type="text"
              placeholder="auto-generated-from-title"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full px-3 py-3 bg-transparent text-white text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">Publication Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('DRAFT')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  status === 'DRAFT'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus('PUBLISHED')}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  status === 'PUBLISHED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Publish Live
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-200 flex justify-between">
            <span>Short Summary</span>
            <span className="text-xs text-slate-400 font-normal">
              {summary.length}/300 characters
            </span>
          </label>
          <textarea
            required
            rows={2}
            maxLength={300}
            placeholder="A compelling 1-2 sentence hook for cards and previews..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm leading-relaxed"
          />
          {errors.summary && <p className="text-xs text-rose-400">{errors.summary}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-200">
            Full Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={6}
            placeholder="Detailed event breakdown, agenda, keynote speakers, requirements, and takeaways..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm leading-relaxed"
          />
          {errors.description && <p className="text-xs text-rose-400">{errors.description}</p>}
        </div>
      </div>

      {/* Format, Location & Schedule Section */}
      <div className="glass-card p-6 md:p-8 space-y-6 border-slate-800">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Format & Schedule</h2>
        </div>

        {/* Format Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Event Format</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormat('ONLINE')}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                format === 'ONLINE'
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-glowCyan'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Online Stream / Virtual</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('IN_PERSON')}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                format === 'IN_PERSON'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>In-Person Physical Gathering</span>
            </button>
          </div>
        </div>

        {/* Dynamic Location Field */}
        {format === 'ONLINE' ? (
          <div className="space-y-1.5 animate-slide-up">
            <label className="text-sm font-semibold text-slate-200">
              Online Meeting / Stream URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="url"
                required
                placeholder="https://stream.eventsphere.io/session or Zoom/YouTube link"
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
            {errors.onlineUrl && <p className="text-xs text-rose-400">{errors.onlineUrl}</p>}
          </div>
        ) : (
          <div className="space-y-1.5 animate-slide-up">
            <label className="text-sm font-semibold text-slate-200">
              Venue Name & Physical Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                required
                placeholder="e.g. Moscone Center, 747 Howard St, San Francisco, CA"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
            {errors.venue && <p className="text-xs text-rose-400">{errors.venue}</p>}
          </div>
        )}

        {/* Date, Time & Timezone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">
              Start Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]"
            />
            {errors.startDateTime && <p className="text-xs text-rose-400">{errors.startDateTime}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">
              End Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]"
            />
            {errors.endDateTime && <p className="text-xs text-rose-400">{errors.endDateTime}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media, Tech & Registration */}
      <div className="glass-card p-6 md:p-8 space-y-6 border-slate-800">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Media & Registration</h2>
        </div>

        {/* Image URL & Live Preview */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-200">
            Cover Image URL <span className="text-rose-400">*</span>
          </label>
          <input
            type="url"
            required
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
          />
          {errors.imageUrl && <p className="text-xs text-rose-400">{errors.imageUrl}</p>}

          {imageUrl && (
            <div className="relative h-44 w-full max-w-md rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
              />
              <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-slate-300">
                Live Preview
              </span>
            </div>
          )}
        </div>

        {/* Technologies Tags */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">
            Technologies & Topics <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. React, Rust, Kubernetes (press enter or click Add)"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTech}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Tag
            </Button>
          </div>
          {errors.technologies && <p className="text-xs text-rose-400">{errors.technologies}</p>}

          <div className="flex items-center gap-2 flex-wrap pt-2">
            {technologies.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-300"
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(idx)}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Target Audience & External Registration URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">
              Target Audience <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineers, DevOps Leads"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-200">
              External Registration URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://tickets.eventbrite.com/..."
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
            {errors.registrationUrl && (
              <p className="text-xs text-rose-400">{errors.registrationUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
