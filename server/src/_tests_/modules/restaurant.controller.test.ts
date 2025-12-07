import { Request, Response } from "express";

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    GOOGLE_GEMINI_API_KEY: "test-key",
    SENDER_EMAIL: "test@example.com",
    isProduction: false,
  },
}));

jest.mock("@/models/user", () => {
  const mockUser = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockUser,
  };
});

jest.mock("@/models/restaurant", () => {
  const mockRestaurant: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const RestaurantCtor = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  } as any;

  Object.assign(RestaurantCtor, mockRestaurant);

  return {
    __esModule: true,
    default: RestaurantCtor,
  };
});

jest.mock("@/models/item", () => {
  const mockItem: any = {
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const ItemCtor = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  } as any;

  Object.assign(ItemCtor, mockItem);

  return {
    __esModule: true,
    default: ItemCtor,
  };
});

jest.mock("@/utils/logger", () => {
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockLogger,
  };
});

const { default: controller } = require("@/modules/restaurant/controller");
const { default: Restaurant } = require("@/models/restaurant");
const { default: Item } = require("@/models/item");
const { default: User } = require("@/models/user");
const { default: logger } = require("@/utils/logger");

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

describe("modules/restaurant/controller.addRestaurant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    // invalid type to trigger Zod validation failure
    const req: any = { body: { restaurantName: 123 } };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.addRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Validation failed" })
    );
  });

  it("returns 404 when user not found", async () => {
    const req: any = {
      body: {
        restaurantName: "Test Restaurant",
        address: {
          line1: "Line 1",
          line2: "Line 2",
          zip: "12345",
          city: "City",
          state: "State",
          country: "India",
        },
        ownerName: "Owner Name",
        phoneNumber: "1234567890",
        restaurantEmail: "test@example.com",
        socialMedia: {
          facebook: "https://facebook.com/test",
          twitter: "https://twitter.com/test",
          instagram: "https://instagram.com/test",
        },
        openingHours: {
          weekend: { start: "09:00", end: "18:00" },
          weekday: { start: "09:00", end: "18:00" },
        },
        bannerURL: "https://example.com/banner.png",
        bankAccount: { name: "Account Name", number: "123456", IFSC: "IFSC123" },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.addRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 when restaurant already exists", async () => {
    const req: any = {
      body: {
        restaurantName: "Test Restaurant",
        address: {
          line1: "Line 1",
          line2: "Line 2",
          zip: "12345",
          city: "City",
          state: "State",
          country: "India",
        },
        ownerName: "Owner Name",
        phoneNumber: "1234567890",
        restaurantEmail: "test@example.com",
        socialMedia: {
          facebook: "https://facebook.com/test",
          twitter: "https://twitter.com/test",
          instagram: "https://instagram.com/test",
        },
        openingHours: {
          weekend: { start: "09:00", end: "18:00" },
          weekday: { start: "09:00", end: "18:00" },
        },
        bannerURL: "https://example.com/banner.png",
        bankAccount: { name: "Account Name", number: "123456", IFSC: "IFSC123" },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({ _id: "u1" });
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });

    await controller.addRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creates restaurant successfully", async () => {
    const req: any = {
      body: {
        restaurantName: "Test Restaurant",
        address: {
          line1: "Line 1",
          line2: "Line 2",
          zip: "12345",
          city: "City",
          state: "State",
          country: "India",
        },
        ownerName: "Owner Name",
        phoneNumber: "1234567890",
        restaurantEmail: "test@example.com",
        socialMedia: {
          facebook: "https://facebook.com/test",
          twitter: "https://twitter.com/test",
          instagram: "https://instagram.com/test",
        },
        openingHours: {
          weekend: { start: "09:00", end: "18:00" },
          weekday: { start: "09:00", end: "18:00" },
        },
        bannerURL: "https://example.com/banner.png",
        bankAccount: { name: "Account Name", number: "123456", IFSC: "IFSC123" },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({ _id: "u1" });
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.addRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "restaurant added successfully" })
    );
  });
});

