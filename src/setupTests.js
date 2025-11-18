// setupTests.js
require('@testing-library/jest-dom');

// Mock global pour window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addListener: jest.fn(), // Déprécié
    removeListener: jest.fn(), // Déprécié
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Polyfill minimal de fetch pour les tests (Firebase en a besoin)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
    text: async () => '',
  });
}

// Polyfills Web Fetch API manquants pour Firebase Auth (Headers, Request, Response)
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers { constructor(init) { this.map = init || {}; } };
}
if (typeof global.Request === 'undefined') {
  global.Request = class Request { constructor(input, init) { this.input = input; this.init = init || {}; } };
}
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body = '', init = {}) { this.body = body; this.status = init.status || 200; this.ok = this.status >= 200 && this.status < 300; }
    async json() { try { return typeof this.body === 'string' ? JSON.parse(this.body || '{}') : (this.body || {}); } catch { return {}; } }
    async text() { return typeof this.body === 'string' ? this.body : ''; }
  };
}