import { UserProfile, ChatMessage, GameMeeting, MeetingRsvpStatus } from '../types/bgg';

const STORAGE_KEYS = {
  USERS: 'bgg_community_users_v1',
  CURRENT_USER_ID: 'bgg_community_current_user_id_v1',
  MESSAGES: 'bgg_community_messages_v1',
  MEETINGS: 'bgg_community_meetings_v1',
  USER_CSV_PREFIX: 'bgg_user_csv_',
  USER_NOTES_PREFIX: 'bgg_user_notes_',
  CLUB_KEY: 'bgg_club_registration_key_v1',
};

export const DEFAULT_CLUB_ENTRY_KEY = 'PIEDECUESTA_2026';
export const SUPER_ADMIN_PASSWORD_HASH =
  'dd9641ec77a568da06d73496f9eb76e4e50452d78a345bf920946d8b39c97bc8'; // hash of 'SUPERPIEDECUESTA_2026'

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

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`bgg_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash?: string): Promise<boolean> {
  if (!hash) return true; // unauthenticated account
  const computed = await hashPassword(password);
  return computed === hash;
}

const DEFAULT_DEMO_PIN_HASH = 'bf98cd6702b1433317bb4e0c053f168632f0b0d1f541a008b70ca0d6cb48e796'; // hash of '1234'

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin',
    username: 'admin',
    displayName: 'Carlos M. (Super Admin)',
    avatarColor: 'bg-orange-600 text-white',
    bggUsername: 'carlos_admin',
    bio: 'Club Founder & Super Admin. Full permissions to manage group profiles and settings.',
    isPublic: true,
    role: 'admin',
    passwordHash: SUPER_ADMIN_PASSWORD_HASH,
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: 'user_elena',
    username: 'elena_strat',
    displayName: 'Elena R.',
    avatarColor: 'bg-emerald-500 text-white',
    bggUsername: 'elena_games',
    bio: 'Big fan of engine builders, worker placement, and Wingspan!',
    isPublic: true,
    role: 'user',
    passwordHash: DEFAULT_DEMO_PIN_HASH,
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
    role: 'user',
    passwordHash: DEFAULT_DEMO_PIN_HASH,
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
    let users: UserProfile[] = raw ? JSON.parse(raw) : INITIAL_USERS;

    // Ensure Super Admin account is always present, immutable ID, and has admin role
    const adminIdx = users.findIndex((u) => u.id === 'user_admin' || u.username === 'admin');
    if (adminIdx >= 0) {
      users[adminIdx].role = 'admin';
      users[adminIdx].passwordHash = SUPER_ADMIN_PASSWORD_HASH;
      users[adminIdx].id = 'user_admin';
    } else {
      // Migrate old user_host or insert user_admin at top
      const hostIdx = users.findIndex((u) => u.id === 'user_host');
      if (hostIdx >= 0) {
        users[hostIdx] = {
          ...users[hostIdx],
          id: 'user_admin',
          username: 'admin',
          displayName: 'Carlos M. (Super Admin)',
          role: 'admin',
          passwordHash: SUPER_ADMIN_PASSWORD_HASH,
        };
      } else {
        users.unshift(INITIAL_USERS[0]);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {}

    return users;
  } catch {
    return INITIAL_USERS;
  }
}

export function isSuperAdmin(user?: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.id === 'user_admin' || user.username === 'admin';
}

export function getClubEntryKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CLUB_KEY) || DEFAULT_CLUB_ENTRY_KEY;
  } catch {
    return DEFAULT_CLUB_ENTRY_KEY;
  }
}

export function setClubEntryKey(newKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLUB_KEY, newKey.trim());
  } catch (err) {
    console.error('Failed to set club entry key', err);
  }
}

export function deleteUserByAdmin(userId: string): boolean {
  if (userId === 'user_admin') return false; // Protected super admin
  const users = getAllUsers().filter((u) => u.id !== userId);
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    // Clean up user's CSV and notes
    localStorage.removeItem(`${STORAGE_KEYS.USER_CSV_PREFIX}${userId}`);
    return true;
  } catch (err) {
    console.error('Failed to delete user by admin', err);
    return false;
  }
}

export async function resetUserPasswordByAdmin(userId: string, newPin: string): Promise<void> {
  const users = getAllUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return;
  target.passwordHash = await hashPassword(newPin);
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to reset user password', err);
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

export function createUser(
  username: string,
  displayName: string,
  bggUsername?: string,
  passwordHash?: string
): UserProfile {
  const users = getAllUsers();
  const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '') || `player_${users.length + 1}`,
    displayName: displayName.trim() || username,
    avatarColor: color,
    bggUsername: bggUsername?.trim() || undefined,
    isPublic: true,
    passwordHash,
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

const SAMPLE_CSV_HEADER =
  'objectname,objectid,rating,numplays,weight,own,fortrade,want,wanttobuy,wanttoplay,prevowned,preordered,wishlist,wishlistpriority,wishlistcomment,comment,conditiontext,haspartslist,wantpartslist,collid,baverage,average,avgweight,rank,numowned,objecttype,originalname,minplayers,maxplayers,playingtime,maxplaytime,minplaytime,yearpublished,bggrecplayers,bggbestplayers,bggrecagerange,bgglanguagedependence,publisherid,imageid,year,language,other,itemtype,barcode,pricepaid,pp_currency,currvalue,cv_currency,acquisitiondate,acquiredfrom,quantity,privatecomment,invlocation,invdate,version_publishers,version_languages,version_yearpublished,version_nickname';

const SAMPLE_ELENA_CSV = `${SAMPLE_CSV_HEADER}
"7 Wonders (Second Edition)","316377","0","0","0","1","0","0","0","0","0","0","0","3","","Elena's favorite engine/drafting","","","","139210349","7.37203","7.8161","2.264","193","21105","thing","7 Wonders (Second Edition)","3","7","30","30","30","2020","3,4,5,6,7","4,5","10+","No necessary in-game text","","","","","","standalone","","","","","","","","","","Shelf B2","","","","",""
"The Adventures of Robin Hood","326494","0","0","0","1","0","0","0","0","0","0","0","3","","Co-op story game","","","","131942297","6.77444","7.41012","1.8235","804","13221","thing","The Adventures of Robin Hood","2","4","60","60","60","2021","1,2,3,4","2","8+","Unplayable in another language","","","","","","standalone","","","","","","","","","","Shelf B2","","","","",""
"Alice's Garden","298635","0","0","0","1","0","0","0","0","0","0","0","3","","Relaxing tile placement","","","","139209998","6.13588","7.10271","1.4603","2531","3872","thing","Alice's Garden","1","4","45","45","30","2020","1,2,3,4","3,4","8+","No necessary in-game text","","","","","","standalone","","","","","","","","","","Shelf B1","","","","",""
"Aqua: Biodiversity in the Oceans","403468","0","0","0","1","0","0","0","0","0","0","0","3","","Marine ecosystem puzzle","","","","140636758","6.11596","7.1261","2.093","2624","3185","thing","Aqua: Biodiversity in the Oceans","1","4","45","45","30","2024","1,2,3,4","2","6+","No necessary in-game text","","","","","","standalone","","","","","","","","","","Shelf B1","","","","",""
"Arboretum","140934","0","0","0","1","0","0","0","0","0","0","0","3","","Vicious and beautiful card game","","","","140636743","7.05478","7.23767","2.1144","451","43883","thing","Arboretum","2","4","30","30","30","2015","2,3,4","2","10+","No necessary in-game text","","","","","","standalone","","","","","","","","","","Shelf B1","","","","",""`;

const SAMPLE_MATEO_CSV = `${SAMPLE_CSV_HEADER}
"51st State: Ultimate Edition","357726","0","0","0","1","0","0","0","0","0","0","0","3","","Post-apoc engine builder","","","","131925785","6.64138","8.0768","2.7681","0","4799","thing","51st State: Ultimate Edition","1","4","75","75","75","2023","1,2,3,4","2,3","12+","Moderate in-game text - needs crib sheet or paste ups","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""
"After the Empire","200511","0","0","0","1","0","0","0","0","0","0","0","3","","Castle defense & siege","","","","131924824","6.35644","7.41359","3.1111","1716","3694","thing","After the Empire","2","4","120","120","60","2021","1,2,3,4","2,3","14+","Moderate in-game text - needs crib sheet or paste ups","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""
"After the Virus","232361","0","0","0","1","0","0","0","0","0","0","0","3","","Deckbuilding survival","","","","131942101","6.38001","7.29396","2.3059","1663","5380","thing","After the Virus","1","3","90","90","30","2017","1,2","1","10+","Extensive use of text - massive conversion needed to be playable","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""
"Android: Netrunner","124742","0","0","0","1","0","0","0","0","0","0","0","3","","Cyberpunk 1v1 masterpiece","","","","131927100","7.65056","7.89336","3.4174","85","47635","thing","Android: Netrunner","2","2","45","45","45","2012","2","2","12+","Extensive use of text - massive conversion needed to be playable","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""
"Andromeda's Edge","358661","0","0","0","1","0","0","0","0","0","0","0","3","","Space worker placement / battle","","","","131923900","7.42865","8.22719","3.7415","161","11619","thing","Andromeda's Edge","2","5","160","160","80","2024","1,2,3,4","3","14+","Extensive use of text - massive conversion needed to be playable","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""
"Arcs","359871","0","0","0","1","0","0","0","0","0","0","0","3","","Cole Wehrle trick-taking conflict","","","","138412724","7.59115","7.97503","3.4549","103","32314","thing","Arcs","2","4","120","120","60","2024","2,3,4","3,4","14+","Extensive use of text - massive conversion needed to be playable","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""
"Ark Nova","342942","0","0","0","1","0","0","0","0","0","0","0","3","","Modern zoo management top tier","","","","149652162","8.3557","8.53816","3.8006","2","93132","thing","Ark Nova","1","4","150","150","90","2021","1,2,3","2","14+","Extensive use of text - massive conversion needed to be playable","","","","","","standalone","","","","","","","","","","Mateo's Living Room","","","","",""`;

export function getUserCsv(userId: string): string | null {
  try {
    const custom = localStorage.getItem(`${STORAGE_KEYS.USER_CSV_PREFIX}${userId}`);
    if (custom) return custom;
    // Fallback sample CSVs for initial seeded users so the community catalog has immediate content
    if (userId === 'user_elena') return SAMPLE_ELENA_CSV;
    if (userId === 'user_mateo') return SAMPLE_MATEO_CSV;
    return null;
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

