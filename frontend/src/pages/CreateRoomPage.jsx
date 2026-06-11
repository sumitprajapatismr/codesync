import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Alert from "../components/Alert";

const CreateRoomPage = () => {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isInterview, setIsInterview] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ SEARCH (DEBOUNCE FIX)
useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      const res = await API.get("/problems", {
        params: { search: searchTerm }
      });

      setProblems(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);
  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomName) {
      setError("Room name required");
      return;
    }

    try {
      setLoading(true);

      if (isInterview) {
        if (!candidateEmail) {
          setError("Candidate email required");
          setLoading(false);
          return;
        }

        const res = await API.post("/interviews/create", {
          roomName,
          candidateEmail,
          problemId: selectedProblemId || undefined,
        });

        if (res.data.success) {
          navigate(`/room/${res.data.data.roomId}`);
        }
      } else {
        const res = await API.post("/rooms/create", {
          name: roomName,
          problemId: selectedProblemId || undefined,
        });

        if (res.data.success) {
          navigate(`/room/${res.data.data.roomId}`);
        }
      }
    } catch (err) {
      setError("Error creating room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">

      {error && <Alert message={error} type="error" onClose={() => setError("")} />}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ROOM NAME */}
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room name"
          className="w-full border p-3 rounded"
        />

        {/* SEARCH PROBLEM */}
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search problems..."
          className="w-full border p-3 rounded"
        />

        {/* PROBLEM LIST */}
        <div className="max-h-60 overflow-y-auto border rounded">

          <div
            onClick={() => setSelectedProblemId("")}
            className="p-3 cursor-pointer border-b hover:bg-gray-100"
          >
            Sandbox Mode
          </div>
          {problems.map((prob) => (
  <div
    key={prob._id}
    onClick={() => setSelectedProblemId(prob._id)}
    className={`p-3 cursor-pointer border-b hover:bg-gray-100 transition ${
      selectedProblemId === prob._id
        ? "bg-blue-100 border-l-4 border-blue-500"
        : ""
    }`}
  >
    <p className="font-medium">{prob.title}</p>
    <p className="text-xs text-gray-500">{prob.difficulty}</p>
  </div>
))}

          

        </div>

        {/* INTERVIEW MODE (RESTORED) */}
        <div className="p-4 border rounded-xl flex justify-between items-center">

          <div>
            <p className="font-bold">Interview Mode</p>
            <p className="text-xs text-gray-500">
              Enable candidate invitation
            </p>
          </div>

          <input
            type="checkbox"
            checked={isInterview}
            onChange={(e) => setIsInterview(e.target.checked)}
          />
        </div>

        {/* CANDIDATE EMAIL */}
        {isInterview && (
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            placeholder="Candidate email"
            className="w-full border p-3 rounded"
          />
        )}

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>

      </form>
    </div>
  );
};

export default CreateRoomPage;