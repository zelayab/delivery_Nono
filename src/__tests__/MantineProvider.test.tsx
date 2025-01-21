// src/__tests__/MantineProvider.test.tsx
import { render } from '@/test-utils/render';
import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";

test("MantineProvider renders without errors", () => {
  render(<div>Test Content</div>);
  expect(screen.getByText("Test Content")).toBeInTheDocument();
});
