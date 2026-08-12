import type { ReactNode } from 'react'

export type IconProps = {
  size?: number
  className?: string
  strokeWidth?: number
}

function Icon({
  size = 24,
  className,
  strokeWidth = 1.8,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconBell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Icon>
)

export const IconUsers = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
)

export const IconGear = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
)

export const IconTrophy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5v.5a3 3 0 0 0 3 3" />
    <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5v.5a3 3 0 0 1-3 3" />
    <path d="M9.5 20h5" />
    <path d="M12 14.5V20" />
  </Icon>
)

export const IconRoomAdd = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </Icon>
)

export const IconEnter = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </Icon>
)

export const IconCompass = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M16.5 7.5l-2.6 6.4-6.4 2.6 2.6-6.4 6.4-2.6z" />
  </Icon>
)

export const IconHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9.8 12 3l9 6.8" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Icon>
)

export const IconRanking = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 20v-6" />
    <path d="M12 20V7" />
    <path d="M18 20v-9" />
    <path d="M3 20h18" />
  </Icon>
)

export const IconTasks = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 6.5h10" />
    <path d="M10 12h10" />
    <path d="M10 17.5h10" />
    <path d="M3.5 6.3l1.3 1.3 2.4-2.6" />
    <path d="M3.5 11.8l1.3 1.3 2.4-2.6" />
    <path d="M3.5 17.3l1.3 1.3 2.4-2.6" />
  </Icon>
)

export const IconBag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 2 3.5 6v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V6L18 2Z" />
    <path d="M3.5 6h17" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Icon>
)

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7.5" r="4" />
  </Icon>
)

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
)

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Icon>
)

export const IconX = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </Icon>
)

export const IconBolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />
  </Icon>
)

export const IconSwords = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 16l4 4" />
    <path d="M19.5 17.5 21 19v2h-2l-1.5-1.5" />
    <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
    <path d="M11 19l-6-6" />
    <path d="M8 16l-4 4" />
    <path d="M4.5 17.5 3 19v2h2l1.5-1.5" />
  </Icon>
)

export const IconCopy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </Icon>
)

export const IconMic = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </Icon>
)

export const IconMicOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 9v2a3 3 0 0 0 5 2" />
    <path d="M15 10.5V6a3 3 0 0 0-5.7-1.3" />
    <path d="M5 11a7 7 0 0 0 10.5 6" />
    <path d="M12 18v3" />
    <path d="M4 4l16 16" />
  </Icon>
)

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)

export const IconPlay = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
  </Icon>
)

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l2.7 5.5 6 .9-4.35 4.25 1.03 6L12 16.9 6.62 19.65l1.03-6L3.3 9.4l6-.9L12 3Z" />
  </Icon>
)

export const IconBall = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5l3.5 2.5-1.3 4h-4.4l-1.3-4L12 7.5Z" />
    <path d="M12 3v4.5M4.2 9.5l4.3 2.9M19.8 9.5l-4.3 2.9M7.4 20l1.5-4M16.6 20l-1.5-4" />
  </Icon>
)

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </Icon>
)

export const IconFlask = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v6l-5.2 9.3A1.5 1.5 0 0 0 6.1 21h11.8a1.5 1.5 0 0 0 1.3-2.7L14 9V3" />
    <path d="M7.5 15h9" />
  </Icon>
)

export const IconFilm = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" />
  </Icon>
)

export const IconNote = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 17V5l11-2v12" />
    <circle cx="6" cy="17" r="3" />
    <circle cx="17" cy="15" r="3" />
  </Icon>
)

export const IconScroll = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4h9a2 2 0 0 1 2 2v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </Icon>
)
