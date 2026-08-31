import { describe, it, expect } from "vitest";
import { isSafeExternalUrl, isValidSlug } from "@/server/security/redirect";

describe("isSafeExternalUrl", () => {
  it("принимает обычный https URL", () => {
    expect(isSafeExternalUrl("https://t.me/username")).toBe(true);
  });

  it("принимает http URL", () => {
    expect(isSafeExternalUrl("http://example.com")).toBe(true);
  });

  it("отклоняет javascript: URL", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
  });

  it("отклоняет data: URL", () => {
    expect(isSafeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("отклоняет vbscript: URL", () => {
    expect(isSafeExternalUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("отклоняет file: URL", () => {
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false);
  });

  it("отклоняет protocol-relative URL", () => {
    expect(isSafeExternalUrl("//evil.example/phish")).toBe(false);
  });

  it("отклоняет некорректный/битый URL", () => {
    expect(isSafeExternalUrl("not a url at all")).toBe(false);
    expect(isSafeExternalUrl("")).toBe(false);
  });

  it("отклоняет URL с пробелом перед схемой (обход через trim-игры)", () => {
    expect(isSafeExternalUrl("   javascript:alert(1)")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("принимает валидный slug", () => {
    expect(isValidSlug("telegram-channel")).toBe(true);
  });

  it("отклоняет slug с недопустимыми символами", () => {
    expect(isValidSlug("../etc/passwd")).toBe(false);
    expect(isValidSlug("has space")).toBe(false);
    expect(isValidSlug("UPPERCASE")).toBe(false);
  });
});
