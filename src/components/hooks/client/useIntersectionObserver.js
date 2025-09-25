import { useEffect, useRef } from 'react';

export const useIntersectionObserver = (items) => {
    const itemsRef = useRef([]);

    useEffect(() => {
        // Properly set up refs when items change
        itemsRef.current = itemsRef.current.slice(0, items.length);

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-section');
                    entry.target.classList.remove('reverse-animate-section');
                } else {
                    entry.target.classList.remove('animate-section');
                    entry.target.classList.add('reverse-animate-section');
                }
            });
        }, options);

        // Only observe elements that exist
        itemsRef.current.forEach(ref => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            // Clean up by only unobserving elements that exist
            itemsRef.current.forEach(ref => {
                if (ref && observer) {
                    try {
                        observer.unobserve(ref);
                    } catch (error) {
                        console.log('Failed to unobserve element:', error);
                    }
                }
            });
        };
    }, [items]);

    return { itemsRef };
};