import "server-only";
import { and, count, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { analyticsEvents, analyticsSessions } from "@/server/db/schema";

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsSummary {
  sessions: number;
  pageViews: number;
  eventsByType: { eventType: string; count: number }[];
  applications: number;
  quizStarts: number;
  quizCompletions: number;
  topLandingPaths: { path: string; count: number }[];
  topUtmSources: { source: string; count: number }[];
  topUtmCampaigns: { campaign: string; count: number }[];
}

/**
 * Сводка для /admin/analytics. При отсутствии данных за период все
 * массивы просто пустые — дашборд рендерит honest empty state, без
 * "нарисованных" графиков.
 */
export async function getAnalyticsSummary(range: AnalyticsDateRange): Promise<AnalyticsSummary> {
  const sessionWhere = and(
    gte(analyticsSessions.firstSeenAt, range.from),
    lte(analyticsSessions.firstSeenAt, range.to),
  );
  const eventWhere = and(
    gte(analyticsEvents.createdAt, range.from),
    lte(analyticsEvents.createdAt, range.to),
  );

  const [sessionsCount] = await db
    .select({ n: count() })
    .from(analyticsSessions)
    .where(sessionWhere);

  const eventsByType = await db
    .select({ eventType: analyticsEvents.eventType, n: count() })
    .from(analyticsEvents)
    .where(eventWhere)
    .groupBy(analyticsEvents.eventType)
    .orderBy(desc(count()));

  const findCount = (type: string) => eventsByType.find((e) => e.eventType === type)?.n ?? 0;

  const topLandingPaths = await db
    .select({ path: analyticsSessions.landingPath, n: count() })
    .from(analyticsSessions)
    .where(and(sessionWhere, sql`${analyticsSessions.landingPath} is not null`))
    .groupBy(analyticsSessions.landingPath)
    .orderBy(desc(count()))
    .limit(10);

  const topUtmSources = await db
    .select({ source: analyticsSessions.utmSource, n: count() })
    .from(analyticsSessions)
    .where(and(sessionWhere, sql`${analyticsSessions.utmSource} is not null`))
    .groupBy(analyticsSessions.utmSource)
    .orderBy(desc(count()))
    .limit(10);

  const topUtmCampaigns = await db
    .select({ campaign: analyticsSessions.utmCampaign, n: count() })
    .from(analyticsSessions)
    .where(and(sessionWhere, sql`${analyticsSessions.utmCampaign} is not null`))
    .groupBy(analyticsSessions.utmCampaign)
    .orderBy(desc(count()))
    .limit(10);

  return {
    sessions: Number(sessionsCount?.n ?? 0),
    pageViews: Number(findCount("page_view")),
    eventsByType: eventsByType.map((e) => ({ eventType: e.eventType, count: Number(e.n) })),
    applications: Number(findCount("application_submit")),
    quizStarts: Number(findCount("quiz_open")),
    quizCompletions: Number(findCount("quiz_complete")),
    topLandingPaths: topLandingPaths.map((r) => ({ path: r.path ?? "—", count: Number(r.n) })),
    topUtmSources: topUtmSources.map((r) => ({ source: r.source ?? "—", count: Number(r.n) })),
    topUtmCampaigns: topUtmCampaigns.map((r) => ({
      campaign: r.campaign ?? "—",
      count: Number(r.n),
    })),
  };
}
