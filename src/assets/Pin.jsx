import * as React from "react"
const Pin = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g filter="url(#icon-pin-shadow)">
      <path
        fill="#fff"
        d="M20 7.5c5.66 0 10 4.895 10 10.615 0 2.79-1.02 6.228-2.612 8.979-.805 1.39-1.809 2.7-3.001 3.683-1.195.986-2.683 1.723-4.387 1.723-1.704 0-3.192-.737-4.387-1.723-1.192-.983-2.197-2.294-3-3.683C11.02 24.344 10 20.904 10 18.115 10 12.395 14.34 7.5 20 7.5Z"
      />
    </g>
    <path
      fill="#FB2C36"
      d="M28 18.115c0 4.759-3.582 12.385-8 12.385s-8-7.627-8-12.385S15.582 9.5 20 9.5s8 3.857 8 8.615Z"
    />
    <circle cx={20} cy={18.5} r={4} fill="#C10007" />
    <defs>
      <filter
        id="icon-pin-shadow"
        width={24}
        height={29}
        x={8}
        y={6.5}
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
          result="effect1_dropShadow_7981_61698"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7981_61698"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Pin
