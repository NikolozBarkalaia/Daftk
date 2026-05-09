import React, { useState } from 'react'

export default function MediaSlide({ item, onOpen }) {
    const [loaded, setLoaded] = useState(false)
    const isVideo = item.type === 'video'

    return (
        <article className="relative w-full overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] group bg-gray-100">
            <div
                className="relative overflow-hidden cursor-pointer"
                style={{ aspectRatio: '3/4' }}
                onClick={() => onOpen(item)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.alt} fullscreen`}
                onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
            >
                {!loaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                )}

                {isVideo ? (
                    <video
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={item.src}
                        preload="metadata"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <img
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        src={item.thumb || item.src}
                        alt={item.alt}
                        loading="lazy"
                        onLoad={() => setLoaded(true)}
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <svg className="w-5 h-5 text-gray-900 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}

                {!isVideo && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7" />
                            </svg>
                        </div>
                    </div>
                )}

                <div className="absolute top-4 left-4">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        {item.label}
                    </span>
                </div>
            </div>

            <div className="px-5 py-4">
                <p className="text-lg font-light tracking-wide text-gray-900 leading-snug">{item.caption}</p>
                <div className="mt-1 flex items-center gap-2">
                    <div className="w-4 h-px bg-amber-500" />
                    <span className="text-[11px] tracking-[0.12em] uppercase text-gray-500">
                        {isVideo ? 'Film' : 'Editorial'}
                    </span>
                </div>
            </div>
        </article>
    )
}