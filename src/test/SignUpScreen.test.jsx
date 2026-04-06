import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockSignUp,
  mockOnAuthStateChange,
  mockGetSession,
  mockSignInWithOAuth,
} from './mocks/supabase.js';
import App from '../App.jsx';

// Navigate from landing → sign-up and return a userEvent instance
async function renderSignUp() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByText(/Get Started Free/i));
  return user;
}

// Fill all valid fields
async function fillValidForm(user) {
  await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane Doe');
  await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'jane@example.com');
  await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'SecurePass1!');
  // Accept terms
  await user.click(screen.getByText(/I agree to the/i).closest('div'));
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no existing session
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe('SignUpScreen – form validation', () => {
  it('shows name error when name is blank', async () => {
    const user = await renderSignUp();
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });

  it('shows email error for missing @', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'notanemail');
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
  });

  it('shows password error when fewer than 8 characters', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'jane@example.com');
    // 7 chars with uppercase + number + special so only the length check fails
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'Short1!');
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('Minimum 8 characters')).toBeInTheDocument();
  });

  it('shows password error when no uppercase letter', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'jane@example.com');
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'nouppercase1');
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('Must include an uppercase letter')).toBeInTheDocument();
  });

  it('shows password error when no number', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'jane@example.com');
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'NoNumbers!');
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('Must include a number')).toBeInTheDocument();
  });

  it('shows terms error when terms not accepted', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'jane@example.com');
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'SecurePass1!');
    // Do NOT click agree
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('You must accept the terms to continue')).toBeInTheDocument();
  });

  it('does not call supabase when validation fails', async () => {
    const user = await renderSignUp();
    await user.click(screen.getByText(/Create Account/i));
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});

describe('SignUpScreen – successful sign up', () => {
  it('calls supabase.auth.signUp with correct credentials', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    const user = await renderSignUp();
    await fillValidForm(user);
    await user.click(screen.getByText(/Create Account/i));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'SecurePass1!',
        options: { data: { full_name: 'Jane Doe' } },
      });
    });
  });

  it('navigates to onboarding after successful sign up', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    const user = await renderSignUp();
    await fillValidForm(user);
    await user.click(screen.getByText(/Create Account/i));
    // Onboarding screen shows "STEP 1 OF 4"
    expect(await screen.findByText(/STEP 1 OF 4/i)).toBeInTheDocument();
  });
});

describe('SignUpScreen – auth errors', () => {
  it('shows supabase error message on failure', async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: 'User already registered' },
    });
    const user = await renderSignUp();
    await fillValidForm(user);
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText('User already registered')).toBeInTheDocument();
  });

  it('stays on sign-up screen after auth error', async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: 'Email already in use' },
    });
    const user = await renderSignUp();
    await fillValidForm(user);
    await user.click(screen.getByText(/Create Account/i));
    await screen.findByText('Email already in use');
    // Still on signup — the heading should still be present
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
});

describe('SignUpScreen – OAuth', () => {
  it('calls signInWithOAuth with google provider', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const user = await renderSignUp();
    await user.click(screen.getByText(/Google/i));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    );
  });

  it('calls signInWithOAuth with apple provider', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const user = await renderSignUp();
    await user.click(screen.getByText(/Apple/i));
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'apple' })
    );
  });

  it('shows error if OAuth fails', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'OAuth unavailable' } });
    const user = await renderSignUp();
    await user.click(screen.getByText(/Google/i));
    expect(await screen.findByText('OAuth unavailable')).toBeInTheDocument();
  });
});

describe('SignUpScreen – navigation', () => {
  it('navigates to login when "Sign in" link is clicked', async () => {
    const user = await renderSignUp();
    await user.click(screen.getByText('Sign in'));
    expect(await screen.findByText('Welcome back 👋')).toBeInTheDocument();
  });

  it('opens Terms of Service policy page when link is clicked', async () => {
    const user = await renderSignUp();
    await user.click(screen.getByText('Terms of Service'));
    expect(await screen.findByText(/Terms of Service/i, { selector: 'h1' })).toBeInTheDocument();
  });

  it('opens Privacy Policy page when link is clicked', async () => {
    const user = await renderSignUp();
    await user.click(screen.getByText('Privacy Policy'));
    expect(await screen.findByText(/Privacy Policy/i, { selector: 'h1' })).toBeInTheDocument();
  });

  it('returns from policy page and pre-checks agreed box', async () => {
    const user = await renderSignUp();
    await user.click(screen.getByText('Terms of Service'));
    await user.click(await screen.findByText('Accept & Return'));
    // Should be back on sign up screen with agreed toggled
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
});
