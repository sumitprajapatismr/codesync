import React from 'react';
import { Users, ShieldAlert } from 'lucide-react';

const ParticipantList = ({ participants = [], ownerId }) => {
  return (
    <div className="flex flex-col bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-dark-border pb-3">
        <Users className="h-4 w-4 text-emerald-500" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-dark-muted">
          Active Participants ({participants.length})
        </h3>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
        {participants.map((user) => {
          const isOwner = user._id === ownerId;

          // Generate stable color matching EditorPanel HSL hash
          const colorHash = Math.abs(user._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360;
          const userBorderColor = `hsl(${colorHash}, 85%, 50%)`;

          return (
            <div key={user._id} className="flex items-center justify-between gap-2 p-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt="avatar"
                    className="h-8 w-8 rounded-full border-2 bg-slate-50 shrink-0"
                    style={{ borderColor: userBorderColor }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white dark:border-dark-card bg-emerald-500"></span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-[9px] text-slate-400 dark:text-dark-muted">
                    Rating: {user.rating || 1500}
                  </p>
                </div>
              </div>

              {isOwner && (
                <span className="text-[8px] font-extrabold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/10 flex items-center gap-0.5">
                  Host
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
