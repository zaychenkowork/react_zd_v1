import type { FC, SVGProps } from 'react';

import Chevron from './svg/chevron.svg?react';
import Search from './svg/search.svg?react';

type SVGComponent = FC<SVGProps<SVGSVGElement>>;

/**
 * Only a couple of demo icons ship with the template (chevron, search) — the
 * rest of the icon set is added by feature teams the same way, see
 * docs/theming.md (phase 10) for the SVGR `currentColor` trick.
 */
export enum Icons {
  Chevron,
  Search,
}

export const IconsMap: Record<Icons, SVGComponent> = {
  [Icons.Chevron]: Chevron,
  [Icons.Search]: Search,
};
