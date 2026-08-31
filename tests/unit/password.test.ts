import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("password hashing (Argon2id)", () => {
  it("хеш не совпадает с исходным паролем", async () => {
    const hash = await hashPassword("SuperSecret123!");
    expect(hash).not.toBe("SuperSecret123!");
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it("верный пароль проходит проверку", async () => {
    const hash = await hashPassword("SuperSecret123!");
    expect(await verifyPassword(hash, "SuperSecret123!")).toBe(true);
  });

  it("неверный пароль не проходит проверку", async () => {
    const hash = await hashPassword("SuperSecret123!");
    expect(await verifyPassword(hash, "WrongPassword")).toBe(false);
  });

  it("одинаковые пароли дают разные хеши (случайная соль)", async () => {
    const hash1 = await hashPassword("SamePassword1!");
    const hash2 = await hashPassword("SamePassword1!");
    expect(hash1).not.toBe(hash2);
  });

  it("не падает на некорректном/повреждённом хеше — просто возвращает false", async () => {
    await expect(verifyPassword("not-a-real-hash", "anything")).resolves.toBe(false);
  });
});
