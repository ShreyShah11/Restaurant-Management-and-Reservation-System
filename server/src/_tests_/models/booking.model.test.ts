import mongoose from "mongoose";
import Booking from "@/models/booking";

describe("models/booking", () => {
  it("defines the booking schema with references, enums and defaults", () => {
    const schema = (Booking as mongoose.Model<any>).schema;

    const userID = schema.path("userID") as any;
    expect(userID.instance).toBe("ObjectId");
    expect(userID.options.ref).toBe("user");

    const restaurantID = schema.path("restaurantID") as any;
    expect(restaurantID.instance).toBe("ObjectId");
    expect(restaurantID.options.ref).toBe("restaurant");

    const bookingAt = schema.path("bookingAt") as any;
    expect(bookingAt.instance).toBe("Date");

    const numberOfGuests = schema.path("numberOfGuests") as any;
    expect(numberOfGuests.instance).toBe("Number");
    expect(numberOfGuests.options.min).toBe(1);

    const status = schema.path("status") as any;
    expect(status.options.enum).toContain("pending");
    expect(status.options.default).toBe("pending");

    const category = schema.path("category") as any;
    expect(category.options.enum).toEqual(["breakfast", "lunch", "dinner"]);

    const transferredToRestaurant = schema.path("transferredToRestaurant") as any;
    expect(transferredToRestaurant.instance).toBe("Boolean");
    expect(transferredToRestaurant.options.default).toBe(false);
  });
});
