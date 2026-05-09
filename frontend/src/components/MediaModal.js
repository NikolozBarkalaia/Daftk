import React, { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function MediaModal({ item, isVisible, onClose }) {
    const videoRef = useRef(null)

    // Pause + reset video when modal closes
    useEffect(() => {
        if (!isVisible && videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }, [isVisible])

    // Keep item mounted during close animation (cleared by useModal after delay)
    if (!item) return null

    const isVideo = item.type === 'video'

    return createPortal(
        /* Rendered into document.body — escapes all parent stacking contexts */
        <div
            className={`
                fixed inset-0 z-[10000] flex items-center justify-center
                transition-opacity duration-500 ease-out
                ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            role="dialog"
            aria-modal="true"
            aria-label={item.alt}
        >
            {/* Dimmed backdrop with blur */}
            <div
                className={`
                    absolute inset-0 bg-black/90
                    transition-all duration-500 ease-out
                    ${isVisible ? 'backdrop-blur-md' : 'backdrop-blur-none'}
                `}
                onClick={onClose}
            />

            {/* Content panel — scale + translate cinematic entrance */}
            <div
                className={`
                    relative z-10 w-full max-w-5xl mx-4 sm:mx-8
                    transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isVisible
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-6 scale-[0.96]'
                    }
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button — top-right, outside the card */}
                <button
                    className="
                        group absolute -top-7 right-0
                        w-11 h-11 rounded-full
                        flex items-center justify-center
                        border border-white/15 bg-white/5
                        hover:bg-white/15 hover:border-white/30
                        transition-all duration-300
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                    "
                    onClick={onClose}
                    aria-label="Close lightbox"
                >
                    {/* Thin X */}
                    <svg
                        className="w-[14px] h-[14px] text-white/70 group-hover:text-white transition-colors duration-200"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    >
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Media card */}

                <br />
                <div className="rounded-2xl overflow-hidden shadow-[0_48px_120px_rgba(0,0,0,0.7)] bg-neutral-950 ring-1 ring-white/5">
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            className="w-full max-h-[80vh] object-contain bg-black"
                            src={item.src}
                            poster={item.poster}
                            controls
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img
                            className="w-full max-h-[82vh] object-contain"
                            src={item.src}
                            alt={item.alt}
                            draggable={false}
                        />
                    )}
                </div>

                {/* ESC hint */}
                <p className="mt-3 text-center text-[10px] tracking-[0.14em] uppercase text-white/18 select-none">
                    Press ESC or click outside to close
                </p>
            </div>
        </div>
    , document.body)
}