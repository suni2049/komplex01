import type { CSSProperties } from 'react'
import { cn } from '../../utils/cn'

interface IconProps {
    className?: string
    strokeWidth?: number
    style?: CSSProperties
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

export function IconLightning({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    )
}

export function IconChart({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    )
}

export function IconTarget({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

export function IconRecovery({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    )
}

export function IconBrain({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    )
}

export function IconShare({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    )
}

export function IconFolder({ className, strokeWidth = 2, style }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
    )
}

export function IconFolderOpen({ className, strokeWidth = 2, style }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
    )
}

export function IconPlus({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    )
}

export function IconMove({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
    )
}

export function IconTrash({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    )
}

export function IconPencil({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    )
}

export function IconArrowLeft({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    )
}

export function IconSave({ className, strokeWidth = 2 }: IconProps) {
    return (
        <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm9-1v4H9V4" />
        </svg>
    )
}
