import { protectCustomer } from "@/middlewares/protectCustomer";

describe("middlewares/protectCustomer", () => {
  it("sets role to customer and calls next", async () => {
    const req: any = {};
    const res: any = { locals: {} };
    const next = jest.fn();

    await protectCustomer(req, res, next);

    expect(res.locals.role).toBe("customer");
    expect(next).toHaveBeenCalled();
  });
});
