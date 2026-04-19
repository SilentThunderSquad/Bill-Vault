import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  // Global test setup
  process.env.VITE_SUPABASE_URL = 'https://placeholder.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'placeholder-key';
});

afterAll(() => {
  // Global teardown
});
