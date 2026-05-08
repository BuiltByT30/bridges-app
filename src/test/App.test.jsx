import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignOut,
  mockSignInWithPassword,
} from './mocks/supabase.js';
import App from '../App.jsx';

beforeEach(() => {
  vi.clearAllMocks();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe('App – initial screen (session check)', () => {
  it('shows landing screen when no session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    render(<App />);
    expect(await screen.findByText(/brings people together/i)).toBeInTheDocument();
  });

  it('shows main app when session exists with onboarded user', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'u1',
            email: 'alex@example.com',
            user_metadata: { full_name: 'Alex', onboarded: true },
          },
        },
      },
    });
    render(<App />);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('shows onboarding when session exists but user not yet onboarded', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'u2',
            email: 'new@example.com',
            user_metadata: { full_name: 'New User', onboarded: false },
          },
        },
      },
    });
    render(<App />);
    expect(await screen.findByText(/STEP 1 OF 4/i)).toBeInTheDocument();
  });
});

describe('App – auth state change listener', () => {
  it('calls onAuthStateChange on mount', () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    render(<App />);
    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('cleans up subscription on unmount', () => {
    const unsubscribe = vi.fn();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });
    const { unmount } = render(<App />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('navigates to landing when auth state changes to signed-out', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    let authCallback;
    mockOnAuthStateChange.mockImplementation((cb) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    render(<App />);
    await screen.findByText(/brings people together/i);

    // Simulate a sign-out event
    authCallback('SIGNED_OUT', null);
    await waitFor(() => {
      expect(screen.getByText(/brings people together/i)).toBeInTheDocument();
    });
  });

  it('navigates to onboarding when auth listener fires during loading with un-onboarded user', async () => {
    // Simulate OAuth redirect: getSession never resolves (app stays in "loading"),
    // but the onAuthStateChange listener fires with the new session.
    mockGetSession.mockReturnValue(new Promise(() => {})); // never resolves
    let authCallback;
    mockOnAuthStateChange.mockImplementation((cb) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    render(<App />);

    await act(async () => {
      authCallback('SIGNED_IN', {
        user: {
          id: 'oauth-user',
          email: 'oauth@example.com',
          user_metadata: { full_name: 'OAuth User', onboarded: false },
        },
      });
    });
    expect(await screen.findByText(/STEP 1 OF 4/i)).toBeInTheDocument();
  });
});

describe('App – sign out', () => {
  it('calls supabase.auth.signOut and returns to landing', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'u1',
            email: 'user@example.com',
            user_metadata: { full_name: 'User', onboarded: true },
          },
        },
      },
    });
    mockSignOut.mockResolvedValue({});
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(<App />);
    await screen.findByText('Dashboard');

    const user = userEvent.setup();
    // Sign out button lives in the sidebar
    await user.click(screen.getByTitle('Sign out'));
    expect(mockSignOut).toHaveBeenCalled();
    expect(await screen.findByText(/brings people together/i)).toBeInTheDocument();
  });
});

describe('App – landing screen navigation', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it('navigates to sign-up when "Get Started Free" is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Get Started Free/i }));
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('navigates to login when "Sign in" is clicked from landing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Welcome back 👋')).toBeInTheDocument();
  });

  it('navigates to sign-up from "Create Free Account" CTA', async () => {
    const user = userEvent.setup();
    render(<App />);
    // Multiple "Create Free Account" buttons exist — click the first (hero)
    const btns = await screen.findAllByText(/Create Free Account/i);
    await user.click(btns[0]);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
});

describe('App – full sign-up → onboarding flow', () => {
  it('lands on onboarding after successful sign-up', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { mockSignUp } = await import('./mocks/supabase.js');
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null,
    });

    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Get Started Free/i }));
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Sam Smith');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'sam@example.com');
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'SecureP1!');
    await user.click(screen.getByText(/I agree to the/i).closest('div'));
    await user.click(screen.getByText(/Create Account/i));

    expect(await screen.findByText(/STEP 1 OF 4/i)).toBeInTheDocument();
  });
});

describe('App – full login → app flow', () => {
  it('lands on main app after successful login', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'u3',
          email: 'u@example.com',
          user_metadata: { full_name: 'Returning User', onboarded: true },
        },
      },
      error: null,
    });

    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'u@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'SecureP1!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});
