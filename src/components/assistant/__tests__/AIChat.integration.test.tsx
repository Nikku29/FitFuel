
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import AIChat from '../AIChat';

// Mock the DeepSeek API
global.fetch = vi.fn();

// Mock useAnonymousSession hook
vi.mock('@/hooks/useAnonymousSession', () => ({
  useAnonymousSession: () => ({
    sessionToken: null,
    anonymousData: null,
    isLoading: false,
    createSession: vi.fn()
  })
}));

describe('AIChat Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockClear();
  });

  it('renders initial welcome message', () => {
    render(<AIChat />);
    
    expect(screen.getByText(/Hi there! I'm your fitness and nutrition assistant/)).toBeInTheDocument();
  });

  it('handles user message submission', async () => {
    // Mock successful API response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'Great question! Here\'s my fitness advice...'
          }
        }]
      })
    });

    render(<AIChat />);

    const textarea = screen.getByPlaceholderText(/Ask about workouts/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'What exercises should I do?' } });
    fireEvent.click(sendButton);

    // Check that user message appears
    expect(screen.getByText('What exercises should I do?')).toBeInTheDocument();

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/Great question! Here's my fitness advice/)).toBeInTheDocument();
    });

    // Verify API was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (fetch as any).mockRejectedValueOnce(new Error('API Error'));

    render(<AIChat />);

    const textarea = screen.getByPlaceholderText(/Ask about workouts/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText(/I'm sorry, I'm having trouble processing that request/)).toBeInTheDocument();
    });
  });

  it('disables send button when input is empty', () => {
    render(<AIChat />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    render(<AIChat />);

    const textarea = screen.getByPlaceholderText(/Ask about workouts/);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    expect(sendButton).not.toBeDisabled();
  });
});
