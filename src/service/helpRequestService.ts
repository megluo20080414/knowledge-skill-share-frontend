// src/service/helpRequestService.ts

export type HelpRequest = {
  id: string;
  createdBy: string;
  claimedBy?: string | null;
  // CRITICAL FIX: The status property must be the strict union type
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'; 
  title: string;
  description?: string;
};

const BASE_URL = "http://localhost:8080/api/requests";

/**
* Fetch help requests by status
*/
export async function fetchHelpRequests(status: string): Promise<HelpRequest[]> {
  const url = `${BASE_URL}?status=${status}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch help requests");
  return res.json();
}

/**
* Create a new help request
*/
export async function createHelpRequest(
  title: string,
  description: string,
  userId: string
): Promise<void> {
  const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
      },
      body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Failed to create help request");
}

/**
* Claim a help request
*/
export async function claimHelpRequest(id: string, helperId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/claim`, {
      method: "POST",
      headers: { "X-User-Id": helperId },
  });
  if (!res.ok) throw new Error("Failed to claim help request");
}

/**
* Complete a help request
*/
export async function completeHelpRequest(id: string, requesterId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/complete`, {
      method: "POST",
      headers: { "X-User-Id": requesterId },
  });
  if (!res.ok) throw new Error("Failed to complete help request");
}