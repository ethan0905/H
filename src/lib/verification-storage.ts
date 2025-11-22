// Shared verification sessions storage
// In production, replace this with Redis or another shared storage

interface VerificationSession {
  sessionId: string;
  app_id: string;
  action: string;
  status: 'pending' | 'verified' | 'failed';
  proof?: any;
  createdAt: number;
}

class VerificationStorage {
  private sessions = new Map<string, VerificationSession>();

  constructor() {
    // Clean up old sessions periodically (older than 10 minutes)
    setInterval(() => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      this.sessions.forEach((session, sessionId) => {
        if (session.createdAt < tenMinutesAgo) {
          this.sessions.delete(sessionId);
        }
      });
    }, 60000);
  }

  set(sessionId: string, session: VerificationSession): void {
    this.sessions.set(sessionId, session);
  }

  get(sessionId: string): VerificationSession | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}

// Export a singleton instance
export const verificationStorage = new VerificationStorage();
