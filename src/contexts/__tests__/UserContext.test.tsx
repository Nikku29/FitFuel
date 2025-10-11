
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';
import React from 'react';

// Mock Firebase auth
vi.mock('@/integrations/firebase/config', () => ({
  auth: {
    onAuthStateChanged: vi.fn()
  }
}));

vi.mock('@/integrations/firebase/auth', () => ({
  logOut: vi.fn()
}));

describe('UserContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('provides initial user data', () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.userData).toBeDefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('updates user data correctly', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    await act(async () => {
      await result.current.updateUserData({ name: 'Test User', age: 25 });
    });

    expect(result.current.userData.name).toBe('Test User');
    expect(result.current.userData.age).toBe(25);
  });

  it('clears user data on logout', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    // First set some data
    await act(async () => {
      await result.current.updateUserData({ name: 'Test User' });
    });

    expect(result.current.userData.name).toBe('Test User');

    // Then clear it
    await act(async () => {
      await result.current.clearUserData();
    });

    expect(result.current.userData.name).toBe('');
    expect(result.current.user).toBeNull();
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useUser must be used within a UserProvider');
  });
});
