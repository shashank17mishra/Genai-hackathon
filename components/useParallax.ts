import { useEffect, RefObject } from 'react';

export const useParallax = (ref: RefObject<HTMLElement>, strength: number = 10) => {
  useEffect(() => {
    if (!ref.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = ref.current.getBoundingClientRect();
      const x = (clientX - left - width / 2) / (width / 2);
      const y = (clientY - top - height / 2) / (height / 2);

      const rotateX = -y * (strength / 2);
      const rotateY = x * (strength / 2);

      ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };

    const handleMouseLeave = () => {
      if (!ref.current) return;
      ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };
    
    const parent = ref.current.parentElement;
    if(parent) {
        parent.addEventListener('mousemove', handleMouseMove);
        parent.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
        if (parent) {
            parent.removeEventListener('mousemove', handleMouseMove);
            parent.removeEventListener('mouseleave', handleMouseLeave);
        }
    };
  }, [ref, strength]);
};
