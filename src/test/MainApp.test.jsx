import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignOut,
  mockUpdateUser,
} from './mocks/supabase.js';
import { mockSignUp, mockSignInWithPassword } from './mocks/supabase.js';
import App from '../App.jsx';

// Nav button accessible names include the emoji icon, e.g. "⊞Dashboard".
// Use regex partial match so we don't need to know the exact emoji.
function navBtn(label) {
  return screen.getByRole('button', { name: new RegExp(label) });
}

function renderMainApp(userMeta = {}) {
  const session = {
    user: {
      id: 'u1',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User', onboarded: true, ...userMeta },
    },
  };
  mockGetSession.mockResolvedValue({ data: { session } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
  const user = userEvent.setup();
  render(<App />);
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateUser.mockResolvedValue({ data: {}, error: null });
});

// ── Sidebar navigation ────────────────────────────────────────────────────────
describe('Sidebar navigation', () => {
  it('renders all 6 nav tab labels', async () => {
    renderMainApp();
    await screen.findByText('Dashboard'); // wait for app to load
    for (const label of ['Dashboard', 'Messages', 'Community', 'Projects', 'Profile', 'Settings']) {
      expect(navBtn(label)).toBeInTheDocument();
    }
  });

  it('navigates to Messages tab', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(navBtn('Messages'));
    expect(screen.getByText('DIRECT MESSAGES')).toBeInTheDocument();
  });

  it('navigates to Community tab', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(navBtn('Community'));
    expect(screen.getByText('New Community')).toBeInTheDocument();
  });

  it('navigates to Projects tab', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(navBtn('Projects'));
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('navigates to Profile tab', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(navBtn('Profile'));
    expect(screen.getByText('Save Profile')).toBeInTheDocument();
  });

  it('navigates to Settings tab', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(navBtn('Settings'));
    expect(screen.getByText('Save Settings')).toBeInTheDocument();
  });

  it('sign-out icon in sidebar calls signOut', async () => {
    mockSignOut.mockResolvedValue({});
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByTitle('Sign out'));
    expect(mockSignOut).toHaveBeenCalled();
    expect(await screen.findByText(/Connect everyone/i)).toBeInTheDocument();
  });
});

// ── TopBar search ─────────────────────────────────────────────────────────────
describe('TopBar – user search', () => {
  it('shows all users in dropdown when search input is focused', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByPlaceholderText(/Search people/i));
    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
  });

  it('shows matching user in dropdown when typing', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.type(screen.getByPlaceholderText(/Search people/i), 'Alex');
    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
  });

  it('shows "No results" for unmatched query', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.type(screen.getByPlaceholderText(/Search people/i), 'ZZZ');
    expect(await screen.findByText(/No results/i)).toBeInTheDocument();
  });

  it('navigates to Messages and pre-selects user chat when result is clicked', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.type(screen.getByPlaceholderText(/Search people/i), 'Jordan');
    // Wait for dropdown then click the result
    const results = await screen.findAllByText('Jordan Lee');
    await user.click(results[0]);
    // Jordan's message appears in the chat
    expect((await screen.findAllByText('Can we sync on the community feature?')).length).toBeGreaterThan(0);
  });

  it('searches are case-insensitive', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.type(screen.getByPlaceholderText(/Search people/i), 'alex');
    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
  });
});

// ── TopBar notifications ──────────────────────────────────────────────────────
describe('TopBar – notifications', () => {
  it('opens notifications panel when bell is clicked', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByTitle('Notifications'));
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
  });

  it('shows unread notifications with new badge', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByTitle('Notifications'));
    // The badge shows e.g. "2 new"
    expect(await screen.findByText(/\d+ new/i)).toBeInTheDocument();
  });

  it('"Mark all read" clears the unread badge', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByTitle('Notifications'));
    await user.click(await screen.findByText('Mark all read'));
    // badge with "new" text should disappear
    expect(screen.queryByText(/\d+ new/)).not.toBeInTheDocument();
  });
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
describe('Dashboard quick actions', () => {
  it('navigates to Messages via quick action', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByText('Send a message'));
    expect(screen.getByText('DIRECT MESSAGES')).toBeInTheDocument();
  });

  it('navigates to Community via quick action', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByText('Join a community'));
    expect(screen.getByText('New Community')).toBeInTheDocument();
  });

  it('navigates to Projects via quick action', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByText('Create a project'));
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('navigates to Profile via quick action', async () => {
    const user = renderMainApp();
    await screen.findByText('Dashboard');
    await user.click(screen.getByText('Complete your profile'));
    expect(screen.getByText('Save Profile')).toBeInTheDocument();
  });
});

