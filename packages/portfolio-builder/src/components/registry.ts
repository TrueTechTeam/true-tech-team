import type { ComponentType } from '../schema/types';
import { HeadingItem, validateHeadingProps } from './primitives/Heading';
import { TextItem, validateTextProps } from './primitives/Text';
import { ImageItem, validateImageProps } from './primitives/Image';
import { SpacerItem, validateSpacerProps } from './primitives/Spacer';
import {
  LinkButtonItem,
  validateLinkButtonProps,
  IconLinkButtonItem,
  validateIconLinkButtonProps,
} from './wrappers/links';
import {
  BadgeItem,
  validateBadgeProps,
  ChipItem,
  validateChipProps,
  PillItem,
  validatePillProps,
  StatusIndicatorItem,
  validateStatusIndicatorProps,
  IconItem,
  validateIconProps,
} from './wrappers/display';
import { AvatarItem, validateAvatarProps } from './wrappers/avatar';
import {
  ProgressBarItem,
  validateProgressBarProps,
  CircularProgressItem,
  validateCircularProgressProps,
  KpiItem,
  validateKpiProps,
  CountUpItem,
  validateCountUpProps,
} from './wrappers/metrics';
import { CardItem, validateCardProps } from './wrappers/card';
import {
  ExpandableTextItem,
  validateExpandableTextProps,
  AccordionItem,
  validateAccordionProps,
  RevealItem,
  validateRevealProps,
  FlipCardItem,
  validateFlipCardProps,
} from './wrappers/expand';
import {
  CarouselItem,
  validateCarouselProps,
  TabsItem,
  validateTabsProps,
  OverflowTextItem,
  validateOverflowTextProps,
  TruncatedListItem,
  validateTruncatedListProps,
} from './wrappers/lists';

export interface RegistryEntry {
  component: (props: Record<string, unknown>) => React.ReactElement | null;
  validate: (props: Record<string, unknown>) => string[];
}

const REGISTRY: Record<ComponentType, RegistryEntry> = {
  heading: { component: HeadingItem, validate: validateHeadingProps },
  text: { component: TextItem, validate: validateTextProps },
  image: { component: ImageItem, validate: validateImageProps },
  spacer: { component: SpacerItem, validate: validateSpacerProps },
  card: { component: CardItem, validate: validateCardProps },
  badge: { component: BadgeItem, validate: validateBadgeProps },
  avatar: { component: AvatarItem, validate: validateAvatarProps },
  chip: { component: ChipItem, validate: validateChipProps },
  pill: { component: PillItem, validate: validatePillProps },
  icon: { component: IconItem, validate: validateIconProps },
  statusIndicator: { component: StatusIndicatorItem, validate: validateStatusIndicatorProps },
  progressBar: { component: ProgressBarItem, validate: validateProgressBarProps },
  circularProgress: { component: CircularProgressItem, validate: validateCircularProgressProps },
  kpi: { component: KpiItem, validate: validateKpiProps },
  countUp: { component: CountUpItem, validate: validateCountUpProps },
  reveal: { component: RevealItem, validate: validateRevealProps },
  collapse: { component: ExpandableTextItem, validate: validateExpandableTextProps },
  flipCard: { component: FlipCardItem, validate: validateFlipCardProps },
  carousel: { component: CarouselItem, validate: validateCarouselProps },
  overflowText: { component: OverflowTextItem, validate: validateOverflowTextProps },
  truncatedList: { component: TruncatedListItem, validate: validateTruncatedListProps },
  button: { component: LinkButtonItem, validate: validateLinkButtonProps },
  iconButton: { component: IconLinkButtonItem, validate: validateIconLinkButtonProps },
  accordion: { component: AccordionItem, validate: validateAccordionProps },
  tabs: { component: TabsItem, validate: validateTabsProps },
};

export function getRegistryEntry(type: ComponentType): RegistryEntry | undefined {
  return REGISTRY[type];
}
