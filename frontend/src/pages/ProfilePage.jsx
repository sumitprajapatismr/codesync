import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Trophy,
  BookOpen,
  AlertCircle,
  Save,
  CheckCircle,
  Users
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Alert from '../components/Alert';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateGitHubUsername } = useAuth();
  const [profile, setProfile] = useState(null);
  const [githubInput, setGithubInput] = useState('');
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/profile/${id}`);
        if (res.data.success) {
          setProfile(res.data.data);
          setGithubInput(res.data.data.githubUsername || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleSaveGithub = async (e) => {
    e.preventDefault();
    try {
      const res = await updateGitHubUsername(githubInput);
      if (res.success) {
        setProfile((prev) => ({ ...prev, githubUsername: githubInput }));
        setIsEditingGithub(false);
        setAlertInfo({ message: 'GitHub username updated successfully!', type: 'success' });
      } else {
        setAlertInfo({ message: 'Failed to update GitHub profile', type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ message: 'Error updating GitHub profile', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <p className="font-semibold">User profile not found</p>
      </div>
    );
  }

  const isSelf = currentUser?._id === profile._id;
  const solvedCount = profile.solvedProblems?.length || 0;
  
  // Group solved problems by difficulty
  const difficulties = {
    Easy: profile.solvedProblems?.filter((p) => p.difficulty === 'Easy').length || 0,
    Medium: profile.solvedProblems?.filter((p) => p.difficulty === 'Medium').length || 0,
    Hard: profile.solvedProblems?.filter((p) => p.difficulty === 'Hard').length || 0,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 transition-colors duration-200">
      {alertInfo && (
        <div className="mb-6">
          <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.name}`}
            alt="avatar"
            className="h-24 w-24 rounded-full border-2 border-brand-500 bg-slate-50 p-1"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{profile.name}</h1>
            <p className="text-sm text-slate-500 dark:text-dark-muted mt-1">{profile.email}</p>
            
            {/* GitHub Username Sync */}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
              <User className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              {isEditingGithub ? (
                <form onSubmit={handleSaveGithub} className="flex gap-2">
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="github-username"
                    className="text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg px-2.5 py-1 text-slate-950 dark:text-white focus:outline-none"
                  />
                  <button type="submit" className="p-1 bg-brand-500 text-white rounded hover:bg-brand-600">
                    <Save className="h-3 w-3" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  {profile.githubUsername ? (
                    <a
                      href={`https://github.com/${profile.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brand-500 hover:underline"
                    >
                      @{profile.githubUsername}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No GitHub username synced</span>
                  )}
                  {isSelf && (
                    <button
                      onClick={() => setIsEditingGithub(true)}
                      className="text-[10px] font-bold text-slate-500 dark:text-dark-muted hover:underline"
                    >
                      (Edit)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global user badges */}
        <div className="flex gap-4">
          <div className="bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/10 p-4 rounded-2xl text-center shadow-sm min-w-[100px]">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-brand-500" />
            <p className="text-[10px] font-bold text-slate-500 dark:text-dark-muted">Rating</p>
            <p className="text-xl font-extrabold mt-0.5">{profile.rating || 1500}</p>
          </div>
          <div className="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/10 p-4 rounded-2xl text-center shadow-sm min-w-[100px]">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-500 dark:text-dark-muted">Solved</p>
            <p className="text-xl font-extrabold mt-0.5">{solvedCount}</p>
          </div>
        </div>
      </div>

      {/* Profile details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Solved Problems distribution card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-dark-muted mb-6">
            Difficulty Distribution
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-500">Easy ({difficulties.Easy})</span>
                <span className="text-slate-400">{solvedCount > 0 ? Math.round((difficulties.Easy / solvedCount) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full animate-out duration-300" style={{ width: `${solvedCount > 0 ? (difficulties.Easy / solvedCount) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-500">Medium ({difficulties.Medium})</span>
                <span className="text-slate-400">{solvedCount > 0 ? Math.round((difficulties.Medium / solvedCount) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${solvedCount > 0 ? (difficulties.Medium / solvedCount) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-500">Hard ({difficulties.Hard})</span>
                <span className="text-slate-400">{solvedCount > 0 ? Math.round((difficulties.Hard / solvedCount) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${solvedCount > 0 ? (difficulties.Hard / solvedCount) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Problems list panel */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-sm md:col-span-2 space-y-6">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-dark-muted flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Solved Problems List ({solvedCount})
          </h3>

          {solvedCount === 0 ? (
            <p className="text-xs text-slate-400 dark:text-dark-muted italic py-6 text-center">No problems solved yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2">
              {profile.solvedProblems.map((prob) => (
                <div
                  key={prob._id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-dark-border/40 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <span className="text-xs font-bold truncate max-w-[150px]">{prob.title}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    prob.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                    prob.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Friends Count and listings */}
          <div className="border-t border-slate-100 dark:border-dark-border/50 pt-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-dark-muted mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-500" />
              Friends ({profile.friends?.length || 0})
            </h3>
            {(!profile.friends || profile.friends.length === 0) ? (
              <p className="text-xs text-slate-400 dark:text-dark-muted italic">No friends added.</p>
            ) : (
              <div className="flex flex-wrap gap-3 max-h-[120px] overflow-y-auto pr-2">
                {profile.friends.map((friend) => (
                  <Link
                    key={friend._id}
                    to={`/profile/${friend._id}`}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-dark-bg hover:bg-slate-100 dark:hover:bg-dark-card border border-slate-100 dark:border-dark-border p-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                  >
                    <img src={friend.avatar} alt="avatar" className="h-6 w-6 rounded-full" />
                    <span>{friend.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

