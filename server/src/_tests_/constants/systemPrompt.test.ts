import { CUSTOMER_SYSTEM_PROMPT, RESTAURANT_SYSTEM_PROMPT } from "@/constants/systemPrompt";

describe("constants/systemPrompt", () => {
  it("customer prompt contains key guidance", () => {
    expect(CUSTOMER_SYSTEM_PROMPT).toContain("good general fit");
    expect(CUSTOMER_SYSTEM_PROMPT.length).toBeGreaterThan(50);
  });

  it("restaurant prompt contains improvement guidance", () => {
    expect(RESTAURANT_SYSTEM_PROMPT).toContain("improve customer traffic");
    expect(RESTAURANT_SYSTEM_PROMPT.length).toBeGreaterThan(50);
  });
});
