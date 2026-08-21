// @ts-ignore
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { auth } = await import('@smartstudy/firebase');
    if (auth?.currentUser) {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`[AUTH DEBUG]
Frontend Firebase user UID: ${user.uid}
Frontend Firebase user email: ${user.email || 'N/A'}
ID token obtained: YES
Authorization header attached: YES`);
      } else {
        console.warn(`[AUTH DEBUG]
Frontend Firebase user UID: ${user.uid}
Frontend Firebase user email: ${user.email || 'N/A'}
ID token obtained: NO
Authorization header attached: NO`);
      }
    } else {
      console.warn(`[AUTH DEBUG]
Frontend Firebase user: NONE (Not logged in)
Authorization header attached: NO`);
    }
  } catch (e) {
    console.error(`[AUTH DEBUG] Notice in getAuthHeaders:`, e);
  }
  return headers;
}

export const apiClient = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  async post(endpoint: string, body: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }
};
