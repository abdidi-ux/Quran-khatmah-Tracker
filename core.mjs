export const JUZ_KEYS = Array.from({ length: 30 }, (_, index) => `j${String(index + 1).padStart(2, '0')}`);

export function dayKeyAt(date = new Date(), timeZone = 'America/Toronto') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dayLabelAt(date = new Date(), timeZone = 'America/Toronto', locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function cleanDisplayName(value, maxLength = 40) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function cleanComment(value, maxLength = 240) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function normalizeInvite(value) {
  return String(value ?? '').replace(/\s+/g, '').trim().toUpperCase();
}

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function normalizeComment(comment) {
  if (!comment || typeof comment !== 'object') return null;
  const text = cleanComment(comment.text);
  const authorName = cleanDisplayName(comment.authorName);
  if (!text || !authorName) return null;
  return {
    id: String(comment.id || ''),
    authorId: String(comment.authorId || ''),
    authorName,
    text,
    at: Number(comment.at) || 0,
  };
}

export function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return { done: false, name: '', readerId: '', at: 0, comments: [] };
  }
  const legacyDone = Boolean(entry.name || entry.at);
  return {
    done: typeof entry.done === 'boolean' ? entry.done : legacyDone,
    name: cleanDisplayName(entry.name),
    readerId: String(entry.readerId || ''),
    at: Number(entry.at) || 0,
    comments: Array.isArray(entry.comments)
      ? entry.comments.map(normalizeComment).filter(Boolean).slice(-30)
      : [],
  };
}

export function emptyState(today, khatmahCount = 0) {
  return {
    dateKey: today,
    completed: {},
    khatmahCount: Math.max(0, Number(khatmahCount) || 0),
    completedForDate: false,
  };
}

export function normalizeState(value, today) {
  const source = value && typeof value === 'object' ? value : {};
  if (source.dateKey !== today) return emptyState(today, source.khatmahCount);
  const completed = {};
  const sourceCompleted = source.completed && typeof source.completed === 'object' ? source.completed : {};
  for (const key of JUZ_KEYS) {
    if (!sourceCompleted[key]) continue;
    const entry = normalizeEntry(sourceCompleted[key]);
    if (entry.done || entry.comments.length) completed[key] = entry;
  }
  return {
    dateKey: today,
    completed,
    khatmahCount: Math.max(0, Number(source.khatmahCount) || 0),
    completedForDate: Boolean(source.completedForDate),
  };
}

export function completedCount(state) {
  return JUZ_KEYS.reduce((count, key) => count + (normalizeEntry(state?.completed?.[key]).done ? 1 : 0), 0);
}

export function completionPercent(state) {
  return Math.round((completedCount(state) / 30) * 100);
}

export function toggleJuzState(state, key, member, now = Date.now()) {
  if (!JUZ_KEYS.includes(key)) throw new Error('Invalid Juz');
  const next = normalizeState(state, state.dateKey);
  if (next.completedForDate) return { state: next, blocked: 'locked', completedNow: false };
  const current = normalizeEntry(next.completed[key]);

  if (current.done) {
    const ownedBySomeoneElse = current.readerId
      ? current.readerId !== member.id
      : current.name && current.name !== member.name;
    if (ownedBySomeoneElse) return { state: next, blocked: 'owned', completedNow: false };
    current.done = false;
    current.name = '';
    current.readerId = '';
    current.at = 0;
    if (current.comments.length) next.completed[key] = current;
    else delete next.completed[key];
  } else {
    next.completed[key] = {
      ...current,
      done: true,
      name: cleanDisplayName(member.name),
      readerId: String(member.id || ''),
      at: Number(now),
    };
  }

  const isComplete = completedCount(next) === 30;
  if (isComplete) {
    next.completedForDate = true;
    next.khatmahCount += 1;
  }
  return { state: next, blocked: null, completedNow: isComplete };
}

export function addCommentToState(state, key, member, text, id, now = Date.now(), maxComments = 30) {
  if (!JUZ_KEYS.includes(key)) throw new Error('Invalid Juz');
  const cleaned = cleanComment(text);
  if (!cleaned) throw new Error('Comment is empty');
  const next = normalizeState(state, state.dateKey);
  const entry = normalizeEntry(next.completed[key]);
  entry.comments.push({
    id: String(id),
    authorId: String(member.id || ''),
    authorName: cleanDisplayName(member.name),
    text: cleaned,
    at: Number(now),
  });
  entry.comments = entry.comments.slice(-Math.max(1, maxComments));
  next.completed[key] = entry;
  return next;
}

export function recentActivity(state, limit = 8) {
  const events = [];
  for (const key of JUZ_KEYS) {
    const juz = Number(key.slice(1));
    const entry = normalizeEntry(state?.completed?.[key]);
    if (entry.done && entry.at) {
      events.push({ type: 'read', key, juz, name: entry.name, at: entry.at });
    }
    for (const comment of entry.comments) {
      events.push({ type: 'comment', key, juz, name: comment.authorName, text: comment.text, at: comment.at });
    }
  }
  return events.sort((a, b) => b.at - a.at).slice(0, limit);
}