// ── Messages ──────────────────────────────────────────────────────────────────
describe('MessagesScreen', () => {
  async function goToMessages(user) {
    await screen.findByText('Dashboard');
    await user.click(navBtn('Messages'));
  }

  it('shows empty state when no chat is selected', async () => {
    const user = renderMainApp();
    await goToMessages(user);
    expect(screen.getByText('Your Messages')).toBeInTheDocument();
  });

  it('opens a chat when a contact is clicked', async () => {
    const user = renderMainApp();
    await goToMessages(user);
    await user.click(screen.getByText('Alex Rivera'));
    // Message appears in both preview AND chat bubble — queryAllByText handles multiple
    expect(screen.queryAllByText("Hey! How's the Bridges build going?").length).toBeGreaterThan(0);
  });

  it('sends a message and clears the input', async () => {
    const user = renderMainApp();
    await goToMessages(user);
    await user.click(screen.getByText('Alex Rivera'));
    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello there!');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    // Message appears in both the preview and the chat bubble
    expect(screen.queryAllByText('Hello there!').length).toBeGreaterThan(0);
    expect(input.value).toBe('');
  });

  it('sends message on Enter key', async () => {
    const user = renderMainApp();
    await goToMessages(user);
    await user.click(screen.getByText('Alex Rivera'));
    await user.type(screen.getByPlaceholderText('Type a message...'), 'Enter message{Enter}');
    expect(screen.queryAllByText('Enter message').length).toBeGreaterThan(0);
  });

  it('Send button is disabled when input is empty', async () => {
    const user = renderMainApp();
    await goToMessages(user);
    await user.click(screen.getByText('Alex Rivera'));
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});

// ── Community ─────────────────────────────────────────────────────────────────
describe('CommunityScreen', () => {
  async function goToCommunity(user) {
    await screen.findByText('Dashboard');
    await user.click(navBtn('Community'));
  }

  it('shows existing communities', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    expect(screen.getByText('Founders Circle')).toBeInTheDocument();
    expect(screen.getByText('Design Lab')).toBeInTheDocument();
  });

  it('opens New Community form', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('New Community'));
    expect(screen.getByText('Create Community')).toBeInTheDocument();
  });

  it('Create button is disabled when name is empty', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('New Community'));
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('creates a new community and adds it to the list', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('New Community'));
    await user.type(screen.getByPlaceholderText('Community name'), 'Test Community');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('Test Community')).toBeInTheDocument();
  });

  it('Cancel dismisses the new community form', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('New Community'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Create Community')).not.toBeInTheDocument();
  });

  it('opens community detail when a card is clicked', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('Founders Circle'));
    expect(screen.getByText('142 members')).toBeInTheDocument();
    expect(screen.getByText('Board')).toBeInTheDocument();
  });

  it('Back button returns to community list', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('Founders Circle'));
    await user.click(screen.getByText('← Back'));
    expect(screen.getByText('Design Lab')).toBeInTheDocument();
  });

  it('switches to Chat tab and shows coming-soon state', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('Founders Circle'));
    await user.click(screen.getByText('Chat'));
    expect(screen.getByText('Chat coming soon')).toBeInTheDocument();
  });

  it('posts a message to the board', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('Founders Circle'));
    await user.type(screen.getByPlaceholderText('Share something with the community...'), 'Hello community!');
    await user.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.getByText('Hello community!')).toBeInTheDocument();
  });

  it('Post button is disabled when input is empty', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('Founders Circle'));
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });

  it('increments like count when ❤️ is clicked', async () => {
    const user = renderMainApp();
    await goToCommunity(user);
    await user.click(screen.getByText('Founders Circle'));
    await user.click(screen.getByText('❤️ 12'));
    expect(screen.getByText('❤️ 13')).toBeInTheDocument();
  });
});

