import * as React from "react"
const Tree = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g filter="url(#icon-tree-shadow)">
      <path
        fill="#fff"
        d="M16.661 9.113c1.581-2.396 5.097-2.396 6.678 0l3.212 4.869c1.024 1.552.8 3.404-.197 4.678l1.412 1.835c2.025 2.63.15 6.439-3.17 6.44H24v2.75a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2.75h-.597c-3.319 0-5.194-3.81-3.17-6.44l1.413-1.835c-.997-1.274-1.221-3.126-.198-4.678l3.213-4.87Z"
      />
    </g>
    <rect width={4} height={7} x={18} y={23.685} fill="#803B10" rx={1} />
    <path
      fill="#096"
      d="M18.415 15.743a2 2 0 0 1 3.17 0l4.596 5.972c1.013 1.315.075 3.22-1.584 3.22h-9.194c-1.66 0-2.597-1.905-1.585-3.22l4.597-5.972Z"
    />
    <path
      fill="#00BC7D"
      d="M18.33 10.214a2 2 0 0 1 3.34 0l3.212 4.87c.877 1.329-.077 3.1-1.67 3.1h-6.424c-1.594 0-2.547-1.771-1.67-3.1l3.213-4.87Z"
    />
    <defs>
      <filter
        id="icon-tree-shadow"
        width={23.208}
        height={31.368}
        x={8.396}
        y={5.316}
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
          result="effect1_dropShadow_7976_55117"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7976_55117"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Tree
