import React, { useState } from 'react';
import { UserProfile, ChatMessage, GameRecord } from '../types/bgg';
import { getAllUsers, getAllMessages, sendChatMessage } from '../services/communityStorage';
import {
  X,
  Users,
  MessageSquare,
  Send,
  Globe,
  Lock,
  ExternalLink,
  BookOpen,
  Dices,
} from 'lucide-react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allGames: GameRecord[];
  onBrowseUserLibrary: (user: UserProfile) => void;
  initialTab?: 'members' | 'messages';
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allGames,
  onBrowseUserLibrary,
  initialTab = 'members',
}) => {
  const [tab, setTab] = useState<'members' | 'messages'>(initialTab);
  const users = getAllUsers();
  const [messages, setMessages] = useState<ChatMessage[]>(getAllMessages());
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('all');
  const [messageText, setMessageText] = useState('');
  const [selectedGameTag, setSelectedGameTag] = useState<string>('');

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const gameRecord = selectedGameTag ? allGames.find((g) => g.name === selectedGameTag) : undefined;
    sendChatMessage(
      currentUser,
      messageText,
      selectedRecipientId,
      gameRecord ? gameRecord.name : undefined,
      gameRecord ? gameRecord.id : undefined
    );

    setMessages(getAllMessages());
    setMessageText('');
    setSelectedGameTag('');
  };

  const filteredMessages = messages.filter((m) => {
    if (selectedRecipientId === 'all') return true;
    return (
      (m.fromUserId === currentUser.id && m.toUserId === selectedRecipientId) ||
      (m.fromUserId === selectedRecipientId && m.toUserId === currentUser.id) ||
      m.toUserId === 'all'
    );
  });

  const selectedRecipient = users.find((u) => u.id === selectedRecipientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Game Group & Community Hub</h3>
              <p className="text-xs text-slate-400">Browse members, view shared collections & coordinate plays</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 my-4 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setTab('members')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'members'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Group Members ({users.length})</span>
          </button>
          <button
            onClick={() => setTab('messages')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'messages'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Group Messages ({messages.length})</span>
          </button>
        </div>

        {/* TAB 1: GROUP MEMBERS DIRECTORY */}
        {tab === 'members' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[300px]">
            {users.map((member) => {
              const isSelf = member.id === currentUser.id;
              return (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl ${member.avatarColor} flex items-center justify-center font-bold text-sm shrink-0 shadow-md`}
                    >
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{member.displayName}</span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 font-mono border border-orange-500/30">
                            You
                          </span>
                        )}
                        {member.isPublic ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Globe className="w-3 h-3" /> Shared Library
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-700/40">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">@{member.username}</div>
                      {member.bio && <p className="text-xs text-slate-300 leading-relaxed">{member.bio}</p>}
                      {member.bggUsername && (
                        <a
                          href={`https://boardgamegeek.com/user/${member.bggUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          <span>BGG: {member.bggUsername}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {member.isPublic && (
                      <button
                        onClick={() => {
                          onBrowseUserLibrary(member);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 transition-all text-xs font-semibold flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isSelf ? 'My Library' : 'Browse Collection'}</span>
                      </button>
                    )}
                    {!isSelf && (
                      <button
                        onClick={() => {
                          setSelectedRecipientId(member.id);
                          setTab('messages');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: MESSAGING & CHAT */}
        {tab === 'messages' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-[350px]">
            {/* Filter recipient */}
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Thread:</span>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">📢 Group Chat (All Members)</option>
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      Direct Message: {u.displayName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Message History Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800 mb-3">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-1">
                  <MessageSquare className="w-8 h-8 opacity-40 mb-1" />
                  <p className="text-xs font-semibold">No messages yet in this thread.</p>
                  <p className="text-[11px]">Say hi or propose a game to play!</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isMine = msg.fromUserId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg ${msg.fromUserColor} flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm`}
                      >
                        {msg.fromUserName.slice(0, 2).toUpperCase()}
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 space-y-1 text-xs ${
                          isMine
                            ? 'bg-orange-500 text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                          <span className="font-bold">{isMine ? 'You' : msg.fromUserName}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* Linked game pill */}
                        {msg.linkedGameName && (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold mt-1 ${
                              isMine ? 'bg-orange-600/70 text-amber-200' : 'bg-slate-900 text-orange-400 border border-orange-500/30'
                            }`}
                          >
                            <Dices className="w-3 h-3" />
                            <span>Game: {msg.linkedGameName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Composer Form */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    selectedRecipientId === 'all'
                      ? 'Message the group...'
                      : `Message ${selectedRecipient?.displayName}...`
                  }
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 shadow-inner"
                />

                {/* Optional Tag Game selector */}
                <select
                  value={selectedGameTag}
                  onChange={(e) => setSelectedGameTag(e.target.value)}
                  className="max-w-[150px] sm:max-w-[180px] bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-xl px-2 py-2.5 focus:outline-none focus:border-orange-500 truncate"
                  title="Attach a game proposal to your message"
                >
                  <option value="">🎲 Tag Game...</option>
                  {allGames.slice(0, 100).map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
