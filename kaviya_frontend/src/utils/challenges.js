//
// PUBLIC_INTERFACE
// Challenge storage helpers (mock) using localStorage.
// Namespaced under 'kavia_parent_challenges' keyed by child username.
//
// Shape:
// {
//   [childUsername: string]: Array<Challenge>
// }
//
// Challenge:
// {
//   id: string,
//   subject: 'Math' | 'English' | 'Science',
//   target: number,       // 0-100 target score
//   message?: string,     // optional note from parent
//   status: 'Open' | 'Accepted' | 'Completed' | 'Canceled',
//   createdAt: string,    // ISO
//   acceptedAt?: string,
//   dueBy?: string,       // hint date (mock)
//   completedAt?: string,
// }
const KEY = 'kavia_parent_challenges';

// Utility safe read
function _read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function _write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data || {}));
  } catch {}
}

// PUBLIC_INTERFACE
export function getChallengesForKid(username) {
  /** Return array of challenges for kid username (may be empty). */
  const all = _read();
  const list = Array.isArray(all[username]) ? all[username] : [];
  // Ensure structure robustness
  return list.map((c) => ({
    id: String(c.id || ''),
    subject: ['Math', 'English', 'Science'].includes(c.subject) ? c.subject : 'Math',
    target: Math.max(0, Math.min(100, Number(c.target || 0))),
    message: typeof c.message === 'string' ? c.message : '',
    status: ['Open', 'Accepted', 'Completed', 'Canceled'].includes(c.status) ? c.status : 'Open',
    createdAt: c.createdAt || new Date().toISOString(),
    acceptedAt: c.acceptedAt || undefined,
    dueBy: c.dueBy || undefined,
    completedAt: c.completedAt || undefined,
  }));
}

// PUBLIC_INTERFACE
export function saveChallenge(username, challenge) {
  /** Add a new challenge for username; returns saved challenge (with id). */
  const all = _read();
  const list = Array.isArray(all[username]) ? all[username] : [];
  const id = challenge.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    subject: challenge.subject,
    target: Math.max(0, Math.min(100, Number(challenge.target || 0))),
    message: challenge.message || '',
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...list];
  all[username] = next;
  _write(all);
  return record;
}

// PUBLIC_INTERFACE
export function updateChallenge(username, id, updates) {
  /** Update a challenge by id; returns updated record or null. */
  const all = _read();
  const list = Array.isArray(all[username]) ? all[username] : [];
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const current = list[idx];
  const next = { ...current, ...updates };
  list[idx] = next;
  all[username] = list;
  _write(all);
  return next;
}

// PUBLIC_INTERFACE
export function cancelChallenge(username, id) {
  /** Set status to Canceled (does not remove). Returns boolean. */
  return !!updateChallenge(username, id, { status: 'Canceled' });
}

// PUBLIC_INTERFACE
export function acceptChallenge(username, id) {
  /** Mark status Accepted and set a mock dueBy hint (+3 days). */
  const dueBy = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const acceptedAt = new Date().toISOString();
  return !!updateChallenge(username, id, { status: 'Accepted', dueBy, acceptedAt });
}

// PUBLIC_INTERFACE
export function completeChallenge(username, id) {
  /** Mark status Completed and set completedAt. */
  const completedAt = new Date().toISOString();
  return !!updateChallenge(username, id, { status: 'Completed', completedAt });
}

// PUBLIC_INTERFACE
export function countOpenChallenges(username) {
  /** Return count of challenges with status 'Open' for username. */
  return getChallengesForKid(username).filter((c) => c.status === 'Open').length;
}

// PUBLIC_INTERFACE
export function findMatchingAcceptedChallenges(username, subject) {
  /** Return accepted challenges for subject. */
  return getChallengesForKid(username).filter(
    (c) => c.status === 'Accepted' && (c.subject || '').toLowerCase() === (subject || '').toLowerCase()
  );
}

// PUBLIC_INTERFACE
export function getFirstOpenChallenge(username) {
  /** Return the first open challenge or null. */
  const list = getChallengesForKid(username);
  return list.find((c) => c.status === 'Open') || null;
}
