import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  jsonb,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/**
 * Доменная схема базы данных «БАЛАНС КУЗНЕЦОВЫ».
 *
 * Таблицы сгруппированы по доменам: auth, applications, content,
 * analytics/attribution, reviews. Все первичные ключи — uuid,
 * все временные метки — timestamptz.
 */

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------

export const adminRoleEnum = pgEnum("admin_role", ["owner", "editor"]);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: adminRoleEnum("role").notNull().default("editor"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("admin_users_email_unique").on(sql`lower(${table.email})`)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    // id хранит SHA-256 хеш opaque-токена сессии, а не сам токен —
    // компрометация БД не даёт возможности угнать активные сессии.
    id: text("id").primaryKey(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
  },
  (table) => [index("admin_sessions_admin_user_id_idx").on(table.adminUserId)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Идентификатор источника — хеш(IP) либо email в нижнем регистре.
    identifier: text("identifier").notNull(),
    succeeded: boolean("succeeded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("login_attempts_identifier_created_idx").on(table.identifier, table.createdAt)],
);

// ---------------------------------------------------------------------------
// APPLICATIONS (заявки)
// ---------------------------------------------------------------------------

export const applicationStatusEnum = pgEnum("application_status", [
  "new",
  "in_progress",
  "completed",
  "archived",
]);

export const applicationSourceEnum = pgEnum("application_source", ["form", "quiz"]);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Контактные данные — минимум один способ связи гарантируется
    // на уровне Zod-валидации при создании заявки.
    name: varchar("name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    telegram: varchar("telegram", { length: 100 }),
    email: varchar("email", { length: 255 }),

    serviceSlug: varchar("service_slug", { length: 100 }),
    message: text("message"),

    // Ответы квиза (если заявка пришла из квиза), произвольная структура.
    quizAnswers: jsonb("quiz_answers").$type<Record<string, unknown>>(),

    source: applicationSourceEnum("source").notNull().default("form"),
    status: applicationStatusEnum("status").notNull().default("new"),

    consentGiven: boolean("consent_given").notNull(),
    consentGivenAt: timestamp("consent_given_at", { withTimezone: true }),

    // Служебные поля модерации/защиты от спама.
    honeypotTriggered: boolean("honeypot_triggered").notNull().default(false),
    turnstileVerified: boolean("turnstile_verified"),
    ipHash: text("ip_hash"),

    // Результат доставки уведомлений — не блокирует сохранение заявки.
    telegramNotifiedAt: timestamp("telegram_notified_at", { withTimezone: true }),
    emailNotifiedAt: timestamp("email_notified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("applications_status_idx").on(table.status),
    index("applications_created_at_idx").on(table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// CONTENT (услуги, прайс, контакты, контентные блоки)
// ---------------------------------------------------------------------------

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull(),
    order: integer("order").notNull().default(0),
    title: varchar("title", { length: 300 }).notNull(),
    summary: text("summary").notNull(),
    ctaLabel: varchar("cta_label", { length: 100 }).notNull().default("Заказать услугу"),
    illustration: varchar("illustration", { length: 50 }).notNull().default("contract"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("services_slug_unique").on(table.slug)],
);

export const priceItems = pgTable("price_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceSlug: varchar("service_slug", { length: 100 }),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  // Цена в копейках; NULL = «цена по запросу» (пока прайс не наполнен).
  priceFromKopecks: integer("price_from_kopecks"),
  unit: varchar("unit", { length: 100 }),
  order: integer("order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactSettings = pgTable("contact_settings", {
  // Синглтон-таблица: единственная строка с id = 'default'.
  id: varchar("id", { length: 20 }).primaryKey().default("default"),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 255 }),
  telegram: varchar("telegram", { length: 150 }),
  maxMessenger: varchar("max_messenger", { length: 150 }),
  address: text("address"),
  workingHours: varchar("working_hours", { length: 255 }),

  // Реквизиты оператора ПДн для юридических страниц.
  operatorFullName: text("operator_full_name"),
  operatorInn: varchar("operator_inn", { length: 20 }),
  operatorOgrn: varchar("operator_ogrn", { length: 20 }),
  operatorAddress: text("operator_address"),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 150 }).notNull(),
    title: text("title"),
    // Простой безопасный формат: обычный текст/markdown-подмножество,
    // не сырой HTML — рендерится без dangerouslySetInnerHTML.
    body: text("body"),
    isPublished: boolean("is_published").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("content_blocks_key_unique").on(table.key)],
);

// ---------------------------------------------------------------------------
// REVIEWS (отзывы)
// ---------------------------------------------------------------------------

