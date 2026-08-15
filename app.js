import { SETTINGS } from './config.js';
import {
  JUZ_KEYS,
  addCommentToState,
  cleanDisplayName,
  completedCount,
  completionPercent,
  dayKeyAt,
  dayLabelAt,
  emptyState,
  normalizeEntry,
  normalizeInvite,
  normalizeState,
  recentActivity,
  sha256Hex,
  toggleJuzState,
} from './core.mjs';

const translations = {
  en: {
    sharedKhatmah: 'Shared Khatmah',
    topbarMessage: 'Read sincerely, mark accurately, and encourage one another.',
    brandSub: 'Complete the Qur’an together', share: 'Share', theme: 'Change theme', addName: 'Add your name',
    eyebrow: 'One community · Thirty parts · One intention', heroTitle: 'Read together.<br>Complete together.',
    heroDescription: 'Choose a Juz, read it, then mark it complete. Everyone in the circle sees the shared progress in real time.',
    viewTracker: 'View today’s tracker', privateCircle: 'Private invite-only circle',
    verseTranslation: '“So compete with one another in doing good.” · Qur’an 2:148', juzComplete: 'Juz complete',
    todayProgress: 'Today’s progress', khatmahsCompleted: 'Khatmahs completed', connecting: 'Connecting securely…',
    dailyCircle: 'Daily circle', todaysJuz: 'Today’s Juz', trackerHelp: 'Mark a Juz after reading it. Open comments to encourage the group.',
    trackerDate: 'Tracker date', completeTitle: 'Alhamdulillah — Khatmah complete!', completeMessage: 'The count has increased. Today’s circle is now complete.',
    community: 'Community', recentActivity: 'Recent activity', live: 'Live', personalRecitation: 'A personal recitation for healing',
    forFather: 'For our beloved father', healingDescription: 'Complete these recitations and make sincere du‘ā. May Allah grant him complete shifā’, ease, and strength.',
    privateChecklist: 'Private · saved on your device', simpleRespectful: 'Simple and respectful', howItWorks: 'How the circle works',
    choose: 'Choose', chooseHelp: 'Select an available Juz you intend to read.', readMark: 'Read & mark', readMarkHelp: 'Mark it only after completing the full Juz.',
    encourage: 'Encourage', encourageHelp: 'Leave a thoughtful comment for fellow readers.', footerMessage: 'Built for collective worship, care, and accountability.',
    resetTimezone: 'Daily reset timezone', welcome: 'Welcome to the circle', inviteTitle: 'Enter your invite code',
    inviteDescription: 'This private circle is for invited family and community members.', inviteLabel: 'Invite code', joinCircle: 'Join the circle',
    askOrganizer: 'Ask the organizer if you do not have the code.', yourProfile: 'Your profile', nameTitle: 'What should we call you?',
    nameDescription: 'Your display name appears beneath any Juz you complete and beside your comments.', displayName: 'Display name', saveName: 'Save name',
    recognizableName: 'Use a name your reading group will recognize.', discussion: 'Discussion', juz: 'Juz', addComment: 'Add a comment',
    commentPlaceholder: 'Write a kind, helpful message…', postComment: 'Post comment', available: 'Available to read', readBy: 'Read by {name}',
    comments: 'Comments', noComments: 'No comments yet. Be the first to encourage the circle.', noActivity: 'No activity yet today. Complete a Juz to begin the circle.',
    readActivity: '{name} completed Juz {juz}', commentActivity: '{name} commented on Juz {juz}', justNow: 'just now',
    personalProgress: 'Your progress: {count} of {total} complete · resets daily', liveStatus: 'Live · changes sync for everyone',
    demoStatus: 'Demo mode · changes stay on this device', offlineStatus: 'Offline · reconnecting automatically', wrongCode: 'That invite code is not correct.',
    nameSaved: 'Name saved', markedComplete: 'Juz marked complete', unmarked: 'Juz reopened', owned: 'Only the reader who completed this Juz can reopen it.',
    circleLocked: 'Today’s circle is already complete.', commentPosted: 'Comment posted', commentFailed: 'Could not post. Please try again.',
    khatmahCompleteToast: 'Alhamdulillah — the Khatmah is complete!', linkCopied: 'Link copied', shareText: 'Join our Qur’an Khatmah Circle.',
    fatihaTitle: 'Surah Al-Fatiha', fatihaDetail: 'Read seven times', kursiTitle: 'Ayatul Kursi', kursiDetail: 'Al-Baqarah · 2:255',
    last2Title: 'Last two ayahs', last2Detail: 'Al-Baqarah · 2:285–286', ikhlasTitle: 'Surah Al-Ikhlas', ikhlasDetail: 'Surah 112',
    falaqTitle: 'Surah Al-Falaq', falaqDetail: 'Surah 113', nasTitle: 'Surah An-Nas', nasDetail: 'Surah 114',
  },
  ar: {
    sharedKhatmah: 'ختمة جماعية', topbarMessage: 'اقرأ بإخلاص، وسجّل بدقة، وشجّع الآخرين.', brandSub: 'نُتمّ القرآن معًا',
    share: 'مشاركة', theme: 'تغيير المظهر', addName: 'أضف اسمك', eyebrow: 'مجتمع واحد · ثلاثون جزءًا · نية واحدة',
    heroTitle: 'نقرأ معًا.<br>ونختم معًا.', heroDescription: 'اختر جزءًا واقرأه ثم سجّل إتمامه. يرى جميع أفراد الحلقة التقدّم المشترك مباشرة.',
    viewTracker: 'عرض متابعة اليوم', privateCircle: 'حلقة خاصة بالدعوة', verseTranslation: '«فاستبقوا الخيرات» · سورة البقرة 148',
    juzComplete: 'جزء مكتمل', todayProgress: 'تقدّم اليوم', khatmahsCompleted: 'الختمات المكتملة', connecting: 'جارٍ الاتصال الآمن…',
    dailyCircle: 'حلقة اليوم', todaysJuz: 'أجزاء اليوم', trackerHelp: 'سجّل الجزء بعد إتمام قراءته، وافتح التعليقات لتشجيع المجموعة.',
    trackerDate: 'تاريخ المتابعة', completeTitle: 'الحمد لله — اكتملت الختمة!', completeMessage: 'ازداد عدّاد الختمات، واكتملت حلقة اليوم.',
    community: 'المجتمع', recentActivity: 'آخر النشاطات', live: 'مباشر', personalRecitation: 'ورد شخصي للشفاء', forFather: 'لوالدنا الحبيب',
    healingDescription: 'أتمّ هذه القراءات وادعُ بإخلاص. نسأل الله أن يمنحه الشفاء التام واليسر والقوة.', privateChecklist: 'خاص · محفوظ على جهازك',
    simpleRespectful: 'بسيط ومحترم', howItWorks: 'كيف تعمل الحلقة', choose: 'اختر', chooseHelp: 'اختر جزءًا متاحًا تنوي قراءته.',
    readMark: 'اقرأ وسجّل', readMarkHelp: 'سجّل الإتمام بعد قراءة الجزء كاملًا.', encourage: 'شجّع', encourageHelp: 'اترك تعليقًا طيبًا للقرّاء.',
    footerMessage: 'صُمّم للعبادة الجماعية والرعاية والمساءلة.', resetTimezone: 'منطقة إعادة الضبط اليومية', welcome: 'مرحبًا بك في الحلقة',
    inviteTitle: 'أدخل رمز الدعوة', inviteDescription: 'هذه الحلقة الخاصة مخصّصة للعائلة وأفراد المجتمع المدعوين.', inviteLabel: 'رمز الدعوة',
    joinCircle: 'انضم إلى الحلقة', askOrganizer: 'اسأل المنظّم إذا لم يكن لديك الرمز.', yourProfile: 'ملفك', nameTitle: 'بأي اسم نناديك؟',
    nameDescription: 'يظهر اسمك تحت الأجزاء التي تتمّها وبجوار تعليقاتك.', displayName: 'الاسم الظاهر', saveName: 'حفظ الاسم',
    recognizableName: 'استخدم اسمًا يعرفه أفراد الحلقة.', discussion: 'النقاش', juz: 'الجزء', addComment: 'أضف تعليقًا',
    commentPlaceholder: 'اكتب رسالة طيبة ومفيدة…', postComment: 'نشر التعليق', available: 'متاح للقراءة', readBy: 'قرأه {name}', comments: 'التعليقات',
    noComments: 'لا توجد تعليقات بعد. كن أول من يشجّع الحلقة.', noActivity: 'لا يوجد نشاط اليوم بعد. أتمّ جزءًا لبدء الحلقة.',
    readActivity: 'أتمّ {name} الجزء {juz}', commentActivity: 'علّق {name} على الجزء {juz}', justNow: 'الآن',
    personalProgress: 'تقدّمك: {count} من {total} مكتمل · يُعاد يوميًا', liveStatus: 'مباشر · تتزامن التغييرات للجميع',
    demoStatus: 'وضع تجريبي · التغييرات محفوظة على هذا الجهاز', offlineStatus: 'غير متصل · ستتم إعادة الاتصال تلقائيًا',
    wrongCode: 'رمز الدعوة غير صحيح.', nameSaved: 'تم حفظ الاسم', markedComplete: 'تم تسجيل إتمام الجزء', unmarked: 'أُعيد فتح الجزء',
    owned: 'القارئ الذي أتمّ هذا الجزء وحده يستطيع إعادة فتحه.', circleLocked: 'اكتملت حلقة اليوم بالفعل.', commentPosted: 'تم نشر التعليق',
    commentFailed: 'تعذّر النشر. حاول مرة أخرى.', khatmahCompleteToast: 'الحمد لله — اكتملت الختمة!', linkCopied: 'تم نسخ الرابط',
    shareText: 'انضم إلى حلقة ختم القرآن.', fatihaTitle: 'سورة الفاتحة', fatihaDetail: 'تُقرأ سبع مرات', kursiTitle: 'آية الكرسي',
    kursiDetail: 'البقرة · 255', last2Title: 'آخر آيتين', last2Detail: 'البقرة · 285–286', ikhlasTitle: 'سورة الإخلاص', ikhlasDetail: 'السورة 112',
    falaqTitle: 'سورة الفلق', falaqDetail: 'السورة 113', nasTitle: 'سورة الناس', nasDetail: 'السورة 114',
  },
};

