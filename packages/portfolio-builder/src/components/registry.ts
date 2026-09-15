import type { ComponentType } from '../schema/types';
import type { PropertySchema } from '../properties/types';
import {
  HeadingItem,
  validateHeadingProps,
  headingPropertySchema,
  headingDefaultProps,
} from './primitives/Heading';
import {
  TextItem,
  validateTextProps,
  textPropertySchema,
  textDefaultProps,
} from './primitives/Text';
import {
  ImageItem,
  validateImageProps,
  imagePropertySchema,
  imageDefaultProps,
} from './primitives/Image';
import {
  SpacerItem,
  validateSpacerProps,
  spacerPropertySchema,
  spacerDefaultProps,
} from './primitives/Spacer';
import {
  LinkButtonItem,
  validateLinkButtonProps,
  linkButtonPropertySchema,
  linkButtonDefaultProps,
  IconLinkButtonItem,
  validateIconLinkButtonProps,
  iconLinkButtonPropertySchema,
  iconLinkButtonDefaultProps,
} from './wrappers/links';
import {
  BadgeItem,
  validateBadgeProps,
  badgePropertySchema,
  badgeDefaultProps,
  ChipItem,
  validateChipProps,
  chipPropertySchema,
  chipDefaultProps,
  PillItem,
  validatePillProps,
  pillPropertySchema,
  pillDefaultProps,
  StatusIndicatorItem,
  validateStatusIndicatorProps,
  statusIndicatorPropertySchema,
  statusIndicatorDefaultProps,
  IconItem,
  validateIconProps,
  iconPropertySchema,
  iconDefaultProps,
} from './wrappers/display';
import {
  AvatarItem,
  validateAvatarProps,
  avatarPropertySchema,
  avatarDefaultProps,
} from './wrappers/avatar';
import {
  ProgressBarItem,
  validateProgressBarProps,
  progressBarPropertySchema,
  progressBarDefaultProps,
  CircularProgressItem,
  validateCircularProgressProps,
  circularProgressPropertySchema,
  circularProgressDefaultProps,
  KpiItem,
  validateKpiProps,
  kpiPropertySchema,
  kpiDefaultProps,
  CountUpItem,
  validateCountUpProps,
  countUpPropertySchema,
  countUpDefaultProps,
} from './wrappers/metrics';
import { CardItem, validateCardProps, cardPropertySchema, cardDefaultProps } from './wrappers/card';
import {
  ExpandableTextItem,
  validateExpandableTextProps,
  expandableTextPropertySchema,
  expandableTextDefaultProps,
  AccordionItem,
  validateAccordionProps,
  accordionPropertySchema,
  accordionDefaultProps,
  RevealItem,
  validateRevealProps,
  revealPropertySchema,
  revealDefaultProps,
  FlipCardItem,
  validateFlipCardProps,
  flipCardPropertySchema,
  flipCardDefaultProps,
} from './wrappers/expand';
import {
  CarouselItem,
  validateCarouselProps,
  TabsItem,
  validateTabsProps,
  OverflowTextItem,
  validateOverflowTextProps,
  overflowTextPropertySchema,
  overflowTextDefaultProps,
  TruncatedListItem,
  validateTruncatedListProps,
} from './wrappers/lists';

export interface RegistryEntry {
  component: (props: Record<string, unknown>) => React.ReactElement | null;
  validate: (props: Record<string, unknown>) => string[];
  propertySchema?: PropertySchema;
  defaultProps?: Record<string, unknown>;
  defaultWidth: number;
}

