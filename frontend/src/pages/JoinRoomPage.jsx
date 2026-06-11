import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkIcon, ArrowRight } from 'lucide-react';
import API from '../utils/api';
import Alert from '../components/Alert';

const JoinRoomPage = () => {
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomIdInput.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const cleanRoomId = roomIdInput.trim().toUpperCase();
      console.log("Room Code:", cleanRoomId);
      console.log("Length:", cleanRoomId.length);
      const res = await API.get(`/rooms/join/${cleanRoomId}`);

      if (res.data.success) {
        navigate(`/room/${cleanRoomId}`);
      } else {
        setError('Room not found or expired.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Room code is invalid or not active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 transition-colors duration-200">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400 mb-3">
            <LinkIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Join Collaborative Room
          </h2>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 text-center">
            Enter an 8-character invite code to jump into code workspace
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert message={error} type="error" onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="room-code" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Room Code
            </label>
            <input
              id="room-code"
              type="text"
              required
              maxLength={8}
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg py-3 px-4 text-center font-bold tracking-widest text-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
              placeholder="e.g. AB12CD34"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg focus:outline-none transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Joining...' : (
              <>
                Join Room
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomPage;
