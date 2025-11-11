import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type HelpRequest = {
  id: string;
  createdBy: string;
  claimedBy?: string | null;
  status: string;
  title: string;
  description?: string;
};

function App() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [userRole, setUserRole] = useState("REQUESTER"); // ✅ 新增角色切換

  // 模擬使用者帳號
  const userIds = {
    REQUESTER: "123e4567-e89b-12d3-a456-426614174000",
    HELPER: "789e4567-e89b-12d3-a456-426614174999",
  };
  const currentUserId = userIds[userRole];

  // Fetch help requests by status
  const fetchRequests = () => {
    setLoading(true);
    fetch(`http://localhost:8080/api/requests?status=${filter}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requests");
        return res.json();
      })
      .then((data: HelpRequest[]) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Create help request
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const body = { title, description };

    try {
      const res = await fetch("http://localhost:8080/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUserId,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create request");

      setTitle("");
      setDescription("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Error creating request");
    }
  };

  // Claim request
  const handleClaim = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/requests/${id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUserId,
        },
      });
      if (!res.ok) throw new Error("Claim failed");
      alert("Request claimed successfully!");
      setFilter("IN_PROGRESS");
    } catch (err) {
      console.error(err);
      alert("Error claiming request");
    }
  };

  // Complete request
  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/requests/${id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUserId,
        },
      });
      if (!res.ok) throw new Error("Complete failed");
      alert("Request marked as completed!");
      setFilter("COMPLETED");
    } catch (err) {
      console.error(err);
      alert("Error completing request");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Help Requests Dashboard</h2>

      {/* 👥 使用者身份選擇 */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Current Role:
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="REQUESTER">Requester</option>
            <option value="HELPER">Helper</option>
          </select>
        </label>
        <span style={{ marginLeft: "1rem", fontStyle: "italic" }}>
          (User ID: {currentUserId})
        </span>
      </div>

      {/* 篩選選單 */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Filter by status:
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
        <button onClick={fetchRequests} style={{ marginLeft: "1rem" }}>
          Refresh
        </button>
      </div>

      {/* 表單區 */}
      {userRole === "REQUESTER" && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Title:
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginLeft: "1rem", width: "300px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Description:
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginLeft: "1rem", width: "300px" }}
              />
            </label>
          </div>

          <button type="submit">Create Help Request</button>
        </form>
      )}

      {/* 列表區 */}
      {requests.length === 0 ? (
        <p>No requests found for "{filter}" status.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.id} style={{ marginBottom: "1rem" }}>
              <strong>{req.title}</strong> — {req.description}
              <br />
              <em>Status:</em> {req.status}
              <div style={{ marginTop: "0.5rem" }}>
                {req.status === "OPEN" && userRole === "HELPER" && (
                  <button
                    onClick={() => handleClaim(req.id)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Claim
                  </button>
                )}
                {req.status === "IN_PROGRESS" && (
                  <button onClick={() => handleComplete(req.id)}>Complete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
