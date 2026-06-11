import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, Users, Clock, Terminal, Activity, ArrowRight, UserCheck, Play } from 'lucide-react';
import API from '../utils/api';
import Alert from '../components/Alert';

const InterviewModePage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/interviews/${id}`);
        if (res.data.success) {
          setSession(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching interview logs:', err);
        setAlertInfo({ message: 'Error retrieving session logs', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    // Set up polling interval to fetch live logs every 3 seconds
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200">
      {alertInfo && (
        <div className="mb-6">
          <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-brand-500 font-extrabold uppercase text-xs tracking-wider">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Live Interview Monitor</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Session Observation Panel</h1>
          <p className="text-xs text-slate-500 mt-1 dark:text-dark-muted">
            Live candidate activity logging, compile events, and room history timestamps.
          </p>
        </div>

        {session?.room?.roomId && (
          <Link
            to={`/room/${session.room.roomId}`}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 text-sm"
          >
            Enter Coding Room
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Session Roles</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={session?.interviewer?.avatar} className="h-8 w-8 rounded-full" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{session?.interviewer?.name}</p>
                  <p className="text-[9px] text-slate-400">Interviewer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={session?.candidate?.avatar} className="h-8 w-8 rounded-full border border-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{session?.candidate?.name}</p>
                  <p className="text-[9px] text-emerald-500 font-semibold">Candidate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Status details</h3>
            <div className="flex justify-between text-xs text-slate-600 dark:text-dark-muted">
              <span>Status</span>
              <span className="font-bold text-brand-500">{session?.status}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-dark-muted">
              <span>Created at</span>
              <span>{new Date(session?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Live log feed */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-dark-muted flex items-center gap-2">
            <Terminal className="h-4 w-4 text-brand-500" />
            Candidate Action Log Feed
          </h2>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {(!session?.activityLog || session.activityLog.length === 0) ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No actions logged yet.</p>
            ) : (
              session.activityLog.slice().reverse().map((log, index) => (
                <div key={index} className="flex gap-3 text-xs border-b border-slate-50 dark:border-dark-border/40 pb-3 last:border-0">
                  <span className="text-[10px] text-slate-400 font-mono w-14 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.user?.name || 'System'}:
                    </span>
                    <span className="text-slate-600 dark:text-dark-muted ml-1.5">{log.details}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewModePage;
