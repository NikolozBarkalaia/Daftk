import { useState, useEffect, useCallback } from 'react'

export function useModal() {
    const [activeItem, setActiveItem] = useState(null)
    const [isVisible, setIsVisible] = useState(false)

    const openModal = useCallback((item) => {
        setActiveItem(item)
        setIsVisible(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsVisible(false)
        setTimeout(() => setActiveItem(null), 350)
    }, [])

    useEffect(() => {
        if (!isVisible) return
        const handler = (e) => { if (e.key === 'Escape') closeModal() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isVisible, closeModal])

    useEffect(() => {
        document.body.style.overflow = isVisible ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isVisible])

    return { activeItem, isVisible, openModal, closeModal }
}