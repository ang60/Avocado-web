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
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          backgroundColor: '#F7F4EF',
          color: '#94A3B8',
          fontSize: 11,
          ...style,
        }}
      >
        Image unavailable
      </div>
    );
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
        setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
