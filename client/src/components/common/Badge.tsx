import React from 'react';
import { Video, MapPin } from 'lucide-react';
import { Format, Status } from '../../types';

export const FormatBadge: React.FC<{ format: Format }> = ({ format }) => {
  if (format === 'ONLINE') {
    return (
      <span className="badge-online">
        <Video className="w-3.5 h-3.5" />
        Online
      </span>
    );
  }
  return (
    <span className="badge-inperson">
      <MapPin className="w-3.5 h-3.5" />
      In-Person
    </span>
  );
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  if (status === 'PUBLISHED') {
    return <span className="badge-published">● Published</span>;
  }
  return <span className="badge-draft">○ Draft</span>;
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  return <span className="badge-category">{category}</span>;
};
