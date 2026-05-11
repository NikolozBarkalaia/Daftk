import React, { useRef, useEffect, useState } from 'react';
import MediaSlide from './MediaSlide';
import MediaModal from './MediaModal';
import { useModal } from '../hooks/useModal';

/**
 * Apple-style horizontal media gallery with native CSS snapping.
 * - Perfectly centered first item on load
 * - Center-snapping behavior while scrolling
 * - Hidden scrollbars
 * - No empty space at edges (handled by container padding)
 * - Support for Images and Videos
 */
export default function ModernMediaSlider({ items = [] }) {
    const scrollContainerRef = useRef(null);
    const [slideWidth, setSlideWidth] = useState(450); // Default width for initial calc
    const { activeItem, isVisible, openModal, closeModal } = useModal();

    useEffect(() => {
        const updateWidth = () => {
            // Responsive slide widths based on breakpoints
            const w = window.innerWidth;
            if (w < 640) setSlideWidth(w * 0.85); // Mobile: 85% of viewport
            else if (w < 1024) setSlideWidth(400); // Tablet
            else setSlideWidth(480); // Desktop
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        // Initial scroll to ensure centering is active
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
        }

        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    if (!items || items.length === 0) return null;

    // Calculate padding to allow first and last items to center perfectly
    // Padding = (Viewport Width - Slide Width) / 2
    // const sidePadding = `calc(50vw - ${slideWidth / 2}px)`;

    return (
        <div className="relative w-full overflow-hidden py-12">
            <div
                ref={scrollContainerRef}
                className="hide-scrollbar flex overflow-x-auto scroll-smooth snap-x snap-mandatory"
            // style={{
            //     paddingLeft: sidePadding,
            //     paddingRight: sidePadding,
            //     gap: '2rem'
            // }}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="snap-center flex-shrink-0 w-full max-w-[480px] transition-transform duration-500 hover:scale-[1.02]"
                        style={{ width: `${slideWidth}px` }}
                    >
                        <MediaSlide
                            item={item}
                            onOpen={() => openModal(item)}
                        />
                    </div>
                ))}
            </div>

            {/* Optional: Add gradient overlays for premium feel at edges */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white/80 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10" />

            <MediaModal
                item={activeItem}
                isVisible={isVisible}
                onClose={closeModal}
            />
        </div>
    );
}
