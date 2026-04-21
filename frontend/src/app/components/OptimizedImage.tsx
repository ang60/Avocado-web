import { useState } from 'react';

type OptimizedImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'loading' | 'decoding'
> & {
  src: string;
  alt: string;
  /** Hint for LCP / hero images */
  priority?: boolean;
};

/**
 * Vite/React alternative to next/image: lazy loading, async decode, dimensions to reduce layout shift.
 * For imported assets, prefer `import img from './x.png'` so Vite hashes & optimizes the file.
 */
export function OptimizedImage({
  src,
  alt,
  priority = false,
  className,
  width,
  height,
  style,
  onError,
  ...rest
}: OptimizedImageProps) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      style={{ maxWidth: '100%', height: 'auto', ...style }}
      onError={(e) => {
        setHidden(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
