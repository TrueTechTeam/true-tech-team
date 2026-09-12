import type { ComponentType } from '../schema/types';
import type { PropertySchema } from '../properties/types';
import { HeadingItem, validateHeadingProps, headingPropertySchema } from './primitives/Heading';
import { TextItem, validateTextProps, textPropertySchema } from './primitives/Text';
import { ImageItem, validateImageProps, imagePropertySchema } from './primitives/Image';
import { SpacerItem, validateSpacerProps, spacerPropertySchema } from './primitives/Spacer';
import {
  LinkButtonItem,
  validateLinkButtonProps,
  linkButtonPropertySchema,
  IconLinkButtonItem,
  validateIconLinkButtonProps,
  iconLinkButtonPropertySchema,
} from './wrappers/links';
import {
  BadgeItem,
  validateBadgeProps,
  badgePropertySchema,
  ChipItem,
  validateChipProps,
  chipPropertySchema,
  PillItem,
  validatePillProps,
  pillPropertySchema,
  StatusIndicatorItem,
  validateStatusIndicatorProps,
  statusIndicatorPropertySchema,
  IconItem,
  validateIconProps,
  iconPropertySchema,
} from './wrappers/display';
import { AvatarItem, validateAvatarProps, avatarPropertySchema } from './wrappers/avatar';
import {
  ProgressBarItem,
  validateProgressBarProps,
  progressBarPropertySchema,
  CircularProgressItem,
  validateCircularProgressProps,
  circularProgressPropertySchema,
  KpiItem,
  validateKpiProps,
  kpiPropertySchema,
  CountUpItem,
  validateCountUpProps,
  countUpPropertySchema,
} from './wrappers/metrics';
import { CardItem, validateCardProps, cardPropertySchema } from './wrappers/card';
import {
  ExpandableTextItem,
  validateExpandableTextProps,
  expandableTextPropertySchema,
  AccordionItem,
  validateAccordionProps,
  accordionPropertySchema,
  RevealItem,
  validateRevealProps,
  revealPropertySchema,
  FlipCardItem,
  validateFlipCardProps,
  flipCardPropertySchema,
} from './wrappers/expand';
import {
  CarouselItem,
  validateCarouselProps,
  TabsItem,
  validateTabsProps,
  OverflowTextItem,
  validateOverflowTextProps,
  overflowTextPropertySchema,
  TruncatedListItem,
  validateTruncatedListProps,
} from './wrappers/lists';

export interface RegistryEntry {
  component: (props: Record<string, unknown>) => React.ReactElement | null;
  validate: (props: Record<string, unknown>) => string[];
  propertySchema?: PropertySchema;
}

const REGISTRY: Record<ComponentType, RegistryEntry> = {
  heading: {
    component: HeadingItem,
    validate: validateHeadingProps,
    propertySchema: headingPropertySchema,
  },
  text: { component: TextItem, validate: validateTextProps, propertySchema: textPropertySchema },
  image: {
    component: ImageItem,
    validate: validateImageProps,
    propertySchema: imagePropertySchema,
  },
  spacer: {
    component: SpacerItem,
    validate: validateSpacerProps,
    propertySchema: spacerPropertySchema,
  },
  card: { component: CardItem, validate: validateCardProps, propertySchema: cardPropertySchema },
  badge: {
    component: BadgeItem,
    validate: validateBadgeProps,
    propertySchema: badgePropertySchema,
  },
  avatar: {
    component: AvatarItem,
    validate: validateAvatarProps,
    propertySchema: avatarPropertySchema,
  },
  chip: { component: ChipItem, validate: validateChipProps, propertySchema: chipPropertySchema },
  pill: { component: PillItem, validate: validatePillProps, propertySchema: pillPropertySchema },
  icon: { component: IconItem, validate: validateIconProps, propertySchema: iconPropertySchema },
  statusIndicator: {
    component: StatusIndicatorItem,
    validate: validateStatusIndicatorProps,
    propertySchema: statusIndicatorPropertySchema,
  },
  progressBar: {
    component: ProgressBarItem,
    validate: validateProgressBarProps,
    propertySchema: progressBarPropertySchema,
  },
  circularProgress: {
    component: CircularProgressItem,
    validate: validateCircularProgressProps,
    propertySchema: circularProgressPropertySchema,
  },
  kpi: { component: KpiItem, validate: validateKpiProps, propertySchema: kpiPropertySchema },
  countUp: {
    component: CountUpItem,
    validate: validateCountUpProps,
    propertySchema: countUpPropertySchema,
  },
  reveal: {
    component: RevealItem,
    validate: validateRevealProps,
    propertySchema: revealPropertySchema,
  },
  collapse: {
    component: ExpandableTextItem,
    validate: validateExpandableTextProps,
    propertySchema: expandableTextPropertySchema,
  },
  flipCard: {
    component: FlipCardItem,
    validate: validateFlipCardProps,
    propertySchema: flipCardPropertySchema,
  },
  carousel: { component: CarouselItem, validate: validateCarouselProps },
  overflowText: {
    component: OverflowTextItem,
    validate: validateOverflowTextProps,
    propertySchema: overflowTextPropertySchema,
  },
  truncatedList: { component: TruncatedListItem, validate: validateTruncatedListProps },
  button: {
    component: LinkButtonItem,
    validate: validateLinkButtonProps,
    propertySchema: linkButtonPropertySchema,
  },
  iconButton: {
    component: IconLinkButtonItem,
    validate: validateIconLinkButtonProps,
    propertySchema: iconLinkButtonPropertySchema,
  },
  accordion: {
    component: AccordionItem,
    validate: validateAccordionProps,
    propertySchema: accordionPropertySchema,
  },
  tabs: { component: TabsItem, validate: validateTabsProps },
};

export function getRegistryEntry(type: ComponentType): RegistryEntry | undefined {
  return REGISTRY[type];
}
