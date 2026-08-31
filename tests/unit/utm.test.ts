import { describe, it, expect } from "vitest";
import { parseUtmParams, hasAnyUtm, emptyUtm } from "@/server/analytics/utm";
import { classifyDevice } from "@/server/analytics/device";

describe("parseUtmParams", () => {
  it("извлекает все UTM-метки из query-строки", () => {
    const params = new URLSearchParams(
      "utm_source=yandex&utm_medium=cpc&utm_campaign=spring&utm_content=ad1&utm_term=152-fz",
    );
    const result = parseUtmParams(params);
    expect(result).toEqual({
      utmSource: "yandex",
      utmMedium: "cpc",
      utmCampaign: "spring",
      utmContent: "ad1",
      utmTerm: "152-fz",
    });
  });

  it("возвращает null для отсутствующих меток", () => {
    const result = parseUtmParams(new URLSearchParams(""));
    expect(result).toEqual(emptyUtm());
  });

  it("обрезает пробелы и слишком длинные значения", () => {
    const long = "a".repeat(500);
    const result = parseUtmParams(new URLSearchParams(`utm_source=${long}`));
    expect(result.utmSource?.length).toBeLessThanOrEqual(200);
  });

  it("работает с объектом searchParams (Next.js page props)", () => {
    const result = parseUtmParams({ utm_source: "google", utm_medium: ["cpc", "other"] });
    expect(result.utmSource).toBe("google");
    expect(result.utmMedium).toBe("cpc");
  });
});

describe("hasAnyUtm", () => {
  it("false для пустого набора", () => {
    expect(hasAnyUtm(emptyUtm())).toBe(false);
  });

  it("true если есть хотя бы одна метка", () => {
    expect(hasAnyUtm({ ...emptyUtm(), utmSource: "vk" })).toBe(true);
  });
});

describe("classifyDevice", () => {
  it("определяет mobile по User-Agent iPhone", () => {
    expect(
      classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"),
    ).toBe("mobile");
  });

  it("определяет desktop по обычному Chrome UA", () => {
    expect(
      classifyDevice(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
      ),
    ).toBe("desktop");
  });

  it("определяет tablet по iPad UA", () => {
    expect(
      classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15"),
    ).toBe("tablet");
  });

  it("unknown для отсутствующего User-Agent", () => {
    expect(classifyDevice(null)).toBe("unknown");
  });
});
