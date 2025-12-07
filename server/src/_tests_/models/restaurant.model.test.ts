import mongoose from "mongoose";
import Restaurant from "@/models/restaurant";

describe("models/restaurant", () => {
  it("defines the main restaurant schema with required fields", () => {
    const schema = (Restaurant as mongoose.Model<any>).schema;

    const restaurantName = schema.path("restaurantName") as any;
    expect(restaurantName.instance).toBe("String");
    expect(restaurantName.isRequired).toBeTruthy();

    const owner = schema.path("owner") as any;
    expect(owner.instance).toBe("ObjectId");
    expect(owner.options.ref).toBe("user");

    const restaurantEmail = schema.path("restaurantEmail") as any;
    expect(restaurantEmail.instance).toBe("String");

    const address = schema.path("address") as any;
    expect(address.schema.path("line1").isRequired).toBeTruthy();
    expect(address.schema.path("line2").isRequired).toBeTruthy();

    const socialMedia = schema.path("socialMedia") as any;
    expect(socialMedia.schema.path("facebook").instance).toBe("String");

    const openingHours = schema.path("openingHours") as any;
    expect(openingHours.schema.path("weekend")).toBeDefined();
    expect(openingHours.schema.path("weekday")).toBeDefined();

    const status = schema.path("status") as any;
    expect(status.schema.path("isActive").options.default).toBe(true);
    expect(status.schema.path("isVerified").options.default).toBe(false);

    const bankAccount = schema.path("bankAccount") as any;
    expect(bankAccount.schema.path("name").isRequired).toBeTruthy();
    expect(bankAccount.schema.path("number").isRequired).toBeTruthy();
    expect(bankAccount.schema.path("IFSC").isRequired).toBeTruthy();
  });

  it("has default factories for nested schemas", () => {
    const schema = (Restaurant as mongoose.Model<any>).schema;

    const address = schema.path("address") as any;
    expect(typeof address.options.default).toBe("function");

    const socialMedia = schema.path("socialMedia") as any;
    expect(typeof socialMedia.options.default).toBe("function");

    const status = schema.path("status") as any;
    expect(typeof status.options.default).toBe("function");
  });

  it("applies defaults when creating a restaurant document", () => {
    const RestaurantModel = Restaurant as unknown as mongoose.Model<any>;

    const doc = new RestaurantModel({
      restaurantName: "Test",
      address: {
        line1: "Line1",
        line2: "Line2",
        zip: "12345",
        city: "C",
        state: "S",
        country: "IN",
      },
      ownerName: "Owner",
      phoneNumber: "1234567890",
      restaurantEmail: "test@example.com",
      owner: new mongoose.Types.ObjectId(),
      openingHours: {
        weekend: { start: new Date(), end: new Date() },
        weekday: { start: new Date(), end: new Date() },
      },
      bankAccount: {
        name: "Name",
        number: "0000",
        IFSC: "IFSC0",
      },
      bannerURL: "https://example.com/banner.png",
    });

    expect(doc.status.isActive).toBe(true);
    expect(doc.status.isVerified).toBe(false);
    expect(doc.status.temporarilyClosed).toBe(false);
    expect(doc.socialMedia.facebook).toBe("");
    expect(doc.address.line3).toBe("");
    expect(doc.ratingsSum).toBe(0);
    expect(doc.ratingsCount).toBe(0);
  });
});
