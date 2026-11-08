import { UserProfile, ChatMessage, GameMeeting, MeetingRsvpStatus } from '../types/bgg';

const STORAGE_KEYS = {
  USERS: 'bgg_community_users_v1',
  CURRENT_USER_ID: 'bgg_community_current_user_id_v1',
  MESSAGES: 'bgg_community_messages_v1',
  MEETINGS: 'bgg_community_meetings_v1',
  USER_CSV_PREFIX: 'bgg_user_csv_',
  USER_NOTES_PREFIX: 'bgg_user_notes_',
};

export const AVATAR_COLORS = [
  'bg-orange-500 text-white',
  'bg-emerald-500 text-white',
  'bg-sky-500 text-white',
  'bg-purple-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-500 text-slate-900',
  'bg-indigo-500 text-white',
  'bg-teal-500 text-white',
];

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_host',
    username: 'carlos_host',
    displayName: 'Carlos M. (Host)',
    avatarColor: 'bg-orange-500 text-white',
    bggUsername: 'carlos_bgg',
    bio: 'Club organizer. Love medium-heavy Euros and cooperative campaigns.',
    isPublic: true,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'user_elena',
    username: 'elena_strat',
    displayName: 'Elena R.',
    avatarColor: 'bg-emerald-500 text-white',
    bggUsername: 'elena_games',
    bio: 'Big fan of engine builders, worker placement, and Wingspan!',
    isPublic: true,
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'user_mateo',
    username: 'mateo_d',
    displayName: 'Mateo D.',
    avatarColor: 'bg-sky-500 text-white',
    bggUsername: 'mateo_dice',
    bio: 'Always up for Brass Birmingham, Scythe, or high-stakes deck builders.',
    isPublic: true,
    createdAt: Date.now() - 86400000 * 5,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    fromUserId: 'user_elena',
    fromUserName: 'Elena R.',
    fromUserColor: 'bg-emerald-500 text-white',
    toUserId: 'all',
    content: 'Hey everyone! I just uploaded my updated collection with 7 Wonders and Wingspan. Let me know if anyone wants to table them!',
    linkedGameName: '7 Wonders (Second Edition)',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'msg_2',
    fromUserId: 'user_mateo',
    fromUserName: 'Mateo D.',
    fromUserColor: 'bg-sky-500 text-white',
    toUserId: 'all',
    content: 'Awesome Elena! I just committed to the Friday Game Night. Can teach 51st State if we want something intense.',
    linkedGameName: '51st State: Ultimate Edition',
    createdAt: Date.now() - 3600000 * 2,
  },
];

function getUpcomingFriday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay() + 5) % 7 || 7));
  return d.toISOString().split('T')[0];
}

const INITIAL_MEETINGS: GameMeeting[] = [
  {
    id: 'meet_1',
    hostUserId: 'user_host',
    hostUserName: 'Carlos M. (Host)',
    hostAvatarColor: 'bg-orange-500 text-white',
    title: 'Friday Epic Game Night: 51st State or 7 Wonders',
    gameName: '51st State: Ultimate Edition',
    date: getUpcomingFriday(),
    time: '19:00',
    location: "Carlos' Game Room (Piedecuesta)",
    maxPlayers: 4,
    description: 'Cold drinks and snacks provided. We will start with a quick rules refresher at 19:15!',
    participants: [
      {
        userId: 'user_host',
        userName: 'Carlos M. (Host)',
        avatarColor: 'bg-orange-500 text-white',
        status: 'confirmed',
        updatedAt: Date.now() - 86400000,
      },
      {
        userId: 'user_elena',
        userName: 'Elena R.',
        avatarColor: 'bg-emerald-500 text-white',
        status: 'confirmed',
        updatedAt: Date.now() - 3600000 * 3,
      },
      {
        userId: 'user_mateo',
        userName: 'Mateo D.',
        avatarColor: 'bg-sky-500 text-white',
        status: 'confirmed',
        updatedAt: Date.now() - 3600000 * 1,
      },
    ],
    createdAt: Date.now() - 86400000,
  },
];

/* ---------------- USERS ---------------- */

export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function getCurrentUser(): UserProfile {
  const users = getAllUsers();
  try {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (id) {
      const found = users.find((u) => u.id === id);
      if (found) return found;
    }
  } catch {
    // fallback
  }
  // Default to first user (Host)
  const defaultUser = users[0] || INITIAL_USERS[0];
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
  } catch {}
  return defaultUser;
}

