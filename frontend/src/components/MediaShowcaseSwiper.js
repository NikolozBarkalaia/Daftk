import React, { useRef, useState, useCallback, useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, A11y, Navigation } from 'swiper/modules'
import MediaSlide from './MediaSlide'
import MediaModal from './MediaModal'
import { useModal } from '../hooks/useModal'

/* ─── Arrow icon ─── */
function ArrowIcon({ dir }) {
    return (
        <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
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

/* ─── Compute safe breakpoints — never show more slides than exist ─── */
function getSafeBreakpoints(count) {
    const cap = (n) => Math.min(n, count)
    return {
        0:    { slidesPerView: cap(1.15), spaceBetween: 16 },
        480:  { slidesPerView: cap(1.4),  spaceBetween: 20 },
        640:  { slidesPerView: cap(1.7),  spaceBetween: 24 },
        900:  { slidesPerView: cap(2.3),  spaceBetween: 28 },
        1100: { slidesPerView: cap(2.8),  spaceBetween: 32 },
        1400: { slidesPerView: cap(3.2),  spaceBetween: 36 },
    }
}

export default function MediaShowcaseSwiper({ items }) {
    const prevRef   = useRef(null)
    const nextRef   = useRef(null)
    const swiperRef = useRef(null)
    const { activeItem, isVisible, openModal, closeModal } = useModal()
    const [swiperReady, setSwiperReady] = useState(false)

    const count = items?.length ?? 0

    /*
     * Loop is only safe when there are enough slides to fill at least 2 × the
     * maximum visible slides. Below that threshold Swiper creates duplicate/blank
     * slides and the active-slide offset is wrong.
     */
    const enableLoop = count >= 6

    const breakpoints = useMemo(() => getSafeBreakpoints(count), [count])

    const handleOpen = useCallback((item) => {
        swiperRef.current?.autoplay?.stop()
        openModal(item)
    }, [openModal])

    const handleClose = useCallback(() => {
        closeModal()
        setTimeout(() => swiperRef.current?.autoplay?.start(), 400)
    }, [closeModal])

    /* Wire custom buttons after Swiper initialises */
    const handleSwiper = useCallback((swiper) => {
        swiperRef.current = swiper
        if (prevRef.current && nextRef.current) {
            swiper.params.navigation.prevEl = prevRef.current
            swiper.params.navigation.nextEl = nextRef.current
            swiper.navigation.init()
            swiper.navigation.update()
        }
        setSwiperReady(true)
    }, [])

    if (count === 0) return null

    /* Single item — just render the slide, no carousel chrome */
    if (count === 1) {
        return (
            <div className="featured-single">
                <MediaSlide item={items[0]} onOpen={openModal} />
                <MediaModal item={activeItem} isVisible={isVisible} onClose={closeModal} />
            </div>
        )
    }

    return (
        <div className="featured-carousel">
            <Swiper
                onSwiper={handleSwiper}
                modules={[Pagination, Autoplay, A11y, Navigation]}
                className="luxury-swiper"
                loop={enableLoop}
                grabCursor={true}
                centeredSlides={true}
                slideToClickedSlide={true}
                watchOverflow={true}
                watchSlidesProgress={true}
                speed={700}
                breakpoints={breakpoints}
                pagination={{ clickable: true }}
                autoplay={{
                    delay: 4500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' }}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id} className="featured-slide">
                        {({ isActive, isNext, isPrev }) => (
                            <div className={`featured-slide__inner ${isActive ? 'is-active' : ''} ${(isNext || isPrev) ? 'is-adjacent' : ''}`}>
                                <MediaSlide item={item} onOpen={handleOpen} />
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom prev/next — always rendered so refs are stable */}
            <button ref={prevRef} className="featured-nav featured-nav--prev" aria-label="Previous slide">
                <ArrowIcon dir="prev" />
            </button>
            <button ref={nextRef} className="featured-nav featured-nav--next" aria-label="Next slide">
                <ArrowIcon dir="next" />
            </button>

            <MediaModal item={activeItem} isVisible={isVisible} onClose={handleClose} />
        </div>
    )
}