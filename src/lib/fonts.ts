import { Manrope, PT_Serif } from "next/font/google";

/**
 * Пара шрифтов бренда: Manrope (гротеск — UI, навигация, текст) +
 * PT Serif (редакционный serif — крупные заголовки услуг, цитаты).
 * Оба шрифта имеют полную поддержку кириллицы. Начертаний — минимум
 * необходимых, чтобы не раздувать загрузку.
 */

export const manrope = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const ptSerif = PT_Serif({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
  display: "swap",
});
