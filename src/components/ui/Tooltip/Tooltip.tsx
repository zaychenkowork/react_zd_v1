import type { FC, ReactNode } from 'react';
import cn from 'classnames';
import { Tooltip as RadixTooltip } from 'radix-ui';

import styles from './TooltipStyles.module.css';

export type TooltipProps = {
  /**
   * Content shown inside the tooltip on hover.
   */
  content: ReactNode;

  /**
   * When true, the tooltip is suppressed and only the children are rendered.
   */
  disabled?: boolean;

  /**
   * Optional CSS class applied to the trigger wrapper span.
   */
  wrapperClassName?: string;

  /**
   * The preferred side of the trigger where the tooltip is positioned.
   */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * The element that triggers the tooltip on hover or focus.
   */
  children: ReactNode;
};

const Tooltip: FC<TooltipProps> = ({
  content,
  disabled = false,
  wrapperClassName,
  side = 'top',
  children,
}) => {
  if (disabled) return children;

  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <span className={wrapperClassName}>{children}</span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Content
          className={cn(styles.content)}
          side={side}
          sideOffset={4}
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export { Tooltip };
