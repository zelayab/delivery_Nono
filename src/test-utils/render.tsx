import { MantineProvider } from "@mantine/core";
import { render as testingLibraryRender } from "@testing-library/react";
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import React from 'react';

const createMockRouter = (router?: Partial<any>) => ({
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  ...router
});

export function render(ui: React.ReactNode, { router = createMockRouter() } = {}) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AppRouterContext.Provider value={router}>
        <MantineProvider>
          {children}
        </MantineProvider>
      </AppRouterContext.Provider>
    ),
  });
} 