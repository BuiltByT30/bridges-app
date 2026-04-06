import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockGetSession, mockOnAuthStateChange } from './mocks/supabase.js';
import App from '../App.jsx';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

// PasswordStrength is not exported from the monolithic App.jsx, so we test it
// indirectly via SignUpScreen. We mount the full App and navigate to sign-up.

async function renderSignUp() {
  const user = userEvent.setup();
  render(<App />);
  const getStarted = await screen.findByText(/Get Started Free/i);
  await user.click(getStarted);
  return user;
}

describe('PasswordStrength', () => {
  it('renders nothing when password is empty', async () => {
    await renderSignUp();
    expect(screen.queryByText('8+ characters')).not.toBeInTheDocument();
  });

  it('shows "Weak" when exactly 1 check passes (special char only)', async () => {
    const user = await renderSignUp();
    // '!' passes only the special-char check → score 1 → "Weak"
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), '!');
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('shows "Fair" when length + uppercase pass (2 checks)', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'Abcdefgh');
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('shows "Good" when length + uppercase + number pass (3 checks)', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'Abcdefg1');
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows "Strong" when all 4 checks pass', async () => {
    const user = await renderSignUp();
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'Abcdefg1!');
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
});
