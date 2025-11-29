import React from 'react';

// NOTE: This type definition must match the one in helpRequestService.ts
type HelpRequest = {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'; 
};

interface HelpRequestListProps {
  requests: HelpRequest[];
  onClaim: (id: string) => void;
  onComplete: (id: string) => void;
  onOpenChat: (id: string) => void;
}

// --- Styling Constants ---
const BRAND_COLOR = "#007bff";
const STATUS_COLORS = {
  OPEN: '#28a745',       
  IN_PROGRESS: BRAND_COLOR, 
  COMPLETED: '#6c757d',  
};

// Helper component for the Status Badge
const StatusBadge: React.FC<{ status: HelpRequest['status'] }> = ({ status }) => (
    <span style={{
        backgroundColor: STATUS_COLORS[status] || '#ccc',
        color: '#fff',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        marginLeft: '0.5rem',
        display: 'inline-block'
    }}>
        {status.replace('_', ' ')}
    </span>
);

// Styled Button Component
const StyledButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isPrimary?: boolean }> = ({ children, isPrimary = true, ...props }) => {
    
    const buttonStyle: React.CSSProperties = {
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'background-color 0.2s',
        backgroundColor: isPrimary ? BRAND_COLOR : '#f8f9fa',
        color: isPrimary ? '#fff' : '#495057',
        boxShadow: isPrimary ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
        border: isPrimary ? 'none' : '1px solid #ced4da', 
        ...props.style 
    };

    return (
        <button
            {...props}
            style={buttonStyle}
        >
            {children}
        </button>
    );
};


export default function HelpRequestList({
  requests,
  onClaim,
  onComplete,
  onOpenChat,
}: HelpRequestListProps) {
  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      {requests.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No active help requests right now.</p>
      ) : (
        requests.map((req) => (
          <div 
            key={req.id} 
            style={{ 
              marginBottom: "1.5rem", 
              padding: "1.5rem", 
              border: "1px solid #eee", 
              borderRadius: "10px", 
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              backgroundColor: "#fff"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>
                    {req.title}
                </h4>
                <StatusBadge status={req.status as HelpRequest['status']} />
            </div>

            <p style={{ color: '#555', marginBottom: '1rem', fontSize: '0.95rem' }}>
                {req.description || 'No detailed description provided.'}
            </p>
            
            <div style={{ marginTop: "1rem", borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
              {req.status === "OPEN" && (
                <StyledButton onClick={() => onClaim(req.id)}>
                    Claim Request
                </StyledButton>
              )}
              {req.status === "IN_PROGRESS" && (
                <>
                  <StyledButton 
                    onClick={() => onComplete(req.id)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Mark Complete
                  </StyledButton>
                  <StyledButton
                    onClick={() => onOpenChat(req.id)}
                    isPrimary={false} 
                  >
                    💬 Chat
                  </StyledButton>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}