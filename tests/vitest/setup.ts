import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { setAuthorCsrfToken } from "../../src/api";

afterEach(() => {
  cleanup();
  setAuthorCsrfToken(null);
});
