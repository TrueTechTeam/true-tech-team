import { type ComponentType } from 'react';
import { KickballIcon } from './KickballIcon';
import { DodgeballIcon } from './DodgeballIcon';
import { BowlingIcon } from './BowlingIcon';
import { IndoorVolleyballIcon } from './IndoorVolleyballIcon';
import { SandVolleyballIcon } from './SandVolleyballIcon';
import { GrassVolleyballIcon } from './GrassVolleyballIcon';
import { CornholeIcon } from './CornholeIcon';
import { PickleballIcon } from './PickleballIcon';
import { BasketballIcon } from './BasketballIcon';
import { FlagFootballIcon } from './FlagFootballIcon';
import { TennisIcon } from './TennisIcon';
import { BeerPongIcon } from './BeerPongIcon';

export interface SportIconProps {
  size?: number;
  className?: string;
}

export const sportIconMap: Record<string, ComponentType<SportIconProps>> = {
  kickball: KickballIcon,
  dodgeball: DodgeballIcon,
  bowling: BowlingIcon,
  'indoor-volleyball': IndoorVolleyballIcon,
  'sand-volleyball': SandVolleyballIcon,
  'grass-volleyball': GrassVolleyballIcon,
  cornhole: CornholeIcon,
  pickleball: PickleballIcon,
  basketball: BasketballIcon,
  'flag-football': FlagFootballIcon,
  tennis: TennisIcon,
  'beer-pong': BeerPongIcon,
};

export function SportIcon({ slug, size, className }: SportIconProps & { slug: string }) {
  const Icon = sportIconMap[slug];
  if (!Icon) {
    return null;
  }
  return <Icon size={size} className={className} />;
}

export {
  KickballIcon,
  DodgeballIcon,
  BowlingIcon,
  IndoorVolleyballIcon,
  SandVolleyballIcon,
  GrassVolleyballIcon,
  CornholeIcon,
  PickleballIcon,
  BasketballIcon,
  FlagFootballIcon,
  TennisIcon,
  BeerPongIcon,
};
