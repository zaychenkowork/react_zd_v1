import type { FC, MouseEvent } from 'react';
import cn from 'classnames';

import { Icons, IconsMap } from '~/ui/icons/types';

export type IconProps = {
  type: Icons;
  size?: number;
  strokeColor?: string;
  fillColor?: string;
  onClick?: (e?: MouseEvent<SVGSVGElement>) => void;
  containerClassName?: string;
};

const Icon: FC<IconProps> = ({
  type,
  size = 24,
  fillColor = 'transparent',
  strokeColor = 'currentColor',
  onClick,
  containerClassName,
}) => {
  const IconComponent = IconsMap[type];

  return (
    <div
      className={cn(containerClassName)}
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <IconComponent
        width={size}
        height={size}
        fill={fillColor}
        stroke={strokeColor}
        color={strokeColor}
        data-testid="icon-svg"
        onClick={onClick}
      />
    </div>
  );
};

export { Icon };
