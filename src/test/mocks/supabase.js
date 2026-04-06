// Centralized Supabase mock. Each test can override individual methods via vi.mocked().
import { vi } from 'vitest';

export const mockSignUp = vi.fn();
export const mockSignInWithPassword = vi.fn();
export const mockSignInWithOAuth = vi.fn();
export const mockSignOut = vi.fn();
export const mockGetSession = vi.fn();
export const mockUpdateUser = vi.fn();
export const mockResetPasswordForEmail = vi.fn();
export const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      getSession: mockGetSession,
      updateUser: mockUpdateUser,
      resetPasswordForEmail: mockResetPasswordForEmail,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));