const storageKeys = {
  invite: 'khatmah:invite:v2', member: 'khatmah:member:v2', language: 'khatmah:language:v2', theme: 'khatmah:theme:v2',
  state: 'khatmah:state:v2', recitations: (day) => `khatmah:recitations:${day}`,
};
const params = new URLSearchParams(location.search);
const forceDemo = params.get('demo') === '1' || location.protocol === 'file:';
let language = localStorage.getItem(storageKeys.language) === 'ar' ? 'ar' : 'en';
let state = emptyState(todayKey());
let member = loadMember();
let selectedJuzKey = null;
let live = false;
let started = false;
let db = null;
let trackerRef = null;
let firestore = null;
let unsubscribe = null;
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);
const elements = {
  ring: $('#ring'), progressCount: $('#progressCount'), percent: $('#percent'), khatmahCount: $('#khatmahCount'),
  todayLabel: $('#todayLabel'), completeBanner: $('#completeBanner'), juzGrid: $('#juzGrid'), activityList: $('#activityList'),
  recitationGrid: $('#recitationGrid'), personalProgress: $('#personalProgress'), connectionStatus: $('#connectionStatus'),
  profileName: $('#profileName'), inviteDialog: $('#inviteDialog'), inviteForm: $('#inviteForm'), inviteCode: $('#inviteCode'),
  inviteError: $('#inviteError'), nameDialog: $('#nameDialog'), nameForm: $('#nameForm'), nameInput: $('#nameInput'),
  commentDialog: $('#commentDialog'), commentJuzNumber: $('#commentJuzNumber'), commentList: $('#commentList'),
  commentForm: $('#commentForm'), commentInput: $('#commentInput'), commentCount: $('#commentCount'), toast: $('#toast'),
};

