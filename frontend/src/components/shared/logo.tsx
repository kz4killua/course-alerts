import { JSX, SVGProps } from "react";

export function Logo(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="M224 71.1a8 8 0 01-10.78-3.42 94.13 94.13 0 00-33.46-36.91 8 8 0 118.54-13.54 111.46 111.46 0 0139.12 43.09A8 8 0 01224 71.1zM35.71 72a8 8 0 007.1-4.32 94.13 94.13 0 0133.46-36.91 8 8 0 10-8.54-13.54 111.46 111.46 0 00-39.12 43.09A8 8 0 0035.71 72zm186.1 103.94A16 16 0 01208 200h-40.8a40 40 0 01-78.4 0H48a16 16 0 01-13.79-24.06C43.22 160.39 48 138.28 48 112a80 80 0 01160 0c0 26.27 4.78 48.38 13.81 63.94zM150.62 200h-45.24a24 24 0 0045.24 0z" />
    </svg>
  )
}