// src/state.ts
export const sessions = new Map<
  string,
  Map<string, { submissions: any[] }>
>();
