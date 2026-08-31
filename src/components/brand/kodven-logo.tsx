import fs from "node:fs";
import path from "node:path";

const ASSET_RELATIVE_PATH = "public/brand/kodven-logo.png";

/**
 * Логотип KODVEN STUDIO в подвале. Файл не был доступен Claude Code
 * как прикреплённый файл (только показан в чате), поэтому — тот же
 * приём, что и с основным лого компании: слот на диске, который
 * подхватывается автоматически, как только туда положат реальный файл.
 * До этого рендерится аккуратная текстовая версия — не перерисованная
 * "по памяти" копия чужого лого.
 */
export function KodvenLogo({ className }: { className?: string }) {
  const exists = fs.existsSync(path.join(process.cwd(), ASSET_RELATIVE_PATH));

  if (exists) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- путь определяется в рантайме, статический импорт невозможен
      <img src="/brand/kodven-logo.png" alt="KODVEN STUDIO" className={className} height={20} />
    );
  }

  return <span className={className}>KODVEN STUDIO</span>;
}