export const reviewSourceEnum = pgEnum("review_source", ["avito", "manual"]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: varchar("author_name", { length: 200 }).notNull(),
  text: text("text").notNull(),
  rating: integer("rating"),
  source: reviewSourceEnum("source").notNull().default("manual"),
  sourceUrl: text("source_url"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  isPublished: boolean("is_published").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// ANALYTICS & ATTRIBUTION
// ---------------------------------------------------------------------------

export const deviceCategoryEnum = pgEnum("device_category", [
  "desktop",
  "mobile",
  "tablet",
  "unknown",
]);

export const analyticsSessions = pgTable("analytics_sessions", {
  // Анонимный идентификатор сессии (случайный, хранится в cookie).
  id: uuid("id").primaryKey().defaultRandom(),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  deviceCategory: deviceCategoryEnum("device_category").notNull().default("unknown"),

  landingPath: text("landing_path"),
  referrer: text("referrer"),

  // Первое касание (first-touch) — фиксируется один раз при создании сессии.
  utmSource: varchar("utm_source", { length: 200 }),
  utmMedium: varchar("utm_medium", { length: 200 }),
  utmCampaign: varchar("utm_campaign", { length: 200 }),
  utmContent: varchar("utm_content", { length: 200 }),
  utmTerm: varchar("utm_term", { length: 200 }),
});

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "page_view",
  "nav_click",
  "footer_click",
  "cta_click",
  "service_cta_click",
  "external_link_click",
  "telegram_click",
  "max_click",
  "email_click",
  "phone_click",
  "quiz_open",
  "quiz_step",
  "quiz_complete",
  "application_open",
  "application_submit",
  "tracked_redirect",
]);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => analyticsSessions.id, { onDelete: "cascade" }),
    eventType: analyticsEventTypeEnum("event_type").notNull(),
    pathname: text("pathname").notNull(),
    sourceElement: varchar("source_element", { length: 200 }),
    destination: text("destination"),
    isConversion: boolean("is_conversion").notNull().default(false),
    applicationId: uuid("application_id").references(() => applications.id, {
      onDelete: "set null",
    }),
    // Последнее касание (last-touch) на момент события — снимок UTM
    // из текущего запроса, может отличаться от first-touch сессии.
    utmSource: varchar("utm_source", { length: 200 }),
    utmMedium: varchar("utm_medium", { length: 200 }),
    utmCampaign: varchar("utm_campaign", { length: 200 }),
    utmContent: varchar("utm_content", { length: 200 }),
    utmTerm: varchar("utm_term", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_session_id_idx").on(table.sessionId),
    index("analytics_events_event_type_idx").on(table.eventType),
    index("analytics_events_created_at_idx").on(table.createdAt),
  ],
);

// Аллоулист для безопасных внешних редиректов /go/:slug — единственный
// разрешённый способ перейти на внешний ресурс через трекер.
export const trackedDestinations = pgTable("tracked_destinations", {
  slug: varchar("slug", { length: 100 }).primaryKey(),
  label: varchar("label", { length: 200 }).notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Привязка заявки к атрибуции (first-touch сессии и last-touch на
// момент отправки формы) для отчёта «откуда пришёл клиент».
export const attributions = pgTable(
  "attributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => analyticsSessions.id, {
      onDelete: "set null",
    }),

    firstTouchUtmSource: varchar("first_touch_utm_source", { length: 200 }),
    firstTouchUtmMedium: varchar("first_touch_utm_medium", { length: 200 }),
    firstTouchUtmCampaign: varchar("first_touch_utm_campaign", { length: 200 }),
    firstTouchLandingPath: text("first_touch_landing_path"),

    lastTouchUtmSource: varchar("last_touch_utm_source", { length: 200 }),
    lastTouchUtmMedium: varchar("last_touch_utm_medium", { length: 200 }),
    lastTouchUtmCampaign: varchar("last_touch_utm_campaign", { length: 200 }),
    lastTouchPath: text("last_touch_path"),

    ctaSource: varchar("cta_source", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("attributions_application_id_unique").on(table.applicationId)],
);

export const consentCategoryEnum = pgEnum("consent_category", ["necessary", "analytics"]);

export const consentRecords = pgTable("consent_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => analyticsSessions.id, {
    onDelete: "set null",
  }),
  analyticsAccepted: boolean("analytics_accepted").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// RELATIONS
// ---------------------------------------------------------------------------

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(adminSessions),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [adminSessions.adminUserId],
    references: [adminUsers.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  attribution: one(attributions, {
    fields: [applications.id],
    references: [attributions.applicationId],
  }),
}));

export const analyticsSessionsRelations = relations(analyticsSessions, ({ many }) => ({
  events: many(analyticsEvents),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  session: one(analyticsSessions, {
    fields: [analyticsEvents.sessionId],
    references: [analyticsSessions.id],
  }),
}));
