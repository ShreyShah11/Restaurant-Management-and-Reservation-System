import mongoose from "mongoose";
import Item from "@/models/item";

describe("models/item", () => {
  it("defines the item schema with enums, defaults and required fields", () => {
    const schema = (Item as mongoose.Model<any>).schema;

    const restaurantID = schema.path("restaurantID") as any;
    expect(restaurantID.instance).toBe("ObjectId");
    expect(restaurantID.options.ref).toBe("restaurant");

    const dishName = schema.path("dishName") as any;
    expect(dishName.instance).toBe("String");
    expect(dishName.isRequired).toBeTruthy();

    const cuisine = schema.path("cuisine") as any;
    expect(Array.isArray(cuisine.options.enum)).toBe(true);
    expect(cuisine.options.enum).toContain("South Indian");

    const foodType = schema.path("foodType") as any;
    expect(foodType.options.enum).toEqual(["veg", "non-veg", "vegan", "egg"]);

    const ratingsSum = schema.path("ratingsSum") as any;
    expect(ratingsSum.options.default).toBe(0);

    const ratingsCount = schema.path("ratingsCount") as any;
    expect(ratingsCount.options.default).toBe(0);

    const isAvailable = schema.path("isAvailable") as any;
    expect(isAvailable.options.default).toBe(true);

    const category = schema.path("category") as any;
    expect(Array.isArray(category.options.enum)).toBe(true);
  });
});
