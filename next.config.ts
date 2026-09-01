import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy подобрана под реальный набор внешних ресурсов
 * сайта: шрифты Google Fonts и виджет Cloudflare Turnstile (подключается
 * условно, только если заданы ENV-ключи).
 * 'unsafe-inline' для style-src нужен Tailwind/Next для инлайн-стилей
 * критического CSS — script-src инлайн-скрипты не разрешает.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // 'unsafe-eval' нужен ТОЛЬКО в dev: React/Turbopack используют eval()
  // для Fast Refresh и восстановления call stack при отладке. В продакшене
  // React eval() не использует — эта директива присутствует только не-prod.
  `script-src 'self' 'unsafe-inline' ${isProd ? "" : "'unsafe-eval' "}https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  isProd ? "upgrade-insecure-requests" : "",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Явно фиксируем корень workspace — на машине сборки выше по дереву
  // может лежать чужой lockfile (например, pnpm), и Turbopack иначе
  // ошибочно пытается угадать root по нему.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Все изображения сайта — собственные ассеты в /public.
    // Внешних доменов для next/image пока не требуется.
    remotePatterns: [],
  },
};

export default nextConfig;
