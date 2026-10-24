import React, { useState } from 'react';
import { Copy, Check, Share2, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { EventItem } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!event) return null;

  const eventUrl = `${window.location.origin}/events/${event.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      showToast('Event link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.summary,
          url: eventUrl,
        });
      } catch (e) {
        // Ignored or cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${event.title} on EventSphere:`
  )}&url=${encodeURIComponent(eventUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    eventUrl
  )}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this event: ${event.title} ${eventUrl}`
  )}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share This Event"
      description={`Share "${event.title}" with your network or colleagues.`}
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Copy Link Input Bar */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Shareable URL
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-brand-500">
            <input
              type="text"
              readOnly
              value={eventUrl}
              className="flex-1 bg-transparent px-3 py-1 text-sm text-slate-200 outline-none truncate"
            />
            <Button
              variant={copied ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Share via Social Channels
          </label>
          <div className="grid grid-cols-3 gap-3">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <Twitter className="w-4 h-4 text-sky-400" />
              <span>X / Twitter</span>
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <Linkedin className="w-4 h-4 text-blue-400" />
              <span>LinkedIn</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Device Native Share option if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            size="md"
            onClick={handleNativeShare}
            leftIcon={<Share2 className="w-4 h-4" />}
            className="w-full"
          >
            More Sharing Options (System Dialog)
          </Button>
        )}
      </div>
    </Modal>
  );
};
