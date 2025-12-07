import mongoose from "mongoose";
import User from "@/models/user";

describe("models/user", () => {
  it("defines the user schema with expected fields and constraints", () => {
    const schema = (User as mongoose.Model<any>).schema;

    const firstName = schema.path("firstName") as mongoose.SchemaTypeOptions<any> & any;
    expect(firstName.instance).toBe("String");
    expect(firstName.isRequired).toBeTruthy();

    const lastName = schema.path("lastName") as any;
    expect(lastName.instance).toBe("String");
    expect(lastName.isRequired).toBeTruthy();

    const email = schema.path("email") as any;
    expect(email.instance).toBe("String");
    expect(email.options.unique).toBe(true);
    expect(email.options.lowercase).toBe(true);
    expect(email.options.immutable).toBe(true);

    const role = schema.path("role") as any;
    expect(role.options.enum).toEqual(["owner", "customer"]);

    const cityName = schema.path("cityName") as any;
    expect(cityName.isRequired).toBeTruthy();

    const locationType = schema.path("location.type") as any;
    expect(locationType.options.enum).toEqual(["Point"]);

    const locationCoordinates = schema.path("location.coordinates") as any;
    expect(locationCoordinates.instance).toBe("Array");
  });

  it("defines a 2dsphere index on location", () => {
    const schema = (User as mongoose.Model<any>).schema;
    const indexes = schema.indexes();

    const hasLocationIndex = indexes.some(([fields]) => {
      return Object.prototype.hasOwnProperty.call(fields, "location");
    });

    expect(hasLocationIndex).toBe(true);
  });
});
