'use client';

import {
  Carousel,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  OverflowText,
  TruncatedList,
} from '@true-tech-team/react-components';
import type { PropertySchema } from '../../properties/types';
import { ImageItem } from '../primitives/Image';
import { PillItem } from './display';

export interface CarouselSlide {
  imageSrc: string;
  alt?: string;
  caption?: string;
}

function isCarouselSlide(value: unknown): value is CarouselSlide {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CarouselSlide).imageSrc === 'string'
  );
}

export interface CarouselItemProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
}

export function validateCarouselProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (
    !Array.isArray(props.slides) ||
    props.slides.length === 0 ||
    !props.slides.every(isCarouselSlide)
  ) {
    errors.push('slides must contain at least one slide');
  }
  return errors;
}

export function CarouselItem(props: Record<string, unknown>) {
  const slides = Array.isArray(props.slides) ? props.slides.filter(isCarouselSlide) : [];
  const autoPlay = props.autoPlay === true;
  return (
    <Carousel autoPlay={autoPlay}>
      {slides.map((slide) => (
        <div key={slide.imageSrc}>
          <ImageItem src={slide.imageSrc} alt={slide.alt ?? ''} />
          {slide.caption ? <p>{slide.caption}</p> : null}
        </div>
      ))}
    </Carousel>
  );
}

export interface TabItem {
  label: string;
  content: string;
}

function isTabItem(value: unknown): value is TabItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TabItem).label === 'string' &&
    typeof (value as TabItem).content === 'string'
  );
}

/**
 * `Tabs` composes TabList/Tab/TabPanel and needs a unique `value` per tab; this wrapper uses
 * each tab's `label` as that value, so labels must be unique within one `tabs` item.
 */
export interface TabsItemProps {
  tabs: TabItem[];
}

export function validateTabsProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!Array.isArray(props.tabs) || props.tabs.length === 0 || !props.tabs.every(isTabItem)) {
    errors.push('tabs must contain at least one tab');
    return errors;
  }
  const labels = props.tabs.map((tab) => tab.label);
  if (new Set(labels).size !== labels.length) {
    errors.push('tab labels must be unique within one tabs item');
  }
  return errors;
}

export function TabsItem(props: Record<string, unknown>) {
  const tabs = Array.isArray(props.tabs) ? props.tabs.filter(isTabItem) : [];
  if (tabs.length === 0) {
    return null;
  }
  return (
    <Tabs defaultValue={tabs[0].label}>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.label} value={tab.label}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.label} value={tab.label}>
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export interface OverflowTextItemProps {
  text: string;
  lines?: number;
}

export function validateOverflowTextProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

export function OverflowTextItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const lines = typeof props.lines === 'number' ? props.lines : undefined;
  return <OverflowText lines={lines}>{text}</OverflowText>;
}

export interface TruncatedListItemProps {
  items: string[];
  maxVisible?: number;
}

export function validateTruncatedListProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (
    !Array.isArray(props.items) ||
    props.items.length === 0 ||
    !props.items.every((item) => typeof item === 'string')
  ) {
    errors.push('items must be a non-empty array of strings');
  }
  return errors;
}

export function TruncatedListItem(props: Record<string, unknown>) {
  const items = Array.isArray(props.items)
    ? props.items.filter((item): item is string => typeof item === 'string')
    : [];
  const maxVisible = typeof props.maxVisible === 'number' ? props.maxVisible : undefined;
  return (
    <TruncatedList
      items={items}
      maxVisible={maxVisible}
      renderItem={(item) => <PillItem label={item} />}
      keyExtractor={(item) => item}
    />
  );
}

export const overflowTextPropertySchema: PropertySchema = [
  { key: 'text', label: 'Text', type: 'textarea', required: true },
  { key: 'lines', label: 'Max lines', type: 'number', min: 1 },
];

export const overflowTextDefaultProps: Record<string, unknown> = {
  text: 'Long text that may overflow and truncate with a fade or ellipsis.',
};
