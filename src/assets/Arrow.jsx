import * as React from "react"
const Arrow = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g filter="url(#icon-arrow-shadow)">
      <path
        fill="#fff"
        d="M17.359 8.817c1.118-2.1 4.164-2.1 5.282 0l.105.217L28.142 21.3c.872 1.983-.58 4.208-2.746 4.208H24v4.25a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-4.25h-1.396c-2.166 0-3.618-2.225-2.746-4.208l5.396-12.266.105-.217Z"
      />
    </g>
    <rect width={4} height={9} x={18} y={21.758} fill="#CAD5E2" rx={1} />
    <path
      fill="#CAD5E2"
      d="M19.085 9.84c.35-.797 1.48-.797 1.83 0l5.396 12.266a1 1 0 0 1-.915 1.402H14.604a1 1 0 0 1-.915-1.402l5.396-12.267Z"
    />
    <defs>
      <filter
        id="icon-arrow-shadow"
        width={22.799}
        height={31.517}
        x={8.601}
        y={5.242}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={1} />
        <feGaussianBlur stdDeviation={1.5} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_7976_55119"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7976_55119"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Arrow
