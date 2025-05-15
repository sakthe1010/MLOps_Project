import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage from "../src/app/profile/page";

describe("ProfilePage", () => {
  it("shows test history heading", () => {
    render(<ProfilePage />);
    expect(screen.getByText(/your test history/i)).toBeInTheDocument();
  });
});