function todayKey() { return dayKeyAt(new Date(), SETTINGS.timeZone); }
function text(key, values = {}) {
  let value = translations[language][key] ?? translations.en[key] ?? key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}
function safeShow(dialog) { if (dialog && !dialog.open) dialog.showModal(); }
function safeClose(dialog) { if (dialog?.open) dialog.close(); }
function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}
function escapeInitial(name) { return cleanDisplayName(name).charAt(0).toUpperCase() || '•'; }

function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.title = language === 'ar' ? 'حلقة ختم القرآن' : 'Qur’an Khatmah Circle';
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => { element.innerHTML = text(element.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', text(element.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = text(element.dataset.i18nPlaceholder); });
  $('#languageBtn').textContent = language === 'en' ? 'العربية' : 'English';
  elements.todayLabel.textContent = dayLabelAt(new Date(), SETTINGS.timeZone, language === 'ar' ? 'ar' : 'en-US');
  updateProfileLabel();
  renderAll();
}

function setInitialTheme() {
  const saved = localStorage.getItem(storageKeys.theme);
  const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
function updateProfileLabel() { elements.profileName.textContent = member?.name || text('addName'); }
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

function loadMember() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKeys.member) || 'null');
    return value?.id && cleanDisplayName(value.name) ? { ...value, name: cleanDisplayName(value.name) } : null;
  } catch { return null; }
}
function saveMember(name) {
  member = {
    id: member?.id || globalThis.crypto.randomUUID(),
    name: cleanDisplayName(name),
    joinedAt: member?.joinedAt || Date.now(),
  };
  localStorage.setItem(storageKeys.member, JSON.stringify(member));
  updateProfileLabel();
}
function requireMember() {
  if (member?.name) return true;
  elements.nameInput.value = '';
  safeShow(elements.nameDialog);
  setTimeout(() => elements.nameInput.focus(), 50);
  return false;
}

