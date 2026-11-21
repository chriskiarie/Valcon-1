import type { ReactNode } from "react";

const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function Svg({ children }: { children: ReactNode }) {
  return <svg {...base}>{children}</svg>;
}

export const PhoneIcon = () => (<Svg><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>);
export const MailIcon = () => (<Svg><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>);
export const PinIcon = () => (<Svg><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></Svg>);
export const ClockIcon = () => (<Svg><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>);
export const ChatIcon = () => (<Svg><path d="M4 5h16v11H9l-5 4z" /></Svg>);
export const SwapIcon = () => (<Svg><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></Svg>);
export const PlaneIcon = () => (<Svg><path d="M21 3 3 10l7 3 3 7z" /></Svg>);
export const CheckIcon = () => (<Svg><path d="m5 12.5 4.5 4.5L19 7" /></Svg>);
