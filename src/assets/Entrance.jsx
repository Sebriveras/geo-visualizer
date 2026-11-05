import * as React from "react"
const Entrance = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g filter="url(#icon-entrance-shadow)">
      <path
        fill="#fff"
        d="M14.818 7.45a3.994 3.994 0 0 1 3.903-1.562l8.466 1.477a4 4 0 0 1 3.313 3.94v17.759a4 4 0 0 1-3.481 3.967l-8.467 1.107a3.996 3.996 0 0 1-3.806-1.687H13.5a4 4 0 0 1-3.995-3.795L9.5 28.45v-17a4 4 0 0 1 4-4h1.318Z"
      />
    </g>
    <path
      fill="#490606"
      d="M11.5 11.45a2 2 0 0 1 2-2h12.986a2 2 0 0 1 2 2.014l-.115 17a2 2 0 0 1-2 1.986H13.5a2 2 0 0 1-2-2v-17Z"
    />
    <path
      fill="#A73F0F"
      d="M16.033 9.829a2 2 0 0 1 2.344-1.97l8.467 1.476a2 2 0 0 1 1.656 1.97v17.76a2 2 0 0 1-1.74 1.982l-8.467 1.108a2 2 0 0 1-2.26-1.983V9.829Z"
    />
    <circle cx={20.3} cy={20.45} r={2} fill="#EFB83F" />
    <defs>
      <filter
        id="icon-entrance-shadow"
        width={25}
        height={32.345}
        x={7.5}
        y={4.828}
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
          result="effect1_dropShadow_7981_61697"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7981_61697"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Entrance
