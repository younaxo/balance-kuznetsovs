/**
 * Разбор UTM-меток из query-строки. Чистая функция без побочных
 * эффектов — используется и на сервере, и в юнит-тестах.
 */

export interface UtmSnapshot {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

const EMPTY_UTM: UtmSnapshot = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
};

const MAX_UTM_LENGTH = 200;

function sanitize(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, MAX_UTM_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
}

export function parseUtmParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): UtmSnapshot {
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  return {
    utmSource: sanitize(get("utm_source")),
    utmMedium: sanitize(get("utm_medium")),
    utmCampaign: sanitize(get("utm_campaign")),
    utmContent: sanitize(get("utm_content")),
    utmTerm: sanitize(get("utm_term")),
  };
}

export function hasAnyUtm(snapshot: UtmSnapshot): boolean {
  return Boolean(
    snapshot.utmSource ||
    snapshot.utmMedium ||
    snapshot.utmCampaign ||
    snapshot.utmContent ||
    snapshot.utmTerm,
  );
}

export function emptyUtm(): UtmSnapshot {
  return { ...EMPTY_UTM };
}
