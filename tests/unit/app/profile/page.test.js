/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Mock next-auth getServerSession only (we'll also stub the auth route below)
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: jest.fn(),
}));

// Stub the auth route module so importing the page doesn't invoke NextAuth
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

// Mock the MongoDB helper
jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

// Mock child components used by the profile page
jest.mock('@/components/ProfileEditor/AboutEditor', () => {
  return function MockAbout({ initialBio }) {
    return <div data-testid="about-editor">{initialBio}</div>;
  };
});
jest.mock('@/components/ProfileEditor/NameEditor', () => {
  return function MockName({ initialName }) {
    return <div data-testid="name-editor">{initialName}</div>;
  };
});
jest.mock('@/components/ProfileEditor/AvatarEditor', () => {
  return function MockAvatar({ initialAvatar }) {
    return <div data-testid="avatar-editor">{initialAvatar}</div>;
  };
});
jest.mock('@/components/ProfileEditor/LocationEditor', () => {
  return function MockLocation({ initialLocation }) {
    return <div data-testid="location-editor">{initialLocation}</div>;
  };
});

const { getServerSession } = require('next-auth');
const { getDb } = require('@/lib/mongodb');

// Delayed import of the page under test so mocks above are applied
async function loadProfilePage() {
  const mod = await import('@/app/profile/page');
  return mod.default;
}

describe('ProfilePage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows not signed in message when there is no session', async () => {
    getServerSession.mockResolvedValue(null);

    const ProfilePage = await loadProfilePage();
    const page = await ProfilePage();
    const { container } = render(page);

    expect(container).toHaveTextContent('Not signed in');
    expect(container).toHaveTextContent('Please sign in to view your profile.');
  });

  it('shows empty profile when user not found in DB', async () => {
    getServerSession.mockResolvedValue({ user: { email: 'no@user.test' } });

    // mock DB returning no user
    getDb.mockResolvedValue({
      collection: () => ({ findOne: async () => null }),
    });

    const ProfilePage = await loadProfilePage();
    const page = await ProfilePage();
    const { container } = render(page);

    expect(container).toHaveTextContent('Profile');
    expect(container).toHaveTextContent('No profile found for your account.');
  });

  it('renders profile editors with user data', async () => {
    const fakeUser = {
      email: 'tester@example.com',
      displayName: 'Tester',
      name: 'Tester Name',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Hello world',
      location: 'Fremont, CA',
      createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
    };

    getServerSession.mockResolvedValue({ user: { email: fakeUser.email } });

    getDb.mockResolvedValue({
      collection: () => ({ findOne: async () => fakeUser }),
    });

    const ProfilePage = await loadProfilePage();
    const page = await ProfilePage();
    const { container } = render(page);

    // child placeholders
    expect(screen.getByTestId('avatar-editor')).toBeInTheDocument();
    expect(screen.getByTestId('name-editor')).toBeInTheDocument();
    expect(screen.getByTestId('about-editor')).toBeInTheDocument();
    expect(screen.getByTestId('location-editor')).toBeInTheDocument();

    // initial values rendered by mocks
    expect(screen.getByTestId('avatar-editor')).toHaveTextContent(
      fakeUser.avatarUrl,
    );
    expect(screen.getByTestId('name-editor')).toHaveTextContent(
      fakeUser.displayName,
    );
    expect(screen.getByTestId('about-editor')).toHaveTextContent(fakeUser.bio);
    expect(screen.getByTestId('location-editor')).toHaveTextContent(
      fakeUser.location,
    );

    // email and member since
    expect(container).toHaveTextContent(fakeUser.email);
    expect(container).toHaveTextContent('Member since');
  });
});
