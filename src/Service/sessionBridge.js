// Module-level bridge so axios request interceptors (service.js) can read
// the current NextAuth apiToken synchronously, without an async
// getSession() round-trip on every request. Kept in sync by
// SessionBridgeSync (src/Providers/AuthSessionProvider.js), which is the
// only writer — everything else just reads.

let currentApiToken = null;

export function setCurrentSession(session) {
  currentApiToken = session?.apiToken || null;
}

export function getCurrentApiToken() {
  return currentApiToken;
}
