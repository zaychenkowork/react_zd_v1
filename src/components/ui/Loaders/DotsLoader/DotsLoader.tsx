import type { CSSProperties, FC } from 'react';

import styles from './DotsLoaderStyles.module.css';

export type DotsLoaderProps = {
  /**
   * The width of the loader.
   */
  width?: number | string;

  /**
   * The color of the loader.
   */
  color?: string;
};

const DotsLoader: FC<DotsLoaderProps> = ({
  width = 60,
  color = 'var(--color-primary-950)',
}) => {
  return (
    <div
      className={styles.loader}
      style={{ width, '--_loader-color': color } as CSSProperties}
      role="progressbar"
    />
  );
};

export { DotsLoader };
