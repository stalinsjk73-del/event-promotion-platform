export const getSafeTimeZone = (tz?: string): string => {
  if (!tz) return 'UTC';
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    // If browser does not recognize the timezone string, fallback to UTC
    return 'UTC';
  }
};

export const formatEventDateTime = (
  start: string,
  end?: string,
  timezone?: string
): { dateStr: string; timeStr: string; fullStr: string } => {
  const startDate = new Date(start);
  const tz = getSafeTimeZone(timezone);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: tz,
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  };

  try {
    const dateStr = startDate.toLocaleDateString('en-US', dateOptions);
    const startTimeStr = startDate.toLocaleTimeString('en-US', timeOptions);

    let timeStr = startTimeStr;
    if (end) {
      const endDate = new Date(end);
      const endTimeStr = endDate.toLocaleTimeString('en-US', timeOptions);
      timeStr = `${startTimeStr} – ${endTimeStr} (${timezone || tz})`;
    } else {
      timeStr = `${startTimeStr} (${timezone || tz})`;
    }

    return {
      dateStr,
      timeStr,
      fullStr: `${dateStr} · ${timeStr}`,
    };
  } catch {
    // Safe fallback in case of date formatting anomaly
    const dateStr = startDate.toDateString();
    const timeStr = startDate.toLocaleTimeString();
    return {
      dateStr,
      timeStr,
      fullStr: `${dateStr} · ${timeStr}`,
    };
  }
};

export const formatDateShort = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const toInputDateTime = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};
