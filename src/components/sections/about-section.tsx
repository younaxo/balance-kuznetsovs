import fs from "node:fs";
import path from "node:path";
import { Reveal } from "@/components/motion/reveal";
import { TeamRepository } from "@/server/team/repository";

/**
 * Тёмная секция «Команда» — карточки специалистов. По решению владельца
 * карточка содержит только ФИО и (опционально) фото — БЕЗ выдуманных
 * должностей/стажа/регалий. Данные полностью управляются из /admin/team;
 * если команда ещё не заполнена, секция вообще не рендерится (а не
 * показывает пустые/выдуманные плейсхолдеры).
 */
export async function AboutSection() {
  const members = await TeamRepository.listPublished();
  if (members.length === 0) return null;

  return (
    <section className="border-graphite-border bg-graphite text-graphite-foreground border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <p className="text-graphite-foreground/50 text-xs font-medium tracking-[0.2em] uppercase">
            Кто с вами работает
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">Наша команда</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => (
            <Reveal key={member.id} delay={index * 0.08}>
              <TeamMemberCard fullName={member.fullName} photoFilename={member.photoFilename} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamMemberCard({
  fullName,
  photoFilename,
}: {
  fullName: string;
  photoFilename: string | null;
}) {
  const hasPhoto = photoFilename ? photoFileExists(photoFilename) : false;

  return (
    <div className="border-graphite-foreground/15 flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- путь определяется в рантайме по данным из БД, статический импорт невозможен
        <img
          src={`/team/${photoFilename}`}
          alt={fullName}
          className="size-28 rounded-full object-cover"
        />
      ) : (
        <span className="bg-graphite-foreground/10 text-graphite-foreground/60 flex size-28 items-center justify-center rounded-full text-2xl font-medium">
          {initials(fullName)}
        </span>
      )}
      <p className="text-[15px] font-medium">{fullName}</p>
    </div>
  );
}

function photoFileExists(filename: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public/team", filename));
  } catch {
    return false;
  }
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
