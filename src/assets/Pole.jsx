import * as React from "react"
const Pole = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g filter="url(#icon-pole-shadow)">
      <path
        fill="#fff"
        d="M26 6.5a4 4 0 0 1 4 4v.536a4 4 0 0 1-2 7.464h-2v5c0 1.48-.805 2.771-2 3.463V29.5a4 4 0 0 1-8 0v-2.537a3.997 3.997 0 0 1-2-3.463v-5h-2a4 4 0 0 1-2-7.464V10.5a4 4 0 0 1 7-2.644A3.989 3.989 0 0 1 20 6.5c1.195 0 2.267.525 3 1.356A3.989 3.989 0 0 1 26 6.5Z"
      />
    </g>
    <path fill="#5A8CAF" d="M18 25.5h4v4a2 2 0 1 1-4 0v-4Z" />
    <rect
      width={4}
      height={20}
      x={30}
      y={12.5}
      fill="#5A8CAF"
      rx={2}
      transform="rotate(90 30 12.5)"
    />
    <path
      fill="#386AA2"
      d="M16 12.5h-4v-2a2 2 0 1 1 4 0v2ZM28 12.5h-4v-2a2 2 0 1 1 4 0v2ZM22 12.5h-4v-2a2 2 0 1 1 4 0v2Z"
    />
    <rect width={8} height={9} x={16} y={16.5} fill="#5CA4D6" rx={2} />
    <defs>
      <filter
        id="icon-pole-shadow"
        width={28}
        height={31}
        x={6}
        y={5.5}
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
        <feGaussianBlur stdDeviation={1} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_7981_61696"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7981_61696"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Pole