describe("modules/restaurant/controller.updateRestaurant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    // invalid type to trigger validation error in updateRestaurant schema
    const req: any = { body: { restaurantName: 123 } };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.updateRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when restaurant not found", async () => {
    const req: any = { body: { restaurantName: "New" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.updateRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates restaurant successfully", async () => {
    const req: any = {
      body: {
        restaurantName: "New Name",
        address: {
          line1: "New L1",
        },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    const restaurantDoc: any = {
      restaurantName: "Old",
      ownerName: "Owner",
      phoneNumber: "123",
      restaurantEmail: "test@example.com",
      logoURL: "logo",
      bannerURL: "banner",
      about: "about",
      since: 2000,
      slogan: "slogan",
      address: {
        line1: "L1",
        line2: "L2",
        line3: "",
        zip: "12345",
        city: "C",
        state: "S",
        country: "IN",
      },
      socialMedia: {},
      openingHours: { weekend: {}, weekday: {} },
      bankAccount: {},
      save: jest.fn(),
    };

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(restaurantDoc);

    await controller.updateRestaurant(req as Request, res as Response);

    expect(restaurantDoc.restaurantName).toBe("New Name");
    expect(restaurantDoc.address.line1).toBe("New L1");
    expect(restaurantDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates optional basic and address fields only when provided", async () => {
    const restaurantDoc: any = {
      restaurantName: "Old Name",
      ownerName: "Old Owner",
      phoneNumber: "1111111111",
      restaurantEmail: "old@example.com",
      websiteURL: "https://old.example.com",
      logoURL: "https://old.example.com/logo.png",
      bannerURL: "https://old.example.com/banner.png",
      about: "old about text",
      since: 1990,
      slogan: "old slogan",
      address: {
        line1: "L1",
        line2: "L2",
        line3: "L3",
        zip: "12345",
        city: "Old City",
        state: "Old State",
        country: "Old Country",
      },
      socialMedia: {},
      openingHours: { weekend: {}, weekday: {} },
      bankAccount: {},
      save: jest.fn(),
    };

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(restaurantDoc);

    const req: any = {
      body: {
        restaurantName: "New Name",
        ownerName: "New Owner",
        phoneNumber: "2222222222",
        restaurantEmail: "new@example.com",
        websiteURL: "https://new.example.com",
        logoURL: "https://new.example.com/logo.png",
        bannerURL: "https://new.example.com/banner.png",
        about: "new about text long enough",
        since: 2020,
        slogan: "new slogan",
        address: {
          line1: "New L1",
          line2: "New L2",
          zip: "54321",
          city: "New City",
          state: "New State",
          country: "New Country",
        },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.updateRestaurant(req as Request, res as Response);

    expect(restaurantDoc.restaurantName).toBe("New Name");
    expect(restaurantDoc.ownerName).toBe("New Owner");
    expect(restaurantDoc.phoneNumber).toBe("2222222222");
    expect(restaurantDoc.restaurantEmail).toBe("new@example.com");
    expect(restaurantDoc.websiteURL).toBe("https://new.example.com");
    expect(restaurantDoc.logoURL).toBe("https://new.example.com/logo.png");
    expect(restaurantDoc.bannerURL).toBe("https://new.example.com/banner.png");
    expect(restaurantDoc.about).toBe("new about text long enough");
    expect(restaurantDoc.since).toBe(2020);
    expect(restaurantDoc.slogan).toBe("new slogan");

    expect(restaurantDoc.address.line1).toBe("New L1");
    expect(restaurantDoc.address.line2).toBe("New L2");
    expect(restaurantDoc.address.zip).toBe("54321");
    expect(restaurantDoc.address.city).toBe("New City");
    expect(restaurantDoc.address.state).toBe("New State");
    expect(restaurantDoc.address.country).toBe("New Country");

    expect(restaurantDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not overwrite fields when optional properties are omitted", async () => {
    const restaurantDoc: any = {
      restaurantName: "Old Name",
      ownerName: "Old Owner",
      phoneNumber: "1111111111",
      restaurantEmail: "old@example.com",
      websiteURL: "https://old.example.com",
      logoURL: "https://old.example.com/logo.png",
      bannerURL: "https://old.example.com/banner.png",
      about: "old about text",
      since: 1990,
      slogan: "old slogan",
      address: {
        line1: "L1",
        line2: "L2",
        line3: "L3",
        zip: "12345",
        city: "Old City",
        state: "Old State",
        country: "Old Country",
      },
      socialMedia: {},
      openingHours: { weekend: {}, weekday: {} },
      bankAccount: {},
      save: jest.fn(),
    };

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(restaurantDoc);

    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.updateRestaurant(req as Request, res as Response);

    expect(restaurantDoc.restaurantName).toBe("Old Name");
    expect(restaurantDoc.ownerName).toBe("Old Owner");
    expect(restaurantDoc.phoneNumber).toBe("1111111111");
    expect(restaurantDoc.restaurantEmail).toBe("old@example.com");
    expect(restaurantDoc.websiteURL).toBe("https://old.example.com");
    expect(restaurantDoc.logoURL).toBe("https://old.example.com/logo.png");
    expect(restaurantDoc.bannerURL).toBe("https://old.example.com/banner.png");
    expect(restaurantDoc.about).toBe("old about text");
    expect(restaurantDoc.since).toBe(1990);
    expect(restaurantDoc.slogan).toBe("old slogan");

    expect(restaurantDoc.address.line1).toBe("L1");
    expect(restaurantDoc.address.line2).toBe("L2");
    expect(restaurantDoc.address.zip).toBe("12345");
    expect(restaurantDoc.address.city).toBe("Old City");
    expect(restaurantDoc.address.state).toBe("Old State");
    expect(restaurantDoc.address.country).toBe("Old Country");

    expect(restaurantDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates address line3 when non-empty and clears when empty", async () => {
    const baseDoc: any = {
      restaurantName: "Old",
      ownerName: "Owner",
      phoneNumber: "123",
      restaurantEmail: "test@example.com",
      logoURL: "logo",
      bannerURL: "banner",
      about: "about about about",
      since: 2000,
      slogan: "old slogan",
      address: {
        line1: "L1",
        line2: "L2",
        line3: "Old L3",
        zip: "12345",
        city: "C",
        state: "S",
        country: "IN",
      },
      socialMedia: {},
      openingHours: { weekend: {}, weekday: {} },
      bankAccount: {},
      save: jest.fn(),
    };

    // First call: set line3 to a new non-empty value
    const doc1 = { ...baseDoc, address: { ...baseDoc.address } };
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(doc1);

    let req: any = {
      body: {
        address: {
          line3: "New L3",
        },
      },
    };
    let res = buildRes();
    res.locals.userID = "u1";

    await controller.updateRestaurant(req as Request, res as Response);

    expect(doc1.address.line3).toBe("New L3");
    expect(doc1.save).toHaveBeenCalled();

    // Second call: clear line3 by sending empty string
    const doc2 = { ...baseDoc, address: { ...baseDoc.address, line3: "Existing" }, save: jest.fn() };
    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(doc2);

    req = {
      body: {
        address: {
          line3: "",
        },
      },
    };
    res = buildRes();
    res.locals.userID = "u1";

    await controller.updateRestaurant(req as Request, res as Response);

    expect(doc2.address.line3).toBeUndefined();
    expect(doc2.save).toHaveBeenCalled();
  });

  it("updates socialMedia, openingHours and bankAccount fields", async () => {
    const restaurantDoc: any = {
      restaurantName: "Old",
      ownerName: "Owner",
      phoneNumber: "123",
      restaurantEmail: "test@example.com",
      logoURL: "logo",
      bannerURL: "banner",
      about: "about about about",
      since: 2000,
      slogan: "old slogan",
      address: {
        line1: "L1",
        line2: "L2",
        line3: "",
        zip: "12345",
        city: "C",
        state: "S",
        country: "IN",
      },
      socialMedia: {
        facebook: "https://facebook.com/old",
        twitter: "https://twitter.com/old",
        instagram: "https://instagram.com/old",
      },
      openingHours: {
        weekend: { start: new Date("2020-01-01T09:00:00Z"), end: new Date("2020-01-01T18:00:00Z") },
        weekday: { start: new Date("2020-01-02T09:00:00Z"), end: new Date("2020-01-02T18:00:00Z") },
      },
      bankAccount: {
        name: "Old Name",
        number: "0000",
        IFSC: "OLDIFSC",
      },
      save: jest.fn(),
    };

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(restaurantDoc);

    const req: any = {
      body: {
        socialMedia: {
          facebook: "https://facebook.com/new",
          twitter: "https://twitter.com/new",
          instagram: "https://instagram.com/new",
        },
        openingHours: {
          weekend: { start: "2025-01-01T09:00:00Z", end: "2025-01-01T18:00:00Z" },
          weekday: { start: "2025-01-02T09:00:00Z", end: "2025-01-02T18:00:00Z" },
        },
        bankAccount: {
          name: "New Name",
          number: "12345678",
          IFSC: "NEWIFSC",
        },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.updateRestaurant(req as Request, res as Response);

    expect(restaurantDoc.socialMedia.facebook).toBe("https://facebook.com/new");
    expect(restaurantDoc.socialMedia.twitter).toBe("https://twitter.com/new");
    expect(restaurantDoc.socialMedia.instagram).toBe("https://instagram.com/new");

    expect(restaurantDoc.openingHours.weekend.start).toBeInstanceOf(Date);
    expect(restaurantDoc.openingHours.weekend.end).toBeInstanceOf(Date);
    expect(restaurantDoc.openingHours.weekday.start).toBeInstanceOf(Date);
    expect(restaurantDoc.openingHours.weekday.end).toBeInstanceOf(Date);

    expect(restaurantDoc.bankAccount.name).toBe("New Name");
    expect(restaurantDoc.bankAccount.number).toBe("12345678");
    expect(restaurantDoc.bankAccount.IFSC).toBe("NEWIFSC");

    expect(restaurantDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("modules/restaurant/controller.getRestaurantByOwner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u"; // invalid length

    await controller.getRestaurantByOwner(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when restaurant not found for owner", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "123456789012345678901234"; // 24 chars

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.getRestaurantByOwner(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns restaurant when found", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "123456789012345678901234";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });

    await controller.getRestaurantByOwner(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, found: true })
    );
  });
});

describe("modules/restaurant/controller.addItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.addItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when restaurant not found for owner", async () => {
    const req: any = {
      body: {
        dishName: "Dish",
        cuisine: "South Indian",
        foodType: "veg",
        price: 100,
        imageURL: "https://example.com",
        category: "Main Course",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.addItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("creates item successfully", async () => {
    const req: any = {
      body: {
        dishName: "Dish",
        cuisine: "South Indian",
        foodType: "veg",
        price: 100,
        imageURL: "https://example.com",
        category: "Main Course",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });

    await controller.addItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Item added successfully" })
    );
  });
});

describe("modules/restaurant/controller.deleteItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.deleteItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when restaurant not found", async () => {
    const req: any = { body: { itemID: "i1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.deleteItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 404 when item not found", async () => {
    const req: any = { body: { itemID: "i1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Item.findOneAndDelete as jest.Mock).mockResolvedValueOnce(null);

    await controller.deleteItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deletes item successfully", async () => {
    const req: any = { body: { itemID: "i1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Item.findOneAndDelete as jest.Mock).mockResolvedValueOnce({ _id: "i1" });

    await controller.deleteItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("modules/restaurant/controller.updateItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.updateItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when restaurant not found", async () => {
    const req: any = { body: { itemID: "i1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce(null);

    await controller.updateItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 404 when item not found", async () => {
    const req: any = { body: { itemID: "i1", dishName: "New" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Item.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);

    await controller.updateItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates item successfully", async () => {
    const req: any = { body: { itemID: "i1", dishName: "New" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Item.findOneAndUpdate as jest.Mock).mockResolvedValueOnce({ _id: "i1" });

    await controller.updateItem(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("modules/restaurant/controller.getItemsByRestaurant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: {} };
    const res = buildRes();

    await controller.getItemsByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 with empty list when no items", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();

    (Item.find as jest.Mock).mockResolvedValueOnce([]);

    await controller.getItemsByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "No items found", items: [] })
    );
  });

  it("returns items when found", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();

    (Item.find as jest.Mock).mockResolvedValueOnce([{ _id: "i1" }]);

    await controller.getItemsByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Items retrieved successfully" })
    );
  });
});

describe("modules/restaurant/controller.getNearByRestaurant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when validation fails", async () => {
    const req: any = { body: { maxDistance: "invalid" } };
    const res = buildRes();
    res.locals.userID = "u1";

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when user not found", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce(null);

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns nearby restaurants when found", async () => {
    const req: any = { body: { maxDistance: 1000 } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      location: { type: "Point", coordinates: [0, 0] },
      cityName: "City",
    });

    (User.find as jest.Mock).mockResolvedValueOnce([
      { _id: "owner1", cityName: "City", role: "owner" },
    ]);

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "r1",
      ratingsSum: 10,
      ratingsCount: 2,
    });

    (Item.find as jest.Mock).mockResolvedValueOnce([
      { cuisine: "South Indian" },
      { cuisine: "Chinese" },
    ]);

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, found: true })
    );
  });

  it("returns 200 with found=false when no nearby restaurants", async () => {
    const req: any = { body: { maxDistance: 1000 } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      location: { type: "Point", coordinates: [0, 0] },
      cityName: "City",
    });

    // No nearby owner users
    (User.find as jest.Mock).mockResolvedValueOnce([]);

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, found: false, restaurants: [] })
    );
  });

  it("sorts nearby restaurants by rating when in the same city", async () => {
    const req: any = { body: { maxDistance: 1000 } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      location: { type: "Point", coordinates: [0, 0] },
      cityName: "City",
    });

    // Two owner users in the same city
    (User.find as jest.Mock).mockResolvedValueOnce([
      { _id: "ownerHigh", cityName: "City", role: "owner" },
      { _id: "ownerLow", cityName: "City", role: "owner" },
    ]);

    // First restaurant has higher average rating
    (Restaurant.findOne as jest.Mock)
      .mockResolvedValueOnce({ _id: "rHigh", ratingsSum: 18, ratingsCount: 3 })
      .mockResolvedValueOnce({ _id: "rLow", ratingsSum: 5, ratingsCount: 5 });

    // Items for both restaurants (cuisine sets are irrelevant to sorting)
    (Item.find as jest.Mock)
      .mockResolvedValueOnce([{ cuisine: "South Indian" }])
      .mockResolvedValueOnce([{ cuisine: "Chinese" }]);

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.found).toBe(true);
    // Highest-rated restaurant should come first
    expect(payload.restaurants[0][0]._id).toBe("rHigh");
  });

  it("handles nearby restaurants with no items (null items list)", async () => {
    const req: any = { body: { maxDistance: 1000 } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      location: { type: "Point", coordinates: [0, 0] },
      cityName: "City",
    });

    (User.find as jest.Mock).mockResolvedValueOnce([
      { _id: "owner1", cityName: "City", role: "owner" },
    ]);

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({
      _id: "r1",
      ratingsSum: 0,
      ratingsCount: 0,
    });

    // Simulate Item.find returning null so the !allItem branch is taken
    (Item.find as jest.Mock).mockResolvedValueOnce(null);

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.restaurants).toHaveLength(1);
  });

  it("handles sorting when restaurants are in different cities", async () => {
    const req: any = { body: { maxDistance: 1000 } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockResolvedValueOnce({
      _id: "u1",
      location: { type: "Point", coordinates: [0, 0] },
      cityName: "CityA",
    });

    (User.find as jest.Mock).mockResolvedValueOnce([
      { _id: "ownerA", cityName: "CityA", role: "owner" },
      { _id: "ownerB", cityName: "CityB", role: "owner" },
    ]);

    (Restaurant.findOne as jest.Mock)
      .mockResolvedValueOnce({ _id: "rA", ratingsSum: 10, ratingsCount: 2 })
      .mockResolvedValueOnce({ _id: "rB", ratingsSum: 5, ratingsCount: 1 });

    (Item.find as jest.Mock)
      .mockResolvedValueOnce([{ cuisine: "South Indian" }])
      .mockResolvedValueOnce([{ cuisine: "Chinese" }]);

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.restaurants).toHaveLength(2);
  });
});

// Additional error-path coverage tests for restaurant controller
describe("modules/restaurant/controller error paths", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("addRestaurant returns 500 on unexpected error", async () => {
    const req: any = {
      body: {
        restaurantName: "Test Restaurant",
        address: {
          line1: "Line 1",
          line2: "Line 2",
          zip: "12345",
          city: "City",
          state: "State",
          country: "India",
        },
        ownerName: "Owner Name",
        phoneNumber: "1234567890",
        restaurantEmail: "test@example.com",
        socialMedia: {
          facebook: "https://facebook.com/test",
          twitter: "https://twitter.com/test",
          instagram: "https://instagram.com/test",
        },
        openingHours: {
          weekend: { start: "09:00", end: "18:00" },
          weekday: { start: "09:00", end: "18:00" },
        },
        bannerURL: "https://example.com/banner.png",
        bankAccount: { name: "Account Name", number: "123456", IFSC: "IFSC123" },
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    // Cause an exception inside the try block
    (User.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.addRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("updateRestaurant returns 500 on unexpected error", async () => {
    const req: any = {
      body: {
        restaurantName: "New Name",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.updateRestaurant(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("addItem returns 500 on unexpected error", async () => {
    const req: any = {
      body: {
        dishName: "Dish",
        cuisine: "South Indian",
        foodType: "veg",
        price: 100,
        imageURL: "https://example.com",
        category: "Main Course",
      },
    };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.addItem(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deleteItem returns 500 on unexpected error", async () => {
    const req: any = { body: { itemID: "i1" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Item.findOneAndDelete as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.deleteItem(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("updateItem returns 500 on unexpected error", async () => {
    const req: any = { body: { itemID: "i1", dishName: "New" } };
    const res = buildRes();
    res.locals.userID = "u1";

    (Restaurant.findOne as jest.Mock).mockResolvedValueOnce({ _id: "r1" });
    (Item.findOneAndUpdate as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.updateItem(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("getItemsByRestaurant returns 500 on unexpected error", async () => {
    const req: any = { body: { restaurantID: "r1" } };
    const res = buildRes();

    (Item.find as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.getItemsByRestaurant(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("getNearByRestaurant returns 500 on unexpected error", async () => {
    const req: any = { body: { maxDistance: 1000 } };
    const res = buildRes();
    res.locals.userID = "u1";

    (User.findById as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.getNearByRestaurant(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("getRestaurantByOwner returns 500 on unexpected error", async () => {
    const req: any = { body: {} };
    const res = buildRes();
    res.locals.userID = "123456789012345678901234";

    (Restaurant.findOne as jest.Mock).mockRejectedValueOnce(new Error("db-fail"));

    await controller.getRestaurantByOwner(req as Request, res as Response);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
