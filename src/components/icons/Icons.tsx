import { cn } from '../../utils/cn'

interface IconProps {
    className?: string
    strokeWidth?: number
}

export function IconBodyweight({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
}

export function IconPushUpBars({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h16M4 14v3M20 14v3M7 14v-2a2 2 0 012-2h6a2 2 0 012 2v2" />
        </svg>
    )
}

export function IconPullUpBar({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M5 6v14M19 6v14M8 6v4a1 1 0 001 1h6a1 1 0 001-1V6" />
        </svg>
    )
}

export function IconBands({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    )
}

export function IconDumbbell({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 19l-4-4m0-7l4 4M5 5l4 4m0 7L5 12m1-7h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm10 0h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
    )
}

export function IconMat({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    )
}

export function IconJumpRope({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V4M6 20h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 4v8" />
        </svg>
    )
}

export function IconParallettes({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 10v9M20 10v9M7 10v-2a2 2 0 012-2h6a2 2 0 012 2v2" />
        </svg>
    )
}

export function IconStar({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    )
}

export function IconStarFilled({ className }: { className?: string }) {
    return (
        <svg className={cn("w-6 h-6", className)} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    )
}

export function IconCheck({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    )
}

export function IconBullet({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )
}
