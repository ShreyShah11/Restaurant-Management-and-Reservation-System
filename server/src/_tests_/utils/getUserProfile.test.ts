import { getUserProfile } from "@/utils/getUserProfile";

describe("utils/getUserProfile", () => {
  it("returns limited user profile fields", () => {
    const user: any = {
      _id: "id-1",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      cityName: "City",
      createdAt: new Date(),
    };

    const result = getUserProfile(user);

    expect(result).toEqual({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cityName: user.cityName,
    });
  });
});
