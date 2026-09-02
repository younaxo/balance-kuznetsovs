import fs from "node:fs";
import path from "node:path";
import { Reveal } from "@/components/motion/reveal";
import { TeamRepository } from "@/server/team/repository";

/**
 * Тёмная секция «Команда» — карточки специалистов: фото, ФИО и короткое
 * описание экспертизы ("эксперт по...") — без выдуманных должностей/
 * стажа/регалий, только то, что реально заполнено в /admin/team. Если
 * команда ещё не заполнена, секция вообще не рендерится (а не
 * показывает пустые/выдуманные плейсхолдеры).
 */
export async function AboutSection() {
  const members = await TeamRepository.listPublished();
  if (members.length === 0) return null;

  return (
    <section className="border-graphite-border bg-graphite text-graphite-foreground border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">Наша команда</h2>
        </Reveal>

        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {members.map((member, index) => (
            <Reveal key={member.id} delay={index * 0.08} className="w-72">
              <TeamMemberCard
                fullName={member.fullName}
                bio={member.bio}
                photoFilename={member.photoFilename}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamMemberCard({
  fullName,
  bio,
  photoFilename,
}: {
  fullName: string;
  bio: string | null;
  photoFilename: string | null;
}) {
  const hasPhoto = photoFilename ? photoFileExists(photoFilename) : false;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- путь определяется в рантайме по данным из БД, статический импорт невозможен
        <img
          src={`/team/${photoFilename}`}
          alt={fullName}
          // Фиксированное соотношение сторон + object-cover: фото разного
          // исходного размера/пропорций всё равно ложатся в одинаковую
          // рамку, ничего не искажая.
          className="aspect-3/4 w-full rounded-lg object-cover"
        />
      ) : (
        <span className="bg-graphite-foreground/10 text-graphite-foreground/60 flex aspect-3/4 w-full items-center justify-center rounded-lg text-4xl font-medium">
          {initials(fullName)}
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium whitespace-nowrap">{fullName}</p>
        {bio && <p className="text-graphite-foreground/60 text-[13px] leading-relaxed">{bio}</p>}
      </div>
    </div>
  );
}

// Второй рубеж защиты от path traversal (../../..) — на случай, если в
// БД когда-нибудь окажется "грязное" значение в обход валидации записи
// (см. admin/team/actions.ts). Имя файла из этой таблицы всегда должно
// быть "плоским" — без слэшей и точек-переходов.
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

function photoFileExists(filename: string): boolean {
  if (!SAFE_FILENAME.test(filename)) return false;
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
