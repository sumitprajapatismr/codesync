import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Play, Award, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import API from '../utils/api';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ContestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  
  const [contests, setContests] = useState([]);
  const [activeContest, setActiveContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/contests');
      if (res.data.success) {
        setContests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  // Timer countdown hook for active contest
  useEffect(() => {
    if (!activeContest) return;

    const interval = setInterval(() => {
      const difference = new Date(activeContest.endTime) - new Date();
      if (difference <= 0) {
        setTimeLeft('Contest Finished');
        clearInterval(interval);
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeContest]);

  const handleRegister = async (contestId) => {
    try {
      const res = await API.post(`/contests/${contestId}/join`);
      if (res.data.success) {
        setAlertInfo({ message: 'Registered for contest successfully!', type: 'success' });
        fetchContests();
      } else {
        setAlertInfo({ message: res.data.message || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      setAlertInfo({ message: err.response?.data?.message || 'Error joining contest', type: 'error' });
    }
  };

  const handleEnterContest = async (contest) => {
    try {
      // Fetch details of selected contest
      const res = await API.get(`/contests/${contest._id}`);
      if (res.data.success) {
        setActiveContest(res.data.data);
      }
    } catch (err) {
      setAlertInfo({ message: 'Error opening contest panel', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // Active Contest Panel Dashboard
  if (activeContest) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 transition-colors duration-200">
        <button
          onClick={() => setActiveContest(null)}
          className="text-xs font-bold text-slate-500 hover:text-brand-500 mb-6 flex items-center gap-1.5"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to Contests
        </button>

        {/* Banner Details */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-black">{activeContest.title}</h1>
            <p className="text-brand-100 text-xs mt-1">Compete against other candidates. Code submissions count towards rating points.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/15">
            <Clock className="h-5 w-5 text-amber-300 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-brand-100 uppercase tracking-wider">Time Remaining</p>
              <p className="text-lg font-black tracking-widest mt-0.5">{timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Contest details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Problems list */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-800 dark:text-white mb-4">Contest Problem Sets</h2>
            {activeContest.problems?.map((prob, index) => (
              <div
                key={prob._id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-dark-border/40 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {index + 1}. {prob.title}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    {prob.tags?.slice(0, 2).map(t => (
                      <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-border text-slate-500 dark:text-dark-muted font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    prob.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                    prob.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {prob.difficulty}
                  </span>
                  
                  {/* Enter room sandbox for this problem */}
                  <button
                    onClick={() => {
                      // Navigate to create a room with this problem automatically
                      API.post('/rooms/create', {
                        name: `${activeContest.title}: ${prob.title}`,
                        problemId: prob._id,
                      }).then((res) => {
                        if (res.data.success) {
                          navigate(`/room/${res.data.data.roomId}`);
                        }
                      });
                    }}
                    className="flex items-center gap-1.5 bg-brand-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                  >
                    Solve
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scoreboard Leaderboard */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Contest Leaderboard
            </h2>
            
            {activeContest.leaderboard?.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-dark-muted italic">No submission submissions recorded.</p>
            ) : (
              <div className="space-y-3">
                {activeContest.leaderboard.map((entry, index) => (
                  <div key={entry.user?._id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-dark-border/40 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-4 text-center">{index + 1}</span>
                      <img src={entry.user?.avatar} className="h-6 w-6 rounded-full" />
                      <span className="text-xs font-semibold max-w-[100px] truncate">{entry.user?.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-500">{entry.score} pts</p>
                      <p className="text-[9px] text-slate-400">Solved: {entry.solvedProblemsCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 transition-colors duration-200">
      {alertInfo && (
        <div className="mb-6">
          <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Active Coding Contests</h1>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
            Compete, climb rankings, and test your programming speed under timed conditions
          </p>
        </div>
      </div>

      {/* Contests List */}
      {contests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl">
          <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 dark:text-dark-muted">No contests scheduled</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Check back later or register details with system admins.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contests.map((c) => {
            // Check if user is registered
            const isRegistered =
  c.leaderboard?.some(
    (entry) =>
      entry?.user === user?._id ||
      entry?.user?._id === user?._id
          ) || false;
            

            const isUpcoming = new Date(c.startTime) > new Date();
            const isFinished = new Date(c.endTime) < new Date();
            const isActive = !isUpcoming && !isFinished;

            return (
              <div
                key={c._id}
                className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-3xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                      isUpcoming ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-dark-muted'
                    }`}>
                      {isActive ? 'Active Now' : isUpcoming ? 'Upcoming' : 'Ended'}
                    </span>
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{c.title}</h2>
                  
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-dark-muted mb-6">
                    <p>Starts: {new Date(c.startTime).toLocaleString()}</p>
                    <p>Ends: {new Date(c.endTime).toLocaleString()}</p>
                    <p>Problems: {c.problems?.length || 0} coding challenges</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isRegistered && !isFinished && (
                    <button
                      onClick={() => handleRegister(c._id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-border dark:hover:bg-dark-hover text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95"
                    >
                      Register
                    </button>
                  )}

                  {isRegistered && isActive && (
                    <button
                      onClick={() => handleEnterContest(c)}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-md"
                    >
                      Enter Workspace
                    </button>
                  )}

                  {isFinished && (
                    <button
                      onClick={() => handleEnterContest(c)}
                      className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-dark-hover text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
                    >
                      View Leaderboard
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContestPage;
