import type { CSSProperties, FC, ReactNode } from 'react';
import cn from 'classnames';

import styles from './SkeletonStyles.module.css';

export type SkeletonProps = {
  /**
   * If `true`, the skeleton is displayed and the children are hidden.
   * If `false`, the children are rendered normally.
   */
  loading?: boolean;

  /**
   * Additional CSS class to apply to the skeleton element.
   */
  className?: string;

  /**
   * Inline style object to apply to the skeleton element.
   */
  style?: CSSProperties;

  /**
   * Height of the skeleton (useful for block skeletons).
   */
  height?: string;

  /**
   * Border radius of the skeleton.
   */
  radius?: string;

  /**
   * Width of the skeleton (useful for block skeletons).
   */
  width?: string;

  /**
   * Content to render when `loading` is `false`.
   */
  children?: ReactNode;
};

const Skeleton: FC<SkeletonProps> = ({
  loading = false,
  className,
  style,
  height,
  width = '100%',
  radius,
  children,
}) => {
  if (loading) {
    return (
      <span
        className={cn(styles.skeleton, className)}
        style={{ height, width, borderRadius: radius, ...style }}
        aria-hidden="true"
      />
    );
  }

  return children;
};

export { Skeleton };
