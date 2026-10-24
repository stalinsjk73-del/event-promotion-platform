import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { EventItem } from '../../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  if (!event) return null;

  const handleProceed = () => {
    window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Registration"
      maxWidth="md"
    >
      <div className="space-y-5 pt-2">
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-white mb-1">Official External Registration</p>
            <p className="text-slate-300">
              You are being directed to the organizer&apos;s verified ticketing portal to secure your spot for{' '}
              <strong className="text-white">{event.title}</strong>.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Destination URL
          </p>
          <p className="text-xs font-mono text-cyan-400 truncate">
            {event.registrationUrl}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleProceed}
            rightIcon={<ExternalLink className="w-4 h-4" />}
          >
            Continue to Registration
          </Button>
        </div>
      </div>
    </Modal>
  );
};
