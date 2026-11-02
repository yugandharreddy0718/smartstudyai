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

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMessage = `API Error: ${res.status} ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson && (errorJson.error || errorJson.message)) {
        errorMessage = errorJson.error || errorJson.message;
      }
    } catch (e) {
      // Ignore JSON parse error for plain text/HTML error pages
    }
    throw new Error(errorMessage);
  }
  const data = await res.json();
  if (data && typeof data === 'object' && data.success === false) {
    throw new Error(data.error || data.message || 'API request failed.');
  }
  return data;
}

export const apiClient = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    return handleResponse(res);
  },
  async post(endpoint: string, body: any) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  }
};