// ── Projects ──────────────────────────────────────────────────────────────────
describe('ProjectsScreen', () => {
  async function goToProjects(user) {
    await screen.findByText('Dashboard');
    await user.click(navBtn('Projects'));
  }

  it('shows existing projects', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    expect(screen.getByText('Bridges App')).toBeInTheDocument();
  });

  it('opens New Project form', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('New Project'));
    expect(screen.getByPlaceholderText("What are you building?")).toBeInTheDocument();
  });

  it('Create button is disabled when name is empty', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('New Project'));
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('creates a new project and shows it in the list', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('New Project'));
    await user.type(screen.getByPlaceholderText("What are you building?"), 'My New Project');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('My New Project')).toBeInTheDocument();
  });

  it('Cancel dismisses the new project form', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('New Project'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByPlaceholderText("What are you building?")).not.toBeInTheDocument();
  });

  it('opens project detail when a card is clicked', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('Bridges App'));
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Wire up Supabase auth')).toBeInTheDocument();
  });

  it('Back button returns to project list', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('Bridges App'));
    await user.click(screen.getByText('← Back to Projects'));
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('adds a new task', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('Bridges App'));
    await user.type(screen.getByPlaceholderText('Add a task...'), 'Write tests');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('Add button is disabled when task input is empty', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('Bridges App'));
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('toggles a task done/undone and updates progress', async () => {
    const user = renderMainApp();
    await goToProjects(user);
    await user.click(screen.getByText('Bridges App'));
    // "Build community screen" is not done — click to complete it
    await user.click(screen.getByText('Build community screen').closest('div[style]'));
    // Both tasks done → 100%
    expect(await screen.findByText('100% complete')).toBeInTheDocument();
  });
});

// ── Profile ───────────────────────────────────────────────────────────────────
describe('ProfileScreen', () => {
  async function goToProfile(user) {
    await screen.findByText('Dashboard');
    await user.click(navBtn('Profile'));
  }

  it('pre-fills name from user data', async () => {
    const user = renderMainApp({ full_name: 'Jane Doe' });
    await goToProfile(user);
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
  });

  it('saves profile and shows success message', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null });
    const user = renderMainApp({ full_name: 'Jane Doe' });
    await goToProfile(user);
    await user.click(screen.getByText('Save Profile'));
    expect(await screen.findByText('✓ Profile saved successfully')).toBeInTheDocument();
  });

  it('selects a role and saves it', async () => {
    const user = renderMainApp();
    await goToProfile(user);
    await user.click(screen.getByText('Designer'));
    await user.click(screen.getByText('Save Profile'));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: 'Designer' }) })
      );
    });
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────
describe('SettingsScreen', () => {
  async function goToSettings(user) {
    await screen.findByText('Dashboard');
    await user.click(navBtn('Settings'));
  }

  it('shows saved confirmation after saving settings', async () => {
    const user = renderMainApp();
    await goToSettings(user);
    await user.click(screen.getByText('Save Settings'));
    expect(await screen.findByText('✓ Settings saved')).toBeInTheDocument();
  });

  it('email digest toggle changes value on click', async () => {
    const user = renderMainApp();
    await goToSettings(user);
    // Email digest starts off (false). Toggle it on, save, and verify the update.
    const toggles = document.querySelectorAll('[style*="border-radius: 13px"]');
    await user.click(toggles[1]); // email digest is the 2nd toggle
    await user.click(screen.getByText('Save Settings'));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settings: expect.objectContaining({ emailDigest: true }),
          }),
        })
      );
    });
  });

  it('shows sign out confirmation when Sign Out is clicked', async () => {
    const user = renderMainApp();
    await goToSettings(user);
    await user.click(screen.getByText('Sign Out'));
    expect(screen.getByText('Are you sure you want to sign out?')).toBeInTheDocument();
  });

  it('Cancel dismisses the sign out confirmation', async () => {
    const user = renderMainApp();
    await goToSettings(user);
    await user.click(screen.getByText('Sign Out'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Are you sure you want to sign out?')).not.toBeInTheDocument();
  });

  it('"Yes, sign out" confirms sign out and returns to landing', async () => {
    mockSignOut.mockResolvedValue({});
    const user = renderMainApp();
    await goToSettings(user);
    await user.click(screen.getByText('Sign Out'));
    await user.click(screen.getByRole('button', { name: /Yes, sign out/i }));
    expect(mockSignOut).toHaveBeenCalled();
    expect(await screen.findByText(/Connect everyone/i)).toBeInTheDocument();
  });

  it('loads saved notification preferences from user metadata', async () => {
    const user = renderMainApp({ settings: { notifications: false, emailDigest: true } });
    await goToSettings(user);
    // Save without changing anything — should write back the loaded values
    await user.click(screen.getByText('Save Settings'));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settings: expect.objectContaining({ notifications: false, emailDigest: true }),
          }),
        })
      );
    });
  });
});

