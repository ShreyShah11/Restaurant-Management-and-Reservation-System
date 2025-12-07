import { packUserData } from "@/utils/packUserData";

describe("utils/packUserData", () => {
  it("packs user data with formatted createdAt", () => {
    const user: any = {
      _id: "user-id",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "customer",
      createdAt: new Date("2024-01-01T10:00:00Z"),
    };

    const result = packUserData(user);

    expect(result._id).toBe(user._id);
    expect(result.firstName).toBe(user.firstName);
    expect(result.lastName).toBe(user.lastName);
    expect(result.email).toBe(user.email);
    expect(result.role).toBe(user.role);
    expect(typeof result.createdAt).toBe("string");
    expect(result.createdAt.length).toBeGreaterThan(0);
  });
});
