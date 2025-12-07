import controller from "@/modules/health/controller";

const buildRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("modules/health/controller", () => {
  it("returns 200 with health message and time", () => {
    const req: any = {};
    const res = buildRes();

    controller.index(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.message).toBe("API is healthy");
    expect(typeof payload.time).toBe("string");
  });
});