export function setCurrentUserId(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } catch (err) {
    console.error('Failed to set current user ID', err);
  }
}

export function saveUser(user: UserProfile): void {
  const users = getAllUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user', err);
  }
}

export function createUser(username: string, displayName: string, bggUsername?: string): UserProfile {
  const users = getAllUsers();
  const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '') || `player_${users.length + 1}`,
    displayName: displayName.trim() || username,
    avatarColor: color,
    bggUsername: bggUsername?.trim() || undefined,
    isPublic: true,
    createdAt: Date.now(),
  };

  saveUser(newUser);
  setCurrentUserId(newUser.id);
  return newUser;
}

/* ---------------- MESSAGES ---------------- */

export function getAllMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES;
  }
}

export function sendChatMessage(
  currentUser: UserProfile,
  content: string,
  toUserId: string = 'all',
  linkedGameName?: string,
  linkedGameId?: number
): ChatMessage {
  const messages = getAllMessages();
  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fromUserId: currentUser.id,
    fromUserName: currentUser.displayName,
    fromUserColor: currentUser.avatarColor,
    toUserId,
    content: content.trim(),
    linkedGameName,
    linkedGameId,
    createdAt: Date.now(),
  };

  messages.push(newMsg);
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save chat message', err);
  }
  return newMsg;
}

/* ---------------- MEETINGS ---------------- */

export function getAllMeetings(): GameMeeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEETINGS;
  }
}

export function createGameMeeting(
  hostUser: UserProfile,
  meeting: Omit<GameMeeting, 'id' | 'hostUserId' | 'hostUserName' | 'hostAvatarColor' | 'participants' | 'createdAt'>
): GameMeeting {
  const meetings = getAllMeetings();
  const newMeeting: GameMeeting = {
    ...meeting,
    id: `meet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    hostUserId: hostUser.id,
    hostUserName: hostUser.displayName,
    hostAvatarColor: hostUser.avatarColor,
    participants: [
      {
        userId: hostUser.id,
        userName: hostUser.displayName,
        avatarColor: hostUser.avatarColor,
        status: 'confirmed',
        updatedAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  };

  meetings.unshift(newMeeting);
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (err) {
    console.error('Failed to create meeting', err);
  }
  return newMeeting;
}

export function rsvpGameMeeting(
  meetingId: string,
  user: UserProfile,
  status: MeetingRsvpStatus
): GameMeeting | null {
  const meetings = getAllMeetings();
  const target = meetings.find((m) => m.id === meetingId);
  if (!target) return null;

  const existingIdx = target.participants.findIndex((p) => p.userId === user.id);
  if (existingIdx >= 0) {
    target.participants[existingIdx] = {
      userId: user.id,
      userName: user.displayName,
      avatarColor: user.avatarColor,
      status,
      updatedAt: Date.now(),
    };
  } else {
    target.participants.push({
      userId: user.id,
      userName: user.displayName,
      avatarColor: user.avatarColor,
      status,
      updatedAt: Date.now(),
    });
  }

  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (err) {
    console.error('Failed to save RSVP', err);
  }
  return target;
}

export function deleteGameMeeting(meetingId: string): void {
  const meetings = getAllMeetings().filter((m) => m.id !== meetingId);
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (err) {
    console.error('Failed to delete meeting', err);
  }
}

/* ---------------- PER-USER CSV COLLECTION ---------------- */

export function getUserCsv(userId: string): string | null {
  try {
    return localStorage.getItem(`${STORAGE_KEYS.USER_CSV_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

export function saveUserCsv(userId: string, csv: string): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.USER_CSV_PREFIX}${userId}`, csv);
  } catch (err) {
    console.error('Failed to save user CSV', err);
  }
}

/* ---------------- PER-USER ANNOTATIONS ---------------- */

export function getUserAnnotation(userId: string, gameId: number): string {
  try {
    return localStorage.getItem(`${STORAGE_KEYS.USER_NOTES_PREFIX}${userId}_${gameId}`) || '';
  } catch {
    return '';
  }
}

export function saveUserAnnotation(userId: string, gameId: number, note: string): void {
  try {
    const key = `${STORAGE_KEYS.USER_NOTES_PREFIX}${userId}_${gameId}`;
    if (note.trim()) {
      localStorage.setItem(key, note);
    } else {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.error('Failed to save user annotation', err);
  }
}
