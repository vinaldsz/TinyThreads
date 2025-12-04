/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Components under test
import NameEditor from '@/components/ProfileEditor/NameEditor';
import LocationEditor from '@/components/ProfileEditor/LocationEditor';
import AboutEditor from '@/components/ProfileEditor/AboutEditor';
import AvatarEditor from '@/components/ProfileEditor/AvatarEditor';

// jest.setup.js already sets global.fetch = jest.fn(); ensure clean state
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('ProfileEditor components', () => {
  describe('NameEditor', () => {
    it('renders initial name and saves updated name via API', async () => {
      render(<NameEditor initialName="Alice" />);

      expect(screen.getByText('Alice')).toBeInTheDocument();

      // open editor
      fireEvent.click(screen.getByLabelText('Edit display name'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Alice B' } });

      // mock successful PATCH
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/me',
          expect.objectContaining({ method: 'PATCH' }),
        );
      });

      // after save, editing should close and new name displayed
      await waitFor(() =>
        expect(screen.getByText('Alice B')).toBeInTheDocument(),
      );
    });

    it('shows error message when API returns non-ok', async () => {
      render(<NameEditor initialName="Bob" />);
      fireEvent.click(screen.getByLabelText('Edit display name'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Bob C' } });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Bad stuff' }),
      });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());

      await waitFor(() =>
        expect(screen.getByText(/Bad stuff|Save failed/i)).toBeInTheDocument(),
      );
    });
  });

  describe('LocationEditor', () => {
    it('renders location and updates via API', async () => {
      render(<LocationEditor initialLocation="Oakland, CA" />);

      expect(screen.getByText('Oakland, CA')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Edit location'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Fremont, CA' } });

      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/me',
          expect.any(Object),
        ),
      );
      await waitFor(() =>
        expect(screen.getByText('Fremont, CA')).toBeInTheDocument(),
      );
    });
  });

  describe('AboutEditor (bio)', () => {
    it('renders initial bio and saves via API', async () => {
      render(<AboutEditor initialBio="Hello bio" />);

      expect(screen.getByText('Hello bio')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Edit about'));

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Updated bio' } });

      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() =>
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/me',
          expect.any(Object),
        ),
      );
      await waitFor(() =>
        expect(screen.queryByText('Updated bio')).toBeInTheDocument(),
      );
    });
  });

  describe('AvatarEditor', () => {
    beforeAll(() => {
      // Mock URL.createObjectURL/revokeObjectURL for JSDOM
      global.URL.createObjectURL = jest.fn((file) => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterAll(() => {
      delete global.URL.createObjectURL;
      delete global.URL.revokeObjectURL;
    });

    it('uploads selected file and updates avatar on success', async () => {
      render(<AvatarEditor initialAvatar="" />);

      const file = new File(['(binary)'], 'avatar.png', { type: 'image/png' });

      // Mock successful upload response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ publicUrl: 'https://example.com/avatar.png' }),
      });

      const input = screen.getByLabelText('Change avatar')
        ? null
        : document.querySelector('input[type="file"]');
      // Use DOM input node directly
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeTruthy();

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      await waitFor(() =>
        expect(
          screen.getByAltText('avatar') || screen.getByRole('img'),
        ).toBeTruthy(),
      );

      // The component prefers server publicUrl
      await waitFor(() => {
        const img = document.querySelector('img[alt="avatar"]');
        expect(img).toBeTruthy();
        expect(img.src).toContain('https://example.com/avatar.png');
      });
    });
  });
});
