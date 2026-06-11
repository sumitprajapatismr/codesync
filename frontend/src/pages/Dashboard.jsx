import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Link as LinkIcon, Trophy, Award, Clock, ArrowRight, UserPlus, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Alert from '../components/Alert';

const Dashboard = () => {
  const { user, sendFriendRequest, acceptFriendRequest, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendEmailSearch, setFriendEmailSearch] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, lbRes, friendsRes] = await Promise.all([
        API.get('/rooms/history'),
        API.get('/users/leaderboard'),
        API.get('/users/friends'),
      ]);

      if (historyRes.data.success) setHistory(historyRes.data.data);
      if (lbRes.data.success) setLeaderboard(lbRes.data.data);
      if (friendsRes.data.success) setFriends(friendsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmailSearch) return;

    try {
      // Find user by email from the leaderboard or query API
      // For simplicity, we search the leaderboard first, otherwise try request
      const match = leaderboard.find((u) => u.email === friendEmailSearch || u.name.toLowerCase() === friendEmailSearch.toLowerCase());
      if (match) {
        const res = await sendFriendRequest(match._id);
        if (res.success) {
          setAlertInfo({ message: 'Friend request sent successfully!', type: 'success' });
          setFriendEmailSearch('');
        } else {
          setAlertInfo({ message: res.message || 'Failed to send request', type: 'error' });
        }
      } else {
        // If not found in loaded top 50, try to check if user has a standard ID
        setAlertInfo({ message: 'User not found in current leaderboard. Try matching exact username.', type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ message: 'Error adding friend', type: 'error' });
    }
  };

  const handleAcceptRequest = async (reqId) => {
    try {
      const res = await acceptFriendRequest(reqId);
      if (res.success) {
        setAlertInfo({ message: 'Friend request accepted!', type: 'success' });
        fetchData();
        refreshUser();
      } else {
        setAlertInfo({ message: res.message || 'Failed to accept', type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ message: 'Error accepting request', type: 'error' });
    }
  };

  // Simple statistics
  const solvedCount = user?.solvedProblems?.length || 0;
  const rating = user?.rating || 1500;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Notifications */}
      {alertInfo && (
        <div className="mb-6">
          <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />
        </div>
      )}

      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse fill-current" />
              <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">PRO LEVEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
            <p className="text-brand-100 text-sm mt-1">Ready to solve problem sets together? Set up a room or join active contests.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/rooms/create"
              className="flex items-center gap-2 bg-white text-brand-600 hover:bg-slate-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Create Room
            </Link>
            <Link
              to="/rooms/join"
              className="flex items-center gap-2 bg-brand-500/20 hover:bg-brand-500/30 border border-white/25 text-white font-bold px-5 py-3 rounded-xl transition-all active:scale-95"
            >
              <LinkIcon className="h-4 w-4" />
              Join Room
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Stats and Recent Rooms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-brand-500/10 text-brand-500 dark:text-brand-400 rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">User Rating</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{rating}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">Problems Solved</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{solvedCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted">Collaborations</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{history.length}</p>
              </div>
            </div>
          </div>

          {/* Room History Section */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-500" />
              Recent Room History
            </h2>

            {history.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl">
                <Users className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-dark-muted">No recent rooms</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create a room and invite your friends to start coding!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 5).map((room) => (
                  <div
                    key={room._id}
                    className="flex justify-between items-center p-4 rounded-xl border border-slate-100 dark:border-dark-border/40 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{room.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
                        {room.problem ? `Problem: ${room.problem.title}` : 'No problem selected'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        room.problem?.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        room.problem?.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                      }`}>
                        {room.problem?.difficulty || 'Sandbox'}
                      </span>
                      <button
                        onClick={() => navigate(`/room/${room.roomId}`)}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600"
                      >
                        Enter
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Leaderboard and Friends Panel */}
        <div className="space-y-8">
          {/* Friend Requests / Friends Panel */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              Friends & Invites
            </h2>

            {/* Friend Requests (incoming) */}
            {user?.friendRequests && user.friendRequests.length > 0 && (
              <div className="mb-4 p-3 bg-brand-500/5 dark:bg-brand-900/10 rounded-xl border border-brand-500/20">
                <p className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-2">Pending Invites</p>
                <div className="space-y-2">
                  {user.friendRequests.map((reqUser) => (
                    <div key={reqUser._id} className="flex items-center justify-between gap-2 bg-white dark:bg-dark-card p-2 rounded-lg border border-slate-100 dark:border-dark-border">
                      <div className="flex items-center gap-2">
                        <img src={reqUser.avatar} className="h-6 w-6 rounded-full" />
                        <span className="text-xs font-bold truncate max-w-[100px]">{reqUser.name}</span>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(reqUser._id)}
                        className="text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Friend */}
            <form onSubmit={handleSendFriendRequest} className="flex gap-2 mb-4">
              <input
                type="text"
                value={friendEmailSearch}
                onChange={(e) => setFriendEmailSearch(e.target.value)}
                placeholder="Friend name/email"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-2 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </form>

            {/* Friends list */}
            {friends.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-dark-muted text-center py-4">No friends added yet</p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={friend.avatar} className="h-7 w-7 rounded-full border border-slate-200 dark:border-dark-border" />
                      <div>
                        <p className="text-xs font-bold">{friend.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-dark-muted">Rating: {friend.rating}</p>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global Leaderboard Panel */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Leaderboard
            </h2>

            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((u, index) => (
                <div key={u._id} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-dark-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-4 text-center ${
                      index === 0 ? 'text-amber-500 font-black' :
                      index === 1 ? 'text-slate-400' :
                      index === 2 ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    <img src={u.avatar} className="h-6 w-6 rounded-full" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                      {u.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-brand-500 dark:text-brand-400">
                    {u.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
