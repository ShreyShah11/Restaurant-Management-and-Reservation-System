import mongoose from "mongoose";
import Review from "@/models/review";

describe("models/review", () => {
  it("defines the review schema with references, defaults and enums", () => {
    const schema = (Review as mongoose.Model<any>).schema;

    const userID = schema.path("userID") as any;
    expect(userID.instance).toBe("ObjectId");
    expect(userID.options.ref).toBe("user");

    const restaurantID = schema.path("restaurantID") as any;
    expect(restaurantID.instance).toBe("ObjectId");
    expect(restaurantID.options.ref).toBe("restaurant");

    const content = schema.path("content") as any;
    expect(content.instance).toBe("String");
    expect(content.options.default).toBe("");

    const rate = schema.path("rate") as any;
    expect(rate.instance).toBe("Number");
    expect(rate.options.enum).toEqual([1, 2, 3, 4, 5]);
  });
});
