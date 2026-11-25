import { useId } from 'react';

interface SparkasseRibbonLogoProps {
  className?: string;
  withWordmark?: boolean;
}

export function SparkasseRibbonLogo({
  className = 'w-10 h-10',
  withWordmark = false,
}: SparkasseRibbonLogoProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `ribbonSilhouette-${uid}`;
  const gradId = `sparkasseRibbonGrad-${uid}`;
  const topTipId = `topTipBoost-${uid}`;
  const bottomTipId = `bottomTipBoost-${uid}`;
  const upperOccId = `upperFoldOcclusion-${uid}`;
  const lowerOccId = `lowerFoldOcclusion-${uid}`;
  const topSheenId = `topSurfaceSheen-${uid}`;
  const bottomSheenId = `bottomSurfaceSheen-${uid}`;

  const ribbonSilhouette =
    'M 950 132 ' +
    'A 57 57 0 0 1 986 240 ' +
    'L 767 312 ' +
    'L 984 358 ' +
    'C 1064 376, 1056 484, 986 508 ' +
    'L 650 618 ' +
    'A 57 57 0 0 1 614 510 ' +
    'L 833 438 ' +
    'L 616 392 ' +
    'C 536 374, 544 266, 614 242 ' +
    'Z';

  return (
    <svg
      viewBox={withWordmark ? '480 120 640 680' : '550 125 500 500'}
      className={className}
      role="img"
      aria-label="Sparkasse Logo"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ribbonSilhouette} />
        </clipPath>

        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="930"
          y1="145"
          x2="780"
          y2="595"
        >
          <stop offset="0%" stopColor="#FF4A24" />
          <stop offset="28%" stopColor="#FF1744" />
          <stop offset="52%" stopColor="#F50087" />
          <stop offset="76%" stopColor="#D500B5" />
          <stop offset="100%" stopColor="#8500E8" />
        </linearGradient>

        <linearGradient
          id={topTipId}
          gradientUnits="userSpaceOnUse"
          x1="995"
          y1="150"
          x2="720"
          y2="290"
        >
          <stop offset="0%" stopColor="#FF5E2B" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#FF4A24" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FF1744" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id={bottomTipId}
          gradientUnits="userSpaceOnUse"
          x1="600"
          y1="595"
          x2="860"
          y2="465"
        >
          <stop offset="0%" stopColor="#F50087" stopOpacity="0.88" />
          <stop offset="45%" stopColor="#D500B5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8500E8" stopOpacity="0" />
        </linearGradient>

        <radialGradient
          id={upperOccId}
          gradientUnits="userSpaceOnUse"
          cx="692"
          cy="332"
          r="98"
        >
          <stop offset="0%" stopColor="#12000A" stopOpacity="0.72" />
          <stop offset="45%" stopColor="#1A0010" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={lowerOccId}
          gradientUnits="userSpaceOnUse"
          cx="908"
          cy="418"
          r="98"
        >
          <stop offset="0%" stopColor="#0E0022" stopOpacity="0.74" />
          <stop offset="45%" stopColor="#160030" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient
          id={topSheenId}
          gradientUnits="userSpaceOnUse"
          x1="760"
          y1="130"
          x2="810"
          y2="310"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id={bottomSheenId}
          gradientUnits="userSpaceOnUse"
          x1="840"
          y1="620"
          x2="790"
          y2="440"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <path d={ribbonSilhouette} fill={`url(#${gradId})`} />
        <path d={ribbonSilhouette} fill={`url(#${topTipId})`} />
        <path d={ribbonSilhouette} fill={`url(#${bottomTipId})`} />

        <circle cx="692" cy="332" r="98" fill={`url(#${upperOccId})`} />
        <circle cx="908" cy="418" r="98" fill={`url(#${lowerOccId})`} />

        <path
          d="M 540 230 L 1030 110 L 1030 226 L 675 342 C 636 355, 622 365, 634 374 C 606 378, 560 360, 540 320 Z"
          fill={`url(#${gradId})`}
        />
        <path
          d="M 540 230 L 1030 110 L 1030 226 L 675 342 C 636 355, 622 365, 634 374 C 606 378, 560 360, 540 320 Z"
          fill={`url(#${topTipId})`}
        />
        <path
          d="M 540 230 L 1030 110 L 1030 226 L 675 342 C 636 355, 622 365, 634 374 C 606 378, 560 360, 540 320 Z"
          fill={`url(#${topSheenId})`}
        />

        <path
          d="M 1060 520 L 570 640 L 570 524 L 925 408 C 964 395, 978 385, 966 376 C 994 372, 1040 390, 1060 430 Z"
          fill={`url(#${gradId})`}
        />
        <path
          d="M 1060 520 L 570 640 L 570 524 L 925 408 C 964 395, 978 385, 966 376 C 994 372, 1040 390, 1060 430 Z"
          fill={`url(#${bottomTipId})`}
        />
        <path
          d="M 1060 520 L 570 640 L 570 524 L 925 408 C 964 395, 978 385, 966 376 C 994 372, 1040 390, 1060 430 Z"
          fill={`url(#${bottomSheenId})`}
        />
      </g>

      {withWordmark && (
        <text
          x="800"
          y="756"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="118"
          fontWeight="600"
          letterSpacing="-2.6"
          fontFamily="var(--font-sans)"
        >
          Sparkasse
        </text>
      )}
    </svg>
  );
}
