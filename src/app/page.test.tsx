import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './page';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('Home', () => {
  it('renders without crashing', () => {
    render(<Home />, { wrapper: createWrapper() });
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });
});
