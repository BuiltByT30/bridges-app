import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockSignInWithPassword,
  mockSignInWithOAuth,
  mockResetPasswordForEmail,
  mockOnAuthStateChange,
  mockGetSession,
} from './mocks/supabase.js';
import App from '../App.jsx';

// Navigate from landing → login
async function renderLogin() {
  const user = userEvent.setup();
  render(<App />);
  // The nav has an exact "Sign in" button; the hero has "Sign in to existing account"
  await user.click(await screen.findByRole('button', { name: 'Sign in' }));
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe('LoginScreen – form validation', () => {
  it('shows email error when no @ in email', async () => {
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'notvalid');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
  });

  it('shows password required error when password is empty', async () => {
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText('Required')).toBeInTheDocument();
  });

  it('does not call supabase when validation fails', async () => {
    const user = await renderLogin();
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});

describe('LoginScreen – successful login', () => {
  const mockUser = {
    id: 'user-abc',
    email: 'user@example.com',
    user_metadata: { full_name: 'John Smith', role: 'Engineer', onboarded: true },
  };

  it('calls signInWithPassword with correct credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: mockUser }, error: null });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'MyPass1!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'MyPass1!',
      });
    });
  });

  it('navigates to main app after successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: mockUser }, error: null });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'MyPass1!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    // Main app shows Dashboard tab
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('falls back to email prefix when full_name is absent', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1', email: 'nate@example.com', user_metadata: {} } },
      error: null,
    });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'nate@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'Pass1234!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});

describe('LoginScreen – auth errors', () => {
  it('displays supabase error message', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'WrongPass1!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument();
  });

  it('stays on login screen after error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Account locked' },
    });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'Pass1!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    await screen.findByText('Account locked');
    expect(screen.getByText('Welcome back 👋')).toBeInTheDocument();
  });
});

describe('LoginScreen – OAuth', () => {
  it('calls signInWithOAuth with google', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const user = await renderLogin();
    await user.click(screen.getByText(/Google/i));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    );
  });

  it('calls signInWithOAuth with apple', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const user = await renderLogin();
    await user.click(screen.getByText(/Apple/i));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'apple' })
    );
  });
});

describe('LoginScreen – forgot password', () => {
  it('shows error if "Forgot password?" clicked without email', async () => {
    const user = await renderLogin();
    await user.click(screen.getByText('Forgot password?'));
    expect(await screen.findByText('Enter your email first')).toBeInTheDocument();
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('calls resetPasswordForEmail with correct email', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.click(screen.getByText('Forgot password?'));
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('reset=true') })
      );
    });
  });

  it('shows confirmation message after reset email sent', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.click(screen.getByText('Forgot password?'));
    expect(await screen.findByText(/Password reset email sent/i)).toBeInTheDocument();
  });

  it('shows error if reset email request fails', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'Too many requests' },
    });
    const user = await renderLogin();
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com');
    await user.click(screen.getByText('Forgot password?'));
    expect(await screen.findByText('Too many requests')).toBeInTheDocument();
  });
});

describe('LoginScreen – navigation', () => {
  it('navigates to sign up when "Sign up free" is clicked', async () => {
    const user = await renderLogin();
    await user.click(screen.getByText('Sign up free'));
    expect(await screen.findByText('Create your account')).toBeInTheDocument();
  });
});
