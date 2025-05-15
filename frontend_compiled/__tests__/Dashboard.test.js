import React                from "react";
import { render, screen }   from "@testing-library/react";
import DashboardPage        from "../src/app/dashboard/page";

beforeEach(() => {
  localStorage.setItem("token", "test-token");
});

afterEach(() => localStorage.clear());

describe("DashboardPage", () => {
  it("renders dashboard title and buttons", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: /welcome to your dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/start a new test/i)).toBeInTheDocument();
  });
});
