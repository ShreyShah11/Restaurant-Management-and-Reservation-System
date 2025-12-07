import { protectOwner } from "@/middlewares/protectOwner";

describe("middlewares/protectOwner", () => {
  it("sets role to owner and calls next", async () => {
    const req: any = {};
    const res: any = { locals: {} };
    const next = jest.fn();

    await protectOwner(req, res, next);

    expect(res.locals.role).toBe("owner");
    expect(next).toHaveBeenCalled();
  });
});
