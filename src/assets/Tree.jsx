import * as React from "react"
const Tree = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    viewBox="0 0 40 40"
    fill="none"
    {...props}
  >
    <g filter="url(#icon-tree-shadow)">
      <path
        fill="#fff"
        d="M17.062 7.635a4 4 0 0 1 5.876 0l5.129 5.551c1.448 1.568 1.327 3.73.218 5.173l1.465 1.36c2.665 2.473.915 6.932-2.721 6.932h-2.03v4a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-4h-2.028c-3.636 0-5.386-4.46-2.72-6.933l1.463-1.359c-1.109-1.443-1.23-3.605.218-5.173l5.13-5.551Z"
      />
    </g>
    <rect width={6} height={8} x={17} y={23.651} fill="#8F400E" rx={1} />
    <path
      fill="#00997D"
      d="M18.64 14.663a2 2 0 0 1 2.72 0l7.029 6.522c1.333 1.236.458 3.466-1.36 3.466H12.972c-1.819 0-2.694-2.23-1.36-3.466l7.028-6.522Z"
    />
    <path
      fill="#02B985"
      d="M18.53 8.991a2 2 0 0 1 2.94 0l5.128 5.553c1.184 1.28.275 3.357-1.469 3.357H14.871c-1.744 0-2.653-2.076-1.47-3.357l5.13-5.553Z"
    />
    <defs>
      <filter
        id="icon-tree-shadow"
        width={26.073}
        height={31.302}
        x={6.963}
        y={5.349}
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
          result="effect1_dropShadow_7981_61699"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7981_61699"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Tree
