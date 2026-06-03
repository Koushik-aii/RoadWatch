import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter that counts up from 0 to target value.
 *
 * Props:
 *  - value: number — target value
 *  - duration: number — animation duration in ms (default: 1200)
 *  - prefix: string — e.g. '$', '₹'
 *  - suffix: string — e.g. '%', 'd', 'k'
 *  - decimals: number — decimal places (default: 0)
 *  - className: additional classes for the number
 */
export default function AnimatedCounter({
  value = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Use IntersectionObserver to animate when visible
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateValue(0, value, duration);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, duration]);

  // Also re-animate when value changes
  useEffect(() => {
    if (hasAnimated.current) {
      animateValue(display, value, duration / 2);
    }
  }, [value]);

  function animateValue(start, end, dur) {
    const startTime = performance.now();
    const diff = end - start;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