// ── Error handling – new paths ────────────────────────────────────────────────
describe('ProfileScreen – save error handling', () => {
  async function goToProfile(user) {
    await screen.findByText('Dashboard');
    await user.click(screen.getByRole('button', { name: /Profile/ }));
  }

  it('shows error message when Supabase returns an error on save', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: { message: 'Update failed' } });
    const user = renderMainApp({ full_name: 'Jane' });
    await goToProfile(user);
    await user.click(screen.getByText('Save Profile'));
    expect(await screen.findByText('⚠ Update failed')).toBeInTheDocument();
    expect(screen.queryByText('✓ Profile saved successfully')).not.toBeInTheDocument();
  });

  it('shows error message on network failure', async () => {
    mockUpdateUser.mockRejectedValue(new Error('fetch failed'));
    const user = renderMainApp({ full_name: 'Jane' });
    await goToProfile(user);
    await user.click(screen.getByText('Save Profile'));
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });
});

describe('SettingsScreen – save error handling', () => {
  async function goToSettings(user) {
    await screen.findByText('Dashboard');
    await user.click(screen.getByRole('button', { name: /Settings/ }));
  }

  it('shows error message when Supabase returns an error on save', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: { message: 'Settings save failed' } });
    const user = renderMainApp();
    await goToSettings(user);
    await user.click(screen.getByText('Save Settings'));
    expect(await screen.findByText('⚠ Settings save failed')).toBeInTheDocument();
    expect(screen.queryByText('✓ Settings saved')).not.toBeInTheDocument();
  });

  it('shows error message on network failure', async () => {
    mockUpdateUser.mockRejectedValue(new Error('fetch failed'));
    const user = renderMainApp();
    await goToSettings(user);
    await user.click(screen.getByText('Save Settings'));
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });
});

describe('App – getSession network failure', () => {
  it('falls back to landing screen when getSession throws', async () => {
    mockGetSession.mockRejectedValue(new Error('Network error'));
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    render(<App />);
    expect(await screen.findByText(/Connect everyone/i)).toBeInTheDocument();
  });
});

describe('SignUpScreen – network error handling', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('shows network error when signUp throws', async () => {
    mockSignUp.mockRejectedValue(new Error('fetch failed'));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByText(/Get Started Free/i));
    await user.type(screen.getByPlaceholderText(/Your full name/i), 'Jane');
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'jane@example.com');
    await user.type(screen.getByPlaceholderText(/Create a strong password/i), 'SecureP1!');
    await user.click(screen.getByText(/I agree to the/i).closest('div'));
    await user.click(screen.getByText(/Create Account/i));
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });
});

describe('LoginScreen – network error handling', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('shows network error when signInWithPassword throws', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('fetch failed'));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'u@example.com');
    await user.type(screen.getByPlaceholderText(/Your password/i), 'Pass1234!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });
});
