import React, { useRef, useState, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, A11y } from 'swiper/modules'
import MediaSlide from './MediaSlide'
import MediaModal from './MediaModal'
import { useModal } from '../hooks/useModal'

/* ─── Thin arrow icon ─── */
function ArrowIcon({ dir }) {
    return (
        <svg
            className="w-4 h-4 text-neutral-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {dir === 'prev'
                ? <path d="M15 19l-7-7 7-7" />
                : <path d="M9 5l7 7-7 7" />
            }
        </svg>
    )
}

/* ─── Reusable nav button ─── */
function NavButton({ dir, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={dir === 'prev' ? 'Previous slide' : 'Next slide'}
            className="
                group
                w-11 h-11 rounded-full
                flex items-center justify-center
                bg-white/90 backdrop-blur-sm
                border border-neutral-200/80
                shadow-[0_2px_16px_rgba(0,0,0,0.08)]
                hover:shadow-[0_4px_28px_rgba(0,0,0,0.14)]
                hover:border-amber-400/40
                hover:scale-105
                active:scale-95
                transition-all duration-300 ease-out
                disabled:opacity-30 disabled:pointer-events-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50
            "
        >
            <ArrowIcon dir={dir} />
        </button>
    )
}

export default function MediaShowcaseSwiper({ items }) {
    const swiperRef = useRef(null)
    const { activeItem, isVisible, openModal, closeModal } = useModal()
    const [swiperReady, setSwiperReady] = useState(false)

    const handleOpen = useCallback((item) => {
        swiperRef.current?.swiper?.autoplay?.stop()
        openModal(item)
    }, [openModal])

    const handleClose = useCallback(() => {
        closeModal()
        setTimeout(() => swiperRef.current?.swiper?.autoplay?.start(), 400)
    }, [closeModal])

    const goPrev = useCallback(() => swiperRef.current?.swiper?.slidePrev(), [])
    const goNext = useCallback(() => swiperRef.current?.swiper?.slideNext(), [])

    return (
        <div className="relative">
            <Swiper
                ref={swiperRef}
                onSwiper={() => setSwiperReady(true)}
                modules={[Pagination, Autoplay, A11y]}
                className="luxury-swiper"
                loop={true}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={1.15}
                spaceBetween={20}
                speed={750}
                /* navigation handled by custom buttons — no default arrows */
                pagination={{ clickable: true }}
                autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' }}
                breakpoints={{
                    480:  { slidesPerView: 1.3,  spaceBetween: 24 },
                    640:  { slidesPerView: 1.6,  spaceBetween: 28 },
                    900:  { slidesPerView: 2.2,  spaceBetween: 32 },
                    1280: { slidesPerView: 2.8,  spaceBetween: 36 },
                    1600: { slidesPerView: 3.2,  spaceBetween: 40 },
                }}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id}>
                        <MediaSlide item={item} onOpen={handleOpen} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom nav — positioned over the swiper, vertically centred on the slide image */}
            {swiperReady && (
                <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[52px] z-10 flex items-center justify-between px-2 sm:px-4">
                    <div className="pointer-events-auto">
                        <NavButton dir="prev" onClick={goPrev} />
                    </div>
                    <div className="pointer-events-auto">
                        <NavButton dir="next" onClick={goNext} />
                    </div>
                </div>
            )}

            <MediaModal item={activeItem} isVisible={isVisible} onClose={handleClose} />
        </div>
    )
}