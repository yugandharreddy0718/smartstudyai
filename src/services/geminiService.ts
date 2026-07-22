export const geminiService = {
  async generateSummary(text: string): Promise<string> {
    const res = await fetch('/api/gemini/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      throw new Error(`Failed to generate summary: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  },

  async generateSummaryFromMultimodal(fileData: { mimeType: string, data: string }): Promise<string> {
    const res = await fetch('/api/gemini/multimodal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileData })
    });
    if (!res.ok) {
      throw new Error(`Failed to generate summary from file: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  },

  async generateQuiz(text: string, count: number = 5): Promise<any[]> {
    const res = await fetch('/api/gemini/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, count })
    });
    if (!res.ok) {
      throw new Error(`Failed to generate quiz: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  },

  async generateFlashcards(text: string): Promise<any[]> {
    const res = await fetch('/api/gemini/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      throw new Error(`Failed to generate flashcards: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  },

  async generateTopics(text: string): Promise<string> {
    const res = await fetch('/api/gemini/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      throw new Error(`Failed to generate topics: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  },

  async generateExplanation(text: string): Promise<string> {
    const res = await fetch('/api/gemini/explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      throw new Error(`Failed to generate explanation: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  },

  async chatWithTutor(history: { role: string, content: string }[], message: string): Promise<string> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message })
    });
    if (!res.ok) {
      throw new Error(`Failed to chat with tutor: ${res.statusText}`);
    }
    const data = await res.json();
    return data.result;
  }
};
