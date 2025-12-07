import { getProf } from "@/utils/getProf";

describe("utils/getProf", () => {
  it("returns limited profile fields", () => {
    const user: any = {
      _id: "id-2",
      firstName: "Bob",
      lastName: "Brown",
      email: "bob@example.com",
      cityName: "Town",
      createdAt: new Date(),
    };

    const result = getProf(user);

    expect(result).toEqual({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cityName: user.cityName,
    });
  });
});