function renderAll() {
  state = normalizeState(state, todayKey());
  renderSummary();
  renderJuz();
  renderActivity();
  renderPersonal();
  if (elements.commentDialog.open && selectedJuzKey) renderComments();
}
function renderSummary() {
  const count = completedCount(state);
  const percent = completionPercent(state);
  elements.progressCount.textContent = count;
  elements.percent.textContent = `${percent}%`;
  elements.khatmahCount.textContent = state.khatmahCount;
  elements.ring.style.setProperty('--progress', `${(count / 30) * 360}deg`);
  elements.ring.setAttribute('aria-label', `${count} of 30 Juz complete`);
  elements.completeBanner.classList.toggle('show', state.completedForDate);
  elements.juzGrid.classList.toggle('locked', state.completedForDate);
}
function renderJuz() {
  elements.juzGrid.replaceChildren();
  for (const key of JUZ_KEYS) {
    const number = Number(key.slice(1));
    const entry = normalizeEntry(state.completed[key]);
    const card = createElement('article', `juz-card${entry.done ? ' checked' : ''}`);
    const toggle = createElement('button', 'juz-toggle');
    toggle.type = 'button';
    toggle.disabled = state.completedForDate;
    toggle.dataset.key = key;
    toggle.setAttribute('aria-pressed', String(entry.done));
    toggle.setAttribute('aria-label', `${text('juz')} ${number}: ${entry.done ? text('readBy', { name: entry.name }) : text('available')}`);
    toggle.append(createElement('span', 'juz-number', String(number).padStart(2, '0')));
    toggle.append(createElement('span', 'juz-check', entry.done ? '✓' : ''));
    const readerLabel = createElement('span', 'reader-name', entry.done ? text('readBy', { name: entry.name }) : text('available'));
    readerLabel.dir = 'auto';
    toggle.append(readerLabel);
    toggle.addEventListener('click', () => toggleJuz(key));
    const comments = createElement('button', 'comment-open');
    comments.type = 'button';
    comments.dataset.commentKey = key;
    comments.append(createElement('span', '', text('comments')));
    comments.append(createElement('span', 'comment-count', entry.comments.length));
    comments.addEventListener('click', () => openComments(key));
    card.append(toggle, comments);
    elements.juzGrid.append(card);
  }
}
function relativeTime(timestamp) {
  const seconds = Math.round((Number(timestamp) - Date.now()) / 1000);
  if (Math.abs(seconds) < 45) return text('justNow');
  const formatter = new Intl.RelativeTimeFormat(language === 'ar' ? 'ar' : 'en', { numeric: 'auto' });
  if (Math.abs(seconds) < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (Math.abs(seconds) < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}
function renderActivity() {
  const events = recentActivity(state, 7);
  elements.activityList.replaceChildren();
  if (!events.length) {
    elements.activityList.append(createElement('div', 'empty-state', text('noActivity')));
    return;
  }
  for (const event of events) {
    const item = createElement('article', 'activity-item');
    item.append(createElement('div', 'activity-icon', event.type === 'read' ? '✓' : '“'));
    const copy = createElement('div', 'activity-copy');
    const activityTitle = createElement('strong', '', text(event.type === 'read' ? 'readActivity' : 'commentActivity', { name: event.name, juz: event.juz }));
    activityTitle.dir = 'auto';
    copy.append(activityTitle);
    if (event.type === 'comment') {
      const activityComment = createElement('p', '', event.text);
      activityComment.dir = 'auto';
      copy.append(activityComment);
    }
    item.append(copy, createElement('time', 'activity-time', relativeTime(event.at)));
    elements.activityList.append(item);
  }
}

const recitations = [
  { id: 'fatiha7', title: 'fatihaTitle', detail: 'fatihaDetail', count: '7×' },
  { id: 'kursi', title: 'kursiTitle', detail: 'kursiDetail', count: '1×' },
  { id: 'last2', title: 'last2Title', detail: 'last2Detail', count: '1×' },
  { id: 'ikhlas', title: 'ikhlasTitle', detail: 'ikhlasDetail', count: '3×' },
  { id: 'falaq', title: 'falaqTitle', detail: 'falaqDetail', count: '3×' },
  { id: 'nas', title: 'nasTitle', detail: 'nasDetail', count: '3×' },
];
function loadPersonal() {
  try { return JSON.parse(localStorage.getItem(storageKeys.recitations(todayKey())) || '{}'); }
  catch { return {}; }
}
function renderPersonal() {
  const checks = loadPersonal();
  elements.recitationGrid.replaceChildren();
  for (const item of recitations) {
    const done = Boolean(checks[item.id]);
    const button = createElement('button', `recite-button${done ? ' done' : ''}`);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(done));
    button.append(createElement('span', 'recite-title', text(item.title)));
    button.append(createElement('span', 'recite-check', done ? '✓' : ''));
    button.append(createElement('span', 'recite-detail', text(item.detail)));
    button.append(createElement('span', 'recite-count', item.count));
    button.addEventListener('click', () => {
      checks[item.id] = !checks[item.id];
      localStorage.setItem(storageKeys.recitations(todayKey()), JSON.stringify(checks));
      renderPersonal();
    });
    elements.recitationGrid.append(button);
  }
  const count = Object.values(checks).filter(Boolean).length;
  elements.personalProgress.innerHTML = text('personalProgress', { count: `<strong>${count}</strong>`, total: recitations.length });
}

function openComments(key) {
  if (!requireMember()) return;
  selectedJuzKey = key;
  elements.commentJuzNumber.textContent = String(Number(key.slice(1))).padStart(2, '0');
  elements.commentInput.value = '';
  elements.commentCount.textContent = '0/240';
  renderComments();
  safeShow(elements.commentDialog);
}
function renderComments() {
  const comments = normalizeEntry(state.completed[selectedJuzKey]).comments;
  elements.commentList.replaceChildren();
  if (!comments.length) {
    elements.commentList.append(createElement('div', 'empty-state', text('noComments')));
    return;
  }
  for (const comment of comments.slice().reverse()) {
    const item = createElement('article', 'comment-item');
    item.append(createElement('div', 'comment-avatar', escapeInitial(comment.authorName)));
    const body = createElement('div', '');
    const meta = createElement('div', 'comment-meta');
    const author = createElement('strong', '', comment.authorName);
    author.dir = 'auto';
    meta.append(author, createElement('time', '', relativeTime(comment.at)));
    const commentText = createElement('p', 'comment-text', comment.text);
    commentText.dir = 'auto';
    body.append(meta, commentText);
    item.append(body);
    elements.commentList.append(item);
  }
}

function localLoad() {
  try { state = normalizeState(JSON.parse(localStorage.getItem(storageKeys.state) || 'null'), todayKey()); }
  catch { state = emptyState(todayKey()); }
  localSave();
  renderAll();
}
function localSave() { localStorage.setItem(storageKeys.state, JSON.stringify(state)); }
function setConnection(kind, messageKey) {
  elements.connectionStatus.className = `connection-status ${kind}`.trim();
  elements.connectionStatus.replaceChildren(createElement('span', 'status-dot'), createElement('span', '', text(messageKey)));
}

async function toggleJuz(key) {
  if (!requireMember()) return;
  let result;
  try {
    if (live) {
      await firestore.runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(trackerRef);
        const current = normalizeState(snapshot.exists() ? snapshot.data() : null, todayKey());
        result = toggleJuzState(current, key, member, Date.now());
        if (!result.blocked) transaction.set(trackerRef, result.state);
      });
    } else {
      result = toggleJuzState(state, key, member, Date.now());
      if (!result.blocked) { state = result.state; localSave(); renderAll(); }
    }
    if (result?.blocked === 'owned') return showToast(text('owned'));
    if (result?.blocked === 'locked') return showToast(text('circleLocked'));
    if (result?.completedNow) showToast(text('khatmahCompleteToast'));
    else showToast(normalizeEntry(result?.state?.completed?.[key]).done ? text('markedComplete') : text('unmarked'));
  } catch (error) {
    console.error(error);
    showToast(text('offlineStatus'));
  }
}

