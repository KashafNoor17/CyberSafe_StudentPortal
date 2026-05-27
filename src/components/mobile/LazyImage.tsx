import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  /** Low-res placeholder or blur hash URL */
  placeholder?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Lazy-loaded image with intersection observer.
 * Shows a placeholder until the image enters the viewport,
 * then fades in the full image. Supports WebP via <picture>.
 */
export function LazyImage({
  src,
  alt,
  placeholder,
  width,
  height,
  className = '',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Generate WebP source if the original is jpg/png
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const hasWebp = webpSrc !== src;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder && !loaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
          aria-hidden="true"
        />
      )}

      {/* Skeleton if no placeholder */}
      {!placeholder && !loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual image — only load when in viewport */}
      {inView && (
        <picture>
          {hasWebp && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      )}
    </div>
  );
}
