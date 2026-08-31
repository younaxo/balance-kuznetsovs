import type { SVGProps } from "react";

/**
 * Собственная библиотека монохромных line-иллюстраций бренда.
 * Один визуальный язык на весь сайт: stroke="currentColor", тонкая
 * линия (1.25–1.5), никаких заливок фотографиями/эмодзи/стоковых
 * иконок. Пунктирная сетка точек — фирменный декоративный приём,
 * подсмотренный на референсе карточек услуг.
 */

type IllustrationProps = SVGProps<SVGSVGElement>;

const DotGrid = ({ x, y }: { x: number; y: number }) => (
  <g fill="currentColor" opacity={0.35}>
    {[0, 1, 2].map((row) =>
      [0, 1, 2].map((col) => (
        <circle key={`${row}-${col}`} cx={x + col * 7} cy={y + row * 7} r={1} />
      )),
    )}
  </g>
);

export function PersonalDataIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 140" fill="none" strokeWidth={1.4} {...props}>
      <DotGrid x={10} y={14} />
      {/* стопка документов */}
      <rect x={22} y={46} width={62} height={80} rx={3} stroke="currentColor" />
      <rect
        x={34}
        y={36}
        width={62}
        height={80}
        rx={3}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <line x1={46} y1={56} x2={82} y2={56} stroke="currentColor" opacity={0.7} />
      <line x1={46} y1={68} x2={82} y2={68} stroke="currentColor" opacity={0.7} />
      <line x1={46} y1={80} x2={72} y2={80} stroke="currentColor" opacity={0.7} />
      {/* щит с замком */}
      <path
        d="M118 30 L146 40 V70 C146 92 133 106 118 114 C103 106 90 92 90 70 V40 Z"
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <rect x={107} y={68} width={22} height={17} rx={2} stroke="currentColor" />
      <path d="M111 68 V60 a7 7 0 0 1 14 0 v8" stroke="currentColor" />
    </svg>
  );
}

export function TrademarkIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 140" fill="none" strokeWidth={1.4} {...props}>
      <DotGrid x={112} y={16} />
      {/* сертификат */}
      <rect
        x={16}
        y={26}
        width={80}
        height={100}
        rx={3}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <line x1={30} y1={44} x2={82} y2={44} stroke="currentColor" opacity={0.7} />
      <line x1={30} y1={56} x2={82} y2={56} stroke="currentColor" opacity={0.7} />
      <line x1={30} y1={68} x2={64} y2={68} stroke="currentColor" opacity={0.7} />
      <circle cx={56} cy={98} r={16} stroke="currentColor" />
      <path
        d="M46 112 L40 128 L56 120 L72 128 L66 112"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      {/* окружность R */}
      <circle cx={122} cy={58} r={26} stroke="currentColor" fill="var(--color-background)" />
      <text
        x={122}
        y={68}
        textAnchor="middle"
        fontSize={26}
        fontFamily="var(--font-display)"
        fill="currentColor"
        stroke="none"
      >
        R
      </text>
    </svg>
  );
}

export function WebsiteDocumentsIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 140" fill="none" strokeWidth={1.4} {...props}>
      <DotGrid x={16} y={100} />
      {/* окно браузера */}
      <rect
        x={20}
        y={20}
        width={104}
        height={72}
        rx={4}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <line x1={20} y1={36} x2={124} y2={36} stroke="currentColor" />
      <circle cx={30} cy={28} r={2.2} fill="currentColor" stroke="none" />
      <circle cx={38} cy={28} r={2.2} fill="currentColor" stroke="none" />
      <circle cx={46} cy={28} r={2.2} fill="currentColor" stroke="none" />
      <rect x={34} y={48} width={76} height={8} rx={2} stroke="currentColor" opacity={0.7} />
      <rect x={34} y={62} width={50} height={8} rx={2} stroke="currentColor" opacity={0.7} />
      {/* галочка согласия */}
      <rect
        x={94}
        y={100}
        width={40}
        height={28}
        rx={3}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <path
        d="M100 114 l6 6 12 -12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContractIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 140" fill="none" strokeWidth={1.4} {...props}>
      <DotGrid x={112} y={20} />
      <rect
        x={26}
        y={18}
        width={78}
        height={102}
        rx={3}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <line x1={40} y1={38} x2={90} y2={38} stroke="currentColor" opacity={0.7} />
      <line x1={40} y1={50} x2={90} y2={50} stroke="currentColor" opacity={0.7} />
      <line x1={40} y1={62} x2={90} y2={62} stroke="currentColor" opacity={0.7} />
      <line x1={40} y1={74} x2={70} y2={74} stroke="currentColor" opacity={0.7} />
      {/* подпись */}
      <path
        d="M40 100 q6 -14 12 0 q6 -14 12 0 q6 -14 12 0 q6 -14 12 0"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <line x1={40} y1={108} x2={90} y2={108} stroke="currentColor" opacity={0.5} />
    </svg>
  );
}

export function ClaimIllustration(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 140" fill="none" strokeWidth={1.4} {...props}>
      <DotGrid x={16} y={16} />
      {/* конверт / переписка */}
      <rect
        x={24}
        y={38}
        width={90}
        height={62}
        rx={3}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <path d="M24 42 L69 76 L114 42" stroke="currentColor" strokeLinejoin="round" />
      {/* восклицательный документ */}
      <rect
        x={104}
        y={70}
        width={34}
        height={46}
        rx={3}
        stroke="currentColor"
        fill="var(--color-background)"
      />
      <line x1={121} y1={82} x2={121} y2={98} stroke="currentColor" strokeLinecap="round" />
      <circle cx={121} cy={104} r={1.4} fill="currentColor" stroke="none" />
    </svg>
  );
}

export const ILLUSTRATIONS = {
  "personal-data": PersonalDataIllustration,
  trademark: TrademarkIllustration,
  "website-documents": WebsiteDocumentsIllustration,
  contract: ContractIllustration,
  claim: ClaimIllustration,
} as const;

/** Список ключей иллюстраций для admin-формы услуг (select) и zod-валидации. */
export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATIONS) as [
  keyof typeof ILLUSTRATIONS,
  ...(keyof typeof ILLUSTRATIONS)[],
];

export type IllustrationKey = keyof typeof ILLUSTRATIONS;
