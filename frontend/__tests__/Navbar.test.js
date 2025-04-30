import React from "react";
import { render, screen } from "@testing-library/react";
import Navbar from "../src/components/navbar";

describe("Navbar", () => {
  it("renders Logout button", () => {
    render(<Navbar />);
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });
});