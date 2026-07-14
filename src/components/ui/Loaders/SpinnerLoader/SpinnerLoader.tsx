import type { FC } from 'react';

import styles from './SpinnerLoaderStyles.module.css';

export type SpinnerLoaderProps = {
  /**
   * The size of the loader. SpinnerLoader is circle-shaped, so it's both width and height.
   */
  size?: number | string;

  /**
   * The color of the loader.
   */
  color?: string;

  /**
   * The thickness of the loader's stroke.
   */
  strokeWidth?: number;
};

const SpinnerLoader: FC<SpinnerLoaderProps> = ({
  size = 50,
  color = 'var(--color-primary-950)',
  strokeWidth = 8,
}) => {
  return (
    <div
      className={styles.loader}
      style={{ width: size, background: color, padding: strokeWidth }}
      role="progressbar"
    />
  );
};

export { SpinnerLoader };