async function postComment() {
  if (!requireMember() || !selectedJuzKey) return;
  const value = elements.commentInput.value;
  if (!value.trim()) return;
  const id = globalThis.crypto.randomUUID();
  try {
    if (live) {
      await firestore.runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(trackerRef);
        const current = normalizeState(snapshot.exists() ? snapshot.data() : null, todayKey());
        const next = addCommentToState(current, selectedJuzKey, member, value, id, Date.now(), SETTINGS.maxCommentsPerJuz);
        transaction.set(trackerRef, next);
      });
    } else {
      state = addCommentToState(state, selectedJuzKey, member, value, id, Date.now(), SETTINGS.maxCommentsPerJuz);
      localSave();
      renderAll();
    }
    elements.commentInput.value = '';
    elements.commentCount.textContent = '0/240';
    showToast(text('commentPosted'));
  } catch (error) {
    console.error(error);
    showToast(text('commentFailed'));
  }
}

async function ensureLiveDay() {
  if (!live) return;
  try {
    await firestore.runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(trackerRef);
      const raw = snapshot.exists() ? snapshot.data() : null;
      const normalized = normalizeState(raw, todayKey());
      if (!raw || raw.dateKey !== normalized.dateKey) transaction.set(trackerRef, normalized);
    });
  } catch (error) { console.error('Daily reset check failed', error); }
}
async function startData() {
  if (started) return;
  started = true;
  elements.todayLabel.textContent = dayLabelAt(new Date(), SETTINGS.timeZone, language === 'ar' ? 'ar' : 'en-US');
  if (forceDemo) {
    live = false;
    localLoad();
    setConnection('demo', 'demoStatus');
    return;
  }
  try {
    const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
    firestore = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
    const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(SETTINGS.firebaseConfig);
    db = firestore.getFirestore(app);
    trackerRef = firestore.doc(db, ...SETTINGS.trackerPath);
    await firestore.runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(trackerRef);
      const raw = snapshot.exists() ? snapshot.data() : null;
      const normalized = normalizeState(raw, todayKey());
      if (!raw || raw.dateKey !== normalized.dateKey) transaction.set(trackerRef, normalized);
    });
    unsubscribe = firestore.onSnapshot(trackerRef, (snapshot) => {
      state = normalizeState(snapshot.exists() ? snapshot.data() : null, todayKey());
      renderAll();
      setConnection('', 'liveStatus');
    }, (error) => {
      console.error(error);
      setConnection('error', 'offlineStatus');
    });
    live = true;
    setConnection('', 'liveStatus');
  } catch (error) {
    console.error('Firebase unavailable; using local demo mode.', error);
    live = false;
    localLoad();
    setConnection('demo', 'demoStatus');
  }
}

