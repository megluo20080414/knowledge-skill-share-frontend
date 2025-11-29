import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import HelpRequestList from "./components/HelpRequestList";
import ChatWindow from "./components/ChatWindow";
import {
  fetchHelpRequests,
  createHelpRequest,
  claimHelpRequest,
  completeHelpRequest,
  type HelpRequest,
} from "./service/helpRequestService";
import React from "react"; 

// --- Styling Constants ---
const BRAND_COLOR = "#007bff";

const inputStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "1rem",
  marginRight: "1rem",
  transition: "border-color 0.2s",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: BRAND_COLOR,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "0.6rem 1.2rem",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.2s",
};

// --- Component Start ---
function App() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<"REQUESTER" | "HELPER">("REQUESTER");

  const USER_IDS = {
    REQUESTER: "123e4567-e89b-12d3-a456-426614174000",
    HELPER: "789e4567-e89b-12d3-a456-426614174999",
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchHelpRequests(filter);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
        alert("Title and description cannot be empty.");
        return;
    }
    try {
      await createHelpRequest(title, description, USER_IDS.REQUESTER);
      setTitle("");
      setDescription("");
      loadRequests();
    } catch (err) {
      alert("Error creating request");
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await claimHelpRequest(id, USER_IDS.HELPER);
      loadRequests();
    } catch (err) {
      alert("Error claiming request");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeHelpRequest(id, USER_IDS.REQUESTER);
      loadRequests();
    } catch (err) {
      alert("Error completing request");
    }
  };

  if (loading) return <p style={{ textAlign: "center", paddingTop: "50px" }}>Loading help requests...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: "#f4f7f9", minHeight: "100vh" }}>
      <h1 style={{ color: "#333", borderBottom: '2px solid #ddd', paddingBottom: '1rem', marginBottom: '2rem' }}>
        Support Dashboard
      </h1>

      {/* Control Panel: User Switch & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
        {/* User Switch */}
        <div>
          <label style={{ fontWeight: '600', color: '#555' }}>
            Current Role:
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value as "REQUESTER" | "HELPER")}
              style={{ ...inputStyle, width: "150px", marginLeft: "0.8rem" }}
            >
              <option value="REQUESTER">Requester</option>
              <option value="HELPER">Helper</option>
            </select>
          </label>
        </div>

        {/* Filter & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ fontWeight: '600', color: '#555' }}>
            Filter Status:
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ ...inputStyle, width: "150px", marginLeft: "0.8rem" }}
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>
          <button onClick={loadRequests} style={primaryButtonStyle}>
            🔄 Refresh List
          </button>
        </div>
      </div>

      {/* Create Form */}
      {currentUser === "REQUESTER" && (
        <form onSubmit={handleSubmit} style={{ 
            marginBottom: "3rem", 
            padding: "1.5rem", 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}>
          <h3 style={{ margin: 0, color: BRAND_COLOR }}>New Request:</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g., Printer Error)"
            style={{ ...inputStyle, flexGrow: 1, marginRight: 0 }}
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief Description"
            style={{ ...inputStyle, flexGrow: 2, marginRight: 0 }}
            required
          />
          <button type="submit" style={primaryButtonStyle}>
            ➕ Create Request
          </button>
        </form>
      )}

      {/* Help Request List */}
      <h3 style={{ color: '#333', marginTop: '3rem' }}>
        {filter === 'ALL' ? 'All Requests' : `${filter.replace('_', ' ')} Requests`}
      </h3>
      <HelpRequestList
        requests={requests}
        onClaim={currentUser === "HELPER" ? handleClaim : () => alert('Only Helpers can claim.')}
        onComplete={currentUser === "REQUESTER" ? handleComplete : () => alert('Only the Requester can complete.')}
        onOpenChat={(id) => setChatRequestId(id)}
      />

      {/* Chat Window: Fixed Position Overlay */}
      {chatRequestId && (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
        }}>
            <ChatWindow
              requestId={chatRequestId}
              currentUserId={USER_IDS[currentUser]}
              onClose={() => setChatRequestId(null)}
              onMessageSent={loadRequests} 
            />
        </div>
      )}
    </div>
  );
}

export default App;