const REGISTRY: Record<ComponentType, RegistryEntry> = {
  heading: {
    component: HeadingItem,
    validate: validateHeadingProps,
    propertySchema: headingPropertySchema,
    defaultProps: headingDefaultProps,
    defaultWidth: 6,
  },
  text: {
    component: TextItem,
    validate: validateTextProps,
    propertySchema: textPropertySchema,
    defaultProps: textDefaultProps,
    defaultWidth: 6,
  },
  image: {
    component: ImageItem,
    validate: validateImageProps,
    propertySchema: imagePropertySchema,
    defaultProps: imageDefaultProps,
    defaultWidth: 6,
  },
  spacer: {
    component: SpacerItem,
    validate: validateSpacerProps,
    propertySchema: spacerPropertySchema,
    defaultProps: spacerDefaultProps,
    defaultWidth: 12,
  },
  card: {
    component: CardItem,
    validate: validateCardProps,
    propertySchema: cardPropertySchema,
    defaultProps: cardDefaultProps,
    defaultWidth: 4,
  },
  badge: {
    component: BadgeItem,
    validate: validateBadgeProps,
    propertySchema: badgePropertySchema,
    defaultProps: badgeDefaultProps,
    defaultWidth: 2,
  },
  avatar: {
    component: AvatarItem,
    validate: validateAvatarProps,
    propertySchema: avatarPropertySchema,
    defaultProps: avatarDefaultProps,
    defaultWidth: 1,
  },
  chip: {
    component: ChipItem,
    validate: validateChipProps,
    propertySchema: chipPropertySchema,
    defaultProps: chipDefaultProps,
    defaultWidth: 2,
  },
  pill: {
    component: PillItem,
    validate: validatePillProps,
    propertySchema: pillPropertySchema,
    defaultProps: pillDefaultProps,
    defaultWidth: 2,
  },
  icon: {
    component: IconItem,
    validate: validateIconProps,
    propertySchema: iconPropertySchema,
    defaultProps: iconDefaultProps,
    defaultWidth: 1,
  },
  statusIndicator: {
    component: StatusIndicatorItem,
    validate: validateStatusIndicatorProps,
    propertySchema: statusIndicatorPropertySchema,
    defaultProps: statusIndicatorDefaultProps,
    defaultWidth: 3,
  },
  progressBar: {
    component: ProgressBarItem,
    validate: validateProgressBarProps,
    propertySchema: progressBarPropertySchema,
    defaultProps: progressBarDefaultProps,
    defaultWidth: 4,
  },
  circularProgress: {
    component: CircularProgressItem,
    validate: validateCircularProgressProps,
    propertySchema: circularProgressPropertySchema,
    defaultProps: circularProgressDefaultProps,
    defaultWidth: 3,
  },
  kpi: {
    component: KpiItem,
    validate: validateKpiProps,
    propertySchema: kpiPropertySchema,
    defaultProps: kpiDefaultProps,
    defaultWidth: 3,
  },
  countUp: {
    component: CountUpItem,
    validate: validateCountUpProps,
    propertySchema: countUpPropertySchema,
    defaultProps: countUpDefaultProps,
    defaultWidth: 3,
  },
  reveal: {
    component: RevealItem,
    validate: validateRevealProps,
    propertySchema: revealPropertySchema,
    defaultProps: revealDefaultProps,
    defaultWidth: 12,
  },
  collapse: {
    component: ExpandableTextItem,
    validate: validateExpandableTextProps,
    propertySchema: expandableTextPropertySchema,
    defaultProps: expandableTextDefaultProps,
    defaultWidth: 12,
  },
  flipCard: {
    component: FlipCardItem,
    validate: validateFlipCardProps,
    propertySchema: flipCardPropertySchema,
    defaultProps: flipCardDefaultProps,
    defaultWidth: 4,
  },
  carousel: { component: CarouselItem, validate: validateCarouselProps, defaultWidth: 12 },
  overflowText: {
    component: OverflowTextItem,
    validate: validateOverflowTextProps,
    propertySchema: overflowTextPropertySchema,
    defaultProps: overflowTextDefaultProps,
    defaultWidth: 6,
  },
  truncatedList: {
    component: TruncatedListItem,
    validate: validateTruncatedListProps,
    defaultWidth: 6,
  },
  button: {
    component: LinkButtonItem,
    validate: validateLinkButtonProps,
    propertySchema: linkButtonPropertySchema,
    defaultProps: linkButtonDefaultProps,
    defaultWidth: 3,
  },
  iconButton: {
    component: IconLinkButtonItem,
    validate: validateIconLinkButtonProps,
    propertySchema: iconLinkButtonPropertySchema,
    defaultProps: iconLinkButtonDefaultProps,
    defaultWidth: 1,
  },
  accordion: {
    component: AccordionItem,
    validate: validateAccordionProps,
    propertySchema: accordionPropertySchema,
    defaultProps: accordionDefaultProps,
    defaultWidth: 12,
  },
  tabs: { component: TabsItem, validate: validateTabsProps, defaultWidth: 12 },
};

export function getRegistryEntry(type: ComponentType): RegistryEntry | undefined {
  return REGISTRY[type];
}
