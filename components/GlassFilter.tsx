/**
 * The shared SVG displacement filter behind the liquid-glass UI chrome.
 *
 * Technique after Shu Ding's `liquid-glass` (SVG filter referenced from
 * `backdrop-filter: url(...)`), adapted to an organic fractal-noise
 * displacement so the refraction ripples like water rather than a lens —
 * fitting for an atlas about the fluidity of ecology. Browsers that can't
 * reference SVG filters from backdrop-filter (Safari/Firefox) fall back to
 * the plain blur+saturate declaration in CSS.
 */
export default function GlassFilter() {
  return (
    <svg className="glass-defs" aria-hidden focusable="false">
      <filter
        id="liquid-glass"
        x="-25%"
        y="-25%"
        width="150%"
        height="150%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.007 0.011"
          numOctaves="2"
          seed="19"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="1.6" result="soft" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="soft"
          scale="52"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
