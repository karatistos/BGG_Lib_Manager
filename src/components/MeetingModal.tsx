import React, { useState } from 'react';
import { UserProfile, GameMeeting, GameRecord, MeetingRsvpStatus } from '../types/bgg';
import {
  getAllMeetings,
  createGameMeeting,
  rsvpGameMeeting,
  deleteGameMeeting,
} from '../services/communityStorage';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Plus,
  Trash2,
  Dices,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allGames: GameRecord[];
}

export const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allGames,
}) => {
  const [meetings, setMeetings] = useState<GameMeeting[]>(getAllMeetings());
  const [isCreating, setIsCreating] = useState(false);

  // New meeting form state
  const [title, setTitle] = useState('');
  const [selectedGameName, setSelectedGameName] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState("Carlos' Game Room (Piedecuesta)");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.id === 'guest') {
      alert('Please log in with your club profile to schedule a game night meetup.');
      return;
    }
    if (!title.trim() || !selectedGameName.trim()) return;

    const matchedGame = allGames.find((g) => g.name.toLowerCase() === selectedGameName.toLowerCase());

    createGameMeeting(currentUser, {
      title: title.trim(),
      gameName: matchedGame ? matchedGame.name : selectedGameName.trim(),
      gameId: matchedGame ? matchedGame.id : undefined,
      gameThumbnail: matchedGame ? matchedGame.thumbnail : undefined,
      date,
      time,
      location: location.trim() || 'Club Location',
      maxPlayers: Number(maxPlayers) || 4,
      description: description.trim() || undefined,
    });

    setMeetings(getAllMeetings());
    setIsCreating(false);
    setTitle('');
    setSelectedGameName('');
    setDescription('');
  };

  const handleRsvp = (meetingId: string, status: MeetingRsvpStatus) => {
    if (currentUser.id === 'guest') {
      alert('Please log in with your club profile to RSVP for game nights.');
      return;
    }
    rsvpGameMeeting(meetingId, currentUser, status);
    setMeetings(getAllMeetings());
  };

  const handleDelete = (meetingId: string) => {
    if (confirm('Are you sure you want to cancel this game night meetup?')) {
      deleteGameMeeting(meetingId);
      setMeetings(getAllMeetings());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Game Night Meetups & Commitments</h3>
              <p className="text-xs text-slate-400">Propose sessions, invite members & confirm seats at the table</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Propose Game Night</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {/* Create Form */}
          {isCreating && (
            <form
              onSubmit={handleCreateMeeting}
              className="p-4 bg-slate-950 rounded-2xl border border-orange-500/30 space-y-3.5 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Propose New Game Session
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Session Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Friday Euro Heavy Night: Brass or Scythe"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Proposed Board Game</label>
                  <input
                    type="text"
                    value={selectedGameName}
                    onChange={(e) => setSelectedGameName(e.target.value)}
                    placeholder="Select or type game name..."
                    list="games-list"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                  <datalist id="games-list">
                    {allGames.slice(0, 50).map((g) => (
                      <option key={g.id} value={g.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Start Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Carlos' Game Room"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Total Player Seats</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Notes / Rules / Food</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. We will teach rules at 19:15. Drinks provided, feel free to bring snacks!"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Create & Announce Session
                </button>
              </div>
            </form>
          )}

          {/* List of Meetings */}
          {meetings.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No scheduled game nights right now.</p>
              <p className="text-xs text-slate-500">
                Click "Propose Game Night" above to schedule a game with your friends!
              </p>
            </div>
          ) : (
            meetings.map((meeting) => {
              const confirmedList = meeting.participants.filter((p) => p.status === 'confirmed');
              const maybeList = meeting.participants.filter((p) => p.status === 'maybe');

              const isHost = meeting.hostUserId === currentUser.id;
              const myRsvp = meeting.participants.find((p) => p.userId === currentUser.id)?.status;
              const isFull = confirmedList.length >= meeting.maxPlayers;

              return (
                <div
                  key={meeting.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 shadow-lg"
                >
                  {/* Top: Title & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-white">{meeting.title}</span>
                        {isFull ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Table Full ({confirmedList.length}/{meeting.maxPlayers})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {meeting.maxPlayers - confirmedList.length} spots remaining
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold">
                        <Dices className="w-3.5 h-3.5" />
                        <span>Game: {meeting.gameName}</span>
                      </div>
                    </div>

                    {isHost && (
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                        title="Cancel this meetup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Metadata Row: Date, Time, Location, Host */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Date</div>
                        <span className="font-medium text-slate-200">{meeting.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Hour</div>
                        <span className="font-medium text-slate-200">{meeting.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Location</div>
                        <span className="font-medium text-slate-200 truncate max-w-[100px]">{meeting.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <div className={`w-5 h-5 rounded-md ${meeting.hostAvatarColor} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                        {meeting.hostUserName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Host</div>
                        <span className="font-medium text-slate-200 truncate max-w-[90px]">{meeting.hostUserName}</span>
                      </div>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40 leading-relaxed">
                      {meeting.description}
                    </p>
                  )}

                  {/* Confirmed Participants Roster */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-400" />
                        <span>Committed Players ({confirmedList.length}/{meeting.maxPlayers})</span>
                      </span>
                      {maybeList.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          {maybeList.length} considering
                        </span>
                      )}
                    </div>

                    {/* Visual Player Avatars Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {confirmedList.map((p) => (
                        <div
                          key={p.userId}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm"
                        >
                          <div className={`w-4 h-4 rounded-md ${p.avatarColor} flex items-center justify-center text-[9px] font-bold`}>
                            {p.userName.slice(0, 1)}
                          </div>
                          <span>{p.userId === currentUser.id ? 'You' : p.userName}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                      ))}

                      {/* Empty seats indicator */}
                      {Array.from({ length: Math.max(0, meeting.maxPlayers - confirmedList.length) }).map((_, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-dashed border-slate-800 text-slate-600 text-xs font-medium"
                        >
                          <div className="w-4 h-4 rounded-md bg-slate-900 border border-slate-800" />
                          <span>Open seat</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RSVP Commitment Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Your Attendance Commitment:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRsvp(meeting.id, 'confirmed')}
                        disabled={isFull && myRsvp !== 'confirmed'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          myRsvp === 'confirmed'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                            : 'bg-slate-900 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30'
                        } disabled:opacity-40`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>I'm In! (Confirm)</span>
                      </button>

                      <button
                        onClick={() => handleRsvp(meeting.id, 'maybe')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          myRsvp === 'maybe'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                            : 'bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Maybe</span>
                      </button>

                      <button
                        onClick={() => handleRsvp(meeting.id, 'declined')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          myRsvp === 'declined'
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                            : 'bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Can't Go</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
