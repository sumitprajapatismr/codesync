import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Send, Copy, ArrowLeft, Loader2, Save, Terminal as TerminalIcon, Users, CheckCircle, AlertCircle, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../utils/api';
import ProblemPanel from '../components/ProblemPanel';
import EditorPanel from '../components/EditorPanel';
import ChatPanel from '../components/ChatPanel';
import ParticipantList from '../components/ParticipantList';
import Alert from '../components/Alert';
import { codeTemplates } from '../utils/codeTemplates';



const CollaborationRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, emitCodeChange, emitSaveVersion, emitExecutingStatus, emitExecutionFinished } = useSocket();

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
const [codes, setCodes] = useState({
  javascript: codeTemplates.javascript,
  python: codeTemplates.python,
  java: codeTemplates.java,
  cpp: codeTemplates.cpp,
            }); // lang -> code map
  const [copied, setCopied] = useState(false);
  
  // Execution Console States
  const [stdin, setStdin] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [compileOutput, setCompileOutput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null); // submit result object
  const [consoleTab, setConsoleTab] = useState('input'); // 'input' | 'output' | 'results'
  
  const [alertInfo, setAlertInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/rooms/join/${roomId}`);
        if (res.data.success) {
          setRoom(res.data.data);
        } else {
          setAlertInfo({ message: 'Failed to access room information', type: 'error' });
        }
      } catch (err) {
        setAlertInfo({ message: 'Room not found or unauthorized access', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Connect Socket.IO
  useEffect(() => {
    if (!socket || !room) return;

    joinRoom(roomId, user);

    // Initial state sent from server when joining
    socket.on('room-state', ({ currentCode, selectedLanguage: serverLang, users }) => {
  setParticipants(users);
  setSelectedLanguage(serverLang);

  setCodes({
    javascript: currentCode?.javascript || codeTemplates.javascript,
    python: currentCode?.python || codeTemplates.python,
    java: currentCode?.java || codeTemplates.java,
    cpp: currentCode?.cpp || codeTemplates.cpp,
  });
});

    socket.on('user-joined', ({ user: joinedUser, users }) => {
      setParticipants(users);
      setAlertInfo({ message: `${joinedUser.name} joined the room`, type: 'info' });
    });

    socket.on('user-left', ({ user: leftUser, users }) => {
      setParticipants(users);
      setAlertInfo({ message: `${leftUser.name} left the room`, type: 'info' });
    });

    socket.on('code-update', ({ code, language }) => {
      setCodes((prev) => ({ ...prev, [language]: code }));
    });

    socket.on('version-saved', (versionHistory) => {
      setAlertInfo({ message: 'A new code version snapshot has been saved.', type: 'success' });
    });

    socket.on('execution-status', ({ status, user: executingUser }) => {
      if (executingUser._id !== user._id) {
        setExecuting(true);
        setStdout(`Syncing compiler status: ${status} (run by ${executingUser.name})...`);
        setConsoleTab('output');
      }
    });

    socket.on('execution-result', ({ result, user: executingUser }) => {
      if (executingUser._id !== user._id) {
        setExecuting(false);
        if (result.stdout) setStdout(result.stdout);
        if (result.stderr) setStderr(result.stderr);
        if (result.compile_output) setCompileOutput(result.compile_output);
      }
    });

    return () => {
      leaveRoom(roomId, user);
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('version-saved');
      socket.off('execution-status');
      socket.off('execution-result');
    };
  }, [socket, room]);

  const handleLanguageChange = (e) => {
  const newLang = e.target.value;

  setSelectedLanguage(newLang);

  setCodes((prev) => {
    const updated = {
      ...prev,
      [newLang]: prev[newLang] || codeTemplates[newLang],
    };

    emitCodeChange(
      roomId,
      updated[newLang],
      newLang,
      user
    );

    return updated;
  });
};

  const handleEditorChange = (newCode) => {
    setCodes((prev) => ({ ...prev, [selectedLanguage]: newCode }));
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const runTestCode = async () => {
    const currentCode = codes[selectedLanguage] || '';
    if (!currentCode) return;

    try {
      setExecuting(true);
      setConsoleTab('output');
      setStdout('Compiling and running code... Please wait.');
      setStderr('');
      setCompileOutput('');
      setExecutionResult(null);

      // Notify others in room that code is compiling
      emitExecutingStatus(roomId, 'Compiling code', user);

      const res = await API.post('/code/run', {
        code: currentCode,
        language: selectedLanguage,
        stdin,
      });

      if (res.data.success) {
        const runResult = res.data.data;
        setStdout(runResult.stdout || '');
        setStderr(runResult.stderr || '');
        setCompileOutput(runResult.compile_output || '');
        
        // Notify others of completion
        emitExecutionFinished(roomId, runResult, user);
      }
    } catch (err) {
      setStderr('Code execution failed. Please verify inputs or server status.');
    } finally {
      setExecuting(false);
    }
  };
  const submitProblemCode = async () => {
  const currentCode = codes[selectedLanguage] || '';

  if (!currentCode) {
    setStderr("No code to submit");
    return;
  }

  if (!room?.problem?._id) {
    setStderr("No problem selected in this room");
    return;
  }

  try {
    setExecuting(true);
    setConsoleTab('results');
    setStdout('Submitting code for all test cases...');
    setStderr('');
    setCompileOutput('');
    setExecutionResult(null);

    const res = await API.post('/code/submit', {
      problemId: room.problem._id,
      code: currentCode,
      language: selectedLanguage,
    });

    if (res.data.success) {
      setExecutionResult(res.data.data);
    } else {
      setStderr(res.data.message || "Submission failed");
    }

  } catch (err) {
    console.log(err);
    setStderr(err.response?.data?.message || 'Code submission failed.');
  } finally {
    setExecuting(false);
  }
};

 

  const saveCodeVersion = () => {
    const currentCode = codes[selectedLanguage] || '';
    if (!currentCode) return;
    emitSaveVersion(roomId, currentCode, selectedLanguage, user);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          <p className="text-sm font-semibold">Configuring collaborative workspace...</p>
        </div>
      </div>
    );
  }

  const currentEditorValue = codes[selectedLanguage] || '';

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Workspace Header */}
      <header className="h-14 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl text-slate-500 dark:text-dark-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">
              {room?.name}
            </h1>
            <p className="text-[10px] text-brand-500 font-bold tracking-wider">
              ROOM CODE: {roomId}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Share Link */}
          <button
            onClick={copyInviteLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-hover'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Invite Link
              </>
            )}
          </button>

          {/* Save Version */}
          <button
            onClick={saveCodeVersion}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-border dark:hover:bg-dark-hover text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
            title="Save version history"
          >
            <Save className="h-3.5 w-3.5" />
            Snapshot
          </button>

          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200 text-xs font-bold py-1.5 px-3 rounded-xl border-0 focus:ring-1 focus:ring-brand-500/50"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
      </header>

      {/* Main Panel Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left pane: Problem description */}
        <div className="w-1/3 flex flex-col min-w-[300px]">
          <ProblemPanel problem={room?.problem} />
        </div>

        {/* Center pane: Code Editor */}
        <div className="w-5/12 flex flex-col p-4 space-y-4">
          <div className="flex-1 min-h-0 relative">
            <EditorPanel
              roomId={roomId}
              value={currentEditorValue}
              language={selectedLanguage}
              onChange={handleEditorChange}
            />
          </div>

          {/* Console / Compilation Box */}
          <div className="h-56 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
            {/* Tabs */}
            <div className="h-10 bg-slate-50 dark:bg-dark-bg/25 border-b border-slate-200 dark:border-dark-border px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-4">
                <button
                  onClick={() => setConsoleTab('input')}
                  className={`text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                    consoleTab === 'input' ? 'text-brand-500' : 'text-slate-500'
                  }`}
                >
                  Custom Input (Stdin)
                </button>
                <button
                  onClick={() => setConsoleTab('output')}
                  className={`text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                    consoleTab === 'output' ? 'text-brand-500' : 'text-slate-500'
                  }`}
                >
                  Terminal Output
                </button>
                {room?.problem && (
                  <button
                    onClick={() => setConsoleTab('results')}
                    className={`text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                      consoleTab === 'results' ? 'text-brand-500' : 'text-slate-500'
                    }`}
                  >
                    Submission results
                  </button>
                )}
              </div>

              {/* Execution Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={runTestCode}
                  disabled={executing}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-border dark:hover:bg-dark-hover text-slate-700 dark:text-slate-300 text-[10px] font-bold py-1 px-2.5 rounded-lg active:scale-95 disabled:opacity-50"
                >
                  {executing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
                  Run Code
                </button>
                {room?.problem && (
                  <button
                    onClick={submitProblemCode}
                    disabled={executing}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg active:scale-95 disabled:opacity-50"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>

            {/* Tabs view content */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs min-h-0 bg-slate-50/50 dark:bg-dark-bg/10">
              {consoleTab === 'input' && (
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs here..."
                  className="w-full h-full bg-transparent resize-none border-0 focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 text-xs placeholder-slate-400"
                />
              )}

              {consoleTab === 'output' && (
                <div className="space-y-2">
                  {compileOutput && (
                    <div className="text-amber-500">
                      <p className="font-bold uppercase tracking-wider text-[9px] mb-1">Compiler Output:</p>
                      <pre className="whitespace-pre-wrap">{compileOutput}</pre>
                    </div>
                  )}
                  {stdout && (
                    <div className="text-slate-700 dark:text-slate-300">
                      <p className="font-bold uppercase tracking-wider text-[9px] mb-1">Stdout:</p>
                      <pre className="whitespace-pre-wrap">{stdout}</pre>
                    </div>
                  )}
                  {stderr && (
                    <div className="text-rose-500">
                      <p className="font-bold uppercase tracking-wider text-[9px] mb-1">Stderr (Runtime Error):</p>
                      <pre className="whitespace-pre-wrap">{stderr}</pre>
                    </div>
                  )}
                  {!compileOutput && !stdout && !stderr && (
                    <p className="text-slate-400 dark:text-dark-muted italic">Click "Run Code" to print stdout output here.</p>
                  )}
                </div>
              )}

              {consoleTab === 'results' && room?.problem && (
                <div>
                  {executing && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                      <span>Evaluating submissions...</span>
                    </div>
                  )}

                  {executionResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {executionResult.passed ? (
                          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            Accepted
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            {executionResult.status}
                          </div>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          Passed {executionResult.results.filter(r => r.passed).length} / {executionResult.results.length} test cases
                        </span>
                      </div>

                      {/* Display test case items */}
                      <div className="space-y-2">
                        {executionResult.results.map((res, idx) => (
                          <div key={idx} className="p-3 bg-slate-100 dark:bg-dark-bg rounded-lg border border-slate-200 dark:border-dark-border text-[11px] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Test Case {idx + 1} {res.isPublic ? '(Public)' : '(Hidden)'}</span>
                              <span className={`font-semibold ${res.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {res.passed ? 'Passed' : res.status}
                              </span>
                            </div>
                            {res.isPublic && (
                              <div className="text-[10px] text-slate-500 dark:text-dark-muted space-y-0.5">
                                <p>Input: {res.input}</p>
                                <p>Expected: {res.expectedOutput}</p>
                                <p>Actual: {res.actualOutput}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !executing && <p className="text-slate-400 dark:text-dark-muted italic">Click "Submit" to run code against problem test cases.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Chat sidebar & Participants */}
        <div className="w-3/12 flex flex-col p-4 pl-0 space-y-4">
          <div className="h-1/3 shrink-0">
            <ParticipantList participants={participants} ownerId={room?.owner?._id} />
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel roomId={roomId} />
          </div>
        </div>
      </div>
      
      {/* Toast Alert overlay */}
      {alertInfo && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />
        </div>
      )}
    </div>
  );
};

export default CollaborationRoom;
