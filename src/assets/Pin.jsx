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
        d="M23.39 7.45c1.42.383 2.728.859 3.705 1.344.473.235.964.519 1.358.854.193.164.453.416.658.763.207.351.462.99.254 1.759-.016.06-.035.117-.055.173l-.025.067-.087.237c-.074.197-.18.47-.31.78-.243.585-.614 1.413-1.035 2.068-.382.595-.953 1.242-1.412 1.733l.01.017c.384.715.96 1.89 1.103 2.96.128.962.018 1.947-.09 2.607a13.033 13.033 0 0 1-.236 1.114l-.031.116v-.002c-.307 1.096-1.179 1.66-1.796 1.923-.65.277-1.383.395-2.077.436-.595.034-1.245.012-1.93-.056l-1.105 4.093a3 3 0 1 1-5.793-1.564l1.105-4.093a12.418 12.418 0 0 1-1.69-.921c-.58-.384-1.155-.856-1.576-1.422-.395-.53-.856-1.436-.595-2.515h-.003l.005-.015.005-.026.02-.081a11.962 11.962 0 0 1 .352-1.13c.235-.637.65-1.597 1.316-2.371.648-.755 1.687-1.455 2.371-1.887l.03-.02c-.151-.658-.322-1.52-.353-2.235-.034-.778.061-1.68.145-2.31A24.868 24.868 0 0 1 15.81 8.7l.004-.021.002-.008a2.281 2.281 0 0 1 1.138-1.54c.352-.197.705-.284.954-.329.509-.091 1.077-.09 1.604-.054 1.087.072 2.458.32 3.878.703Z"
      />
    </g>
    <path
      fill="#F0B100"
      d="m17.78 9.043 9.654 2.606s-.623 1.766-1.264 2.766c-.642 1-2.23 2.505-2.23 2.505l-5.793-1.563s-.615-2.101-.666-3.288c-.052-1.186.299-3.026.299-3.026Z"
    />
    <path
      fill="#D08700"
      d="m18.147 15.357 5.793 1.563s1.452 2.204 1.632 3.548c.179 1.345-.3 3.027-.3 3.027l-11.585-3.127s.404-1.764 1.265-2.766c.86-1.003 3.195-2.245 3.195-2.245Z"
    />
    <rect
      width={2}
      height={8}
      x={18.251}
      y={22.635}
      fill="#CAD5E2"
      rx={1}
      transform="rotate(15.105 18.251 22.635)"
    />
    <ellipse
      cx={22.607}
      cy={10.346}
      fill="#FDC700"
      rx={5}
      ry={1}
      transform="rotate(15.105 22.607 10.346)"
    />
    <ellipse
      cx={19.48}
      cy={21.931}
      fill="#D08700"
      rx={6}
      ry={2}
      transform="rotate(15.105 19.48 21.931)"
    />
    <ellipse
      cx={21.044}
      cy={16.139}
      fill="#F0B100"
      rx={3}
      ry={1}
      transform="rotate(15.105 21.044 16.139)"
    />
    <defs>
      <filter
        id="icon-pin-shadow"
        width={23.779}
        height={31.93}
        x={8.664}
        y={4.724}
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
          result="effect1_dropShadow_7976_55118"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_7976_55118"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default Pin
