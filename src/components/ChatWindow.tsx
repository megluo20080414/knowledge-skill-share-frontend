import { useEffect, useState } from "react";
import React from 'react'; 

type ChatMessage = {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  sentAt: string;
};

// CRITICAL: Ensure ChatWindowProps is clearly defined and separate
type ChatWindowProps = {
  requestId: string;
  currentUserId: string;
  onClose: () => void;
  onMessageSent: () => void;
};

const BRAND_COLOR = "#007bff"; 

export default function ChatWindow({ requestId, currentUserId, onClose, onMessageSent }: ChatWindowProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Data and Logic ---

  // Create or get chat session
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/chats/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": currentUserId,
          },
          body: JSON.stringify({ requestId }),
        });
        const data = await res.json();
        setSessionId(data.id);
        setLoading(false);
      } catch (err) {
        console.error("Error starting chat session:", err);
      }
    };
    startSession();
  }, [requestId, currentUserId]);

  // Load messages
  const loadMessages = async (sid: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/chats/sessions/${sid}/messages`,
        { headers: { "X-User-Id": currentUserId } }
      );
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
      const interval = setInterval(() => loadMessages(sessionId), 3000); 
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  // Send message
  const handleSend = async () => {
    if (!sessionId || !newMessage.trim()) return;
    try {
      await fetch(`http://localhost:8080/api/chats/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": currentUserId,
        },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage("");
      loadMessages(sessionId);
      onMessageSent(); // Notify parent (App.tsx) that a message was sent
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };


  // --- Rendered Component ---
  if (loading) return (
      <div style={{ padding: "1.5rem", width: "420px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <p style={{ textAlign: 'center' }}>Starting chat session...</p>
      </div>
  );

  return (
    <div style={{
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", 
      padding: "1.5rem", 
      borderRadius: "12px", 
      width: "420px",
      backgroundColor: "#ffffff", 
      fontFamily: "'Segoe UI', Roboto, sans-serif" 
    }}>
      
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1rem" 
      }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#333" }}>
          💬 Chat
        </h3>
        <button onClick={onClose} style={{ 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          color: "#888", 
          fontSize: "1.2rem",
          padding: "5px",
        }}>
          &times; 
        </button>
      </div>

      {/* Message Feed Container */}
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          padding: "1rem", 
          borderRadius: "8px", 
          background: "#f7f7f7", 
        }}
      >
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', paddingTop: '100px', fontStyle: 'italic' }}>
            Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId;
            
            const bubbleStyle: React.CSSProperties = {
                display: "inline-block",
                padding: "0.6rem 0.9rem", 
                maxWidth: "80%",
                color: isCurrentUser ? "#fff" : "#333", 
                borderRadius: isCurrentUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", 
                backgroundColor: isCurrentUser ? BRAND_COLOR : "#fff", 
                boxShadow: isCurrentUser ? "none" : "0 1px 2px rgba(0,0,0,0.05)", 
                overflowWrap: "break-word", 
                wordBreak: "normal", 
                fontSize: "0.95rem"
            };

            return (
              <div
                key={msg.id}
                style={{
                  textAlign: isCurrentUser ? "right" : "left",
                  margin: "0.5rem 0", 
                }}
              >
                <span style={bubbleStyle}>
                  {msg.content}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area (Composer) */}
      <div style={{ 
        marginTop: "1.5rem", 
        display: "flex", 
        gap: "0.5rem" 
      }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress} 
          placeholder="Type your message..."
          disabled={!sessionId} 
          style={{ 
            flexGrow: 1, 
            padding: "0.6rem 1rem", 
            borderRadius: "20px", 
            border: "1px solid #ddd", 
            outline: "none", 
            fontSize: "1rem",
            transition: "border 0.2s"
          }}
        />
        <button onClick={handleSend} disabled={!sessionId || !newMessage.trim()} style={{ 
          backgroundColor: BRAND_COLOR, 
          color: "#fff", 
          border: "none", 
          borderRadius: "20px", 
          padding: "0.6rem 1rem", 
          cursor: "pointer", 
          fontWeight: "bold",
          opacity: (!sessionId || !newMessage.trim()) ? 0.6 : 1, 
          transition: "opacity 0.2s, background-color 0.2s"
        }}>
          Send
        </button>
      </div>
    </div>
  );
}