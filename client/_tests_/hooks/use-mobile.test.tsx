import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  function setViewport(width: number, withListener = false) {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    let storedListener: (() => void) | null = null;
    (window as any).matchMedia = (query: string) => {
      const mql = {
        matches: /max-width:\s*(\d+)/.test(query) && width <= parseInt(query.match(/max-width:\s*(\d+)/)![1], 10),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_: string, cb: () => void) => {
          if (withListener) storedListener = cb;
        },
        removeEventListener: () => {
          storedListener = null;
        },
        dispatchEvent: () => false,
      };
      (mql as any).__listener = storedListener;
      return mql as any;
    };
    return () => storedListener;
  }

  test('returns true when width < 768', () => {
    setViewport(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test('returns false when width >= 768 and on remount after width change becomes true', () => {
    setViewport(1000);
    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    setViewport(600);
    unmount();
    const again = renderHook(() => useIsMobile());
    expect(again.result.current).toBe(true);
    again.unmount();
  });

  test('updates state when media query change event fires', () => {
    const getListener = setViewport(900, true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    const listener = getListener();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 });
    act(() => listener && listener());
    expect(result.current).toBe(true);
  });
});
