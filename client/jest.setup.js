import '@testing-library/jest-dom';

if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false; },
    };
  };
}

if (typeof window.ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;
}

if (typeof window.Notification === 'undefined') {
  window.Notification = function () {};
  window.Notification.requestPermission = () => Promise.resolve('granted');
  window.Notification.permission = 'granted';
}

jest.mock('next/image', () => {
  const React = require('react');
  return function NextImage({ fill, ...rest }) {
    return React.createElement('img', { ...rest });
  };
});

jest.mock('next/link', () => {
  const React = require('react');
  return ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children);
});

jest.mock('next/navigation', () => {
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  };
});

jest.mock('next-themes', () => {
  return {
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  };
});

jest.mock('sonner', () => {
  const fn = jest.fn;
  const toast = fn();
  toast.info = fn();
  toast.success = fn();
  toast.warning = fn();
  toast.error = fn();
  toast.loading = fn();
  toast.dismiss = fn();
  return { toast };
});