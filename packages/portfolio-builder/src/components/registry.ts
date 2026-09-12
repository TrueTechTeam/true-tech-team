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
}

const REGISTRY: Record<ComponentType, RegistryEntry> = {
  heading: {
    component: HeadingItem,
    validate: validateHeadingProps,
    propertySchema: headingPropertySchema,
    defaultProps: headingDefaultProps,
  },
  text: {
    component: TextItem,
    validate: validateTextProps,
    propertySchema: textPropertySchema,
    defaultProps: textDefaultProps,
  },
  image: {
    component: ImageItem,
    validate: validateImageProps,
    propertySchema: imagePropertySchema,
    defaultProps: imageDefaultProps,
  },
  spacer: {
    component: SpacerItem,
    validate: validateSpacerProps,
    propertySchema: spacerPropertySchema,
    defaultProps: spacerDefaultProps,
  },
  card: {
    component: CardItem,
    validate: validateCardProps,
    propertySchema: cardPropertySchema,
    defaultProps: cardDefaultProps,
  },
  badge: {
    component: BadgeItem,
    validate: validateBadgeProps,
    propertySchema: badgePropertySchema,
    defaultProps: badgeDefaultProps,
  },
  avatar: {
    component: AvatarItem,
    validate: validateAvatarProps,
    propertySchema: avatarPropertySchema,
    defaultProps: avatarDefaultProps,
  },
  chip: {
    component: ChipItem,
    validate: validateChipProps,
    propertySchema: chipPropertySchema,
    defaultProps: chipDefaultProps,
  },
  pill: {
    component: PillItem,
    validate: validatePillProps,
    propertySchema: pillPropertySchema,
    defaultProps: pillDefaultProps,
  },
  icon: {
    component: IconItem,
    validate: validateIconProps,
    propertySchema: iconPropertySchema,
    defaultProps: iconDefaultProps,
  },
  statusIndicator: {
    component: StatusIndicatorItem,
    validate: validateStatusIndicatorProps,
    propertySchema: statusIndicatorPropertySchema,
    defaultProps: statusIndicatorDefaultProps,
  },
  progressBar: {
    component: ProgressBarItem,
    validate: validateProgressBarProps,
    propertySchema: progressBarPropertySchema,
    defaultProps: progressBarDefaultProps,
  },
  circularProgress: {
    component: CircularProgressItem,
    validate: validateCircularProgressProps,
    propertySchema: circularProgressPropertySchema,
    defaultProps: circularProgressDefaultProps,
  },
  kpi: {
    component: KpiItem,
    validate: validateKpiProps,
    propertySchema: kpiPropertySchema,
    defaultProps: kpiDefaultProps,
  },
  countUp: {
    component: CountUpItem,
    validate: validateCountUpProps,
    propertySchema: countUpPropertySchema,
    defaultProps: countUpDefaultProps,
  },
  reveal: {
    component: RevealItem,
    validate: validateRevealProps,
    propertySchema: revealPropertySchema,
    defaultProps: revealDefaultProps,
  },
  collapse: {
    component: ExpandableTextItem,
    validate: validateExpandableTextProps,
    propertySchema: expandableTextPropertySchema,
    defaultProps: expandableTextDefaultProps,
  },
  flipCard: {
    component: FlipCardItem,
    validate: validateFlipCardProps,
    propertySchema: flipCardPropertySchema,
    defaultProps: flipCardDefaultProps,
  },
  carousel: { component: CarouselItem, validate: validateCarouselProps },
  overflowText: {
    component: OverflowTextItem,
    validate: validateOverflowTextProps,
    propertySchema: overflowTextPropertySchema,
    defaultProps: overflowTextDefaultProps,
  },
  truncatedList: { component: TruncatedListItem, validate: validateTruncatedListProps },
  button: {
    component: LinkButtonItem,
    validate: validateLinkButtonProps,
    propertySchema: linkButtonPropertySchema,
    defaultProps: linkButtonDefaultProps,
  },
  iconButton: {
    component: IconLinkButtonItem,
    validate: validateIconLinkButtonProps,
    propertySchema: iconLinkButtonPropertySchema,
    defaultProps: iconLinkButtonDefaultProps,
  },
  accordion: {
    component: AccordionItem,
    validate: validateAccordionProps,
    propertySchema: accordionPropertySchema,
    defaultProps: accordionDefaultProps,
  },
  tabs: { component: TabsItem, validate: validateTabsProps },
};

export function getRegistryEntry(type: ComponentType): RegistryEntry | undefined {
  return REGISTRY[type];
}
