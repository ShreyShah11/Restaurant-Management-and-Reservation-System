import TermsPage from "@/app/terms/page";
import { render, screen } from "@testing-library/react";

describe("Terms Page", () => {
  it("renders without crashing", () => {
    render(<TermsPage />);
    expect(true).toBe(true);
  });
});