async function unlockWithInvite(code) {
  const hash = await sha256Hex(normalizeInvite(code));
  if (hash !== SETTINGS.inviteHash) return false;
  localStorage.setItem(storageKeys.invite, SETTINGS.inviteHash);
  document.body.classList.remove('gated');
  safeClose(elements.inviteDialog);
  if (!member) requireMember();
  await startData();
  return true;
}
async function initializeAccess() {
  if (localStorage.getItem(storageKeys.invite) === SETTINGS.inviteHash) {
    document.body.classList.remove('gated');
    if (!member) requireMember();
    await startData();
  } else {
    document.body.classList.add('gated');
    safeShow(elements.inviteDialog);
    setTimeout(() => elements.inviteCode.focus(), 50);
  }
}

$('#languageBtn').addEventListener('click', () => {
  language = language === 'en' ? 'ar' : 'en';
  localStorage.setItem(storageKeys.language, language);
  applyLanguage();
});
$('#themeBtn').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(storageKeys.theme, next);
});
$('#profileBtn').addEventListener('click', () => {
  elements.nameInput.value = member?.name || '';
  safeShow(elements.nameDialog);
  setTimeout(() => elements.nameInput.focus(), 50);
});
$('#nameClose').addEventListener('click', () => safeClose(elements.nameDialog));
$('#commentClose').addEventListener('click', () => safeClose(elements.commentDialog));
elements.inviteDialog.addEventListener('cancel', (event) => event.preventDefault());
elements.inviteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  elements.inviteError.textContent = '';
  const button = elements.inviteForm.querySelector('button[type="submit"]');
  button.disabled = true;
  const valid = await unlockWithInvite(elements.inviteCode.value);
  button.disabled = false;
  if (!valid) {
    elements.inviteError.textContent = text('wrongCode');
    elements.inviteCode.select();
  }
});
elements.nameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = cleanDisplayName(elements.nameInput.value);
  if (!value) return;
  saveMember(value);
  safeClose(elements.nameDialog);
  showToast(text('nameSaved'));
});
elements.commentForm.addEventListener('submit', async (event) => { event.preventDefault(); await postComment(); });
elements.commentInput.addEventListener('input', () => { elements.commentCount.textContent = `${elements.commentInput.value.length}/240`; });
$('#shareBtn').addEventListener('click', async () => {
  const shareData = { title: document.title, text: text('shareText'), url: location.href.split('?')[0] };
  try {
    if (navigator.share) await navigator.share(shareData);
    else { await navigator.clipboard.writeText(shareData.url); showToast(text('linkCopied')); }
  } catch (error) { if (error?.name !== 'AbortError') console.error(error); }
});
window.addEventListener('online', () => { if (live) setConnection('', 'liveStatus'); });
window.addEventListener('offline', () => setConnection('error', 'offlineStatus'));
window.addEventListener('beforeunload', () => unsubscribe?.());
setInterval(() => {
  const current = todayKey();
  if (state.dateKey !== current) {
    if (live) ensureLiveDay();
    else { state = normalizeState(state, current); localSave(); renderAll(); }
  }
}, 60_000);

setInitialTheme();
$('#timezoneLabel').textContent = SETTINGS.timeZone;
applyLanguage();
initializeAccess();
