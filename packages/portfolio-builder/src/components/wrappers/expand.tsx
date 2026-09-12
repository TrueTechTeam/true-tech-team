'use client';

import { useState } from 'react';
import {
  Collapse,
  NavLink,
  Accordion,
  Reveal,
  FlipCard,
  type RevealProps,
} from '@true-tech-team/react-components';
import type { PropertySchema } from '../../properties/types';

export interface ExpandableTextItemProps {
  title: string;
  body: string;
  defaultOpen?: boolean;
}

export function validateExpandableTextProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.title !== 'string' || props.title.length === 0) {
    errors.push('title is required and must be a non-empty string');
  }
  if (typeof props.body !== 'string' || props.body.length === 0) {
    errors.push('body is required and must be a non-empty string');
  }
  return errors;
}

export function ExpandableTextItem(props: Record<string, unknown>) {
  const title = typeof props.title === 'string' ? props.title : '';
  const body = typeof props.body === 'string' ? props.body : '';
  const [isOpen, setIsOpen] = useState(props.defaultOpen === true);
  return (
    <div>
      <NavLink
        href="#"
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((previous) => !previous);
        }}
        aria-expanded={isOpen}
      >
        {title}
      </NavLink>
      <Collapse isOpen={isOpen}>
        <p hidden={!isOpen}>{body}</p>
      </Collapse>
    </div>
  );
}

export interface AccordionItemProps {
  header: string;
  body: string;
  defaultOpen?: boolean;
}

export function validateAccordionProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.header !== 'string' || props.header.length === 0) {
    errors.push('header is required and must be a string');
  }
  if (typeof props.body !== 'string' || props.body.length === 0) {
    errors.push('body is required and must be a string');
  }
  return errors;
}

export function AccordionItem(props: Record<string, unknown>) {
  const header = typeof props.header === 'string' ? props.header : '';
  const body = typeof props.body === 'string' ? props.body : '';
  const defaultOpen = props.defaultOpen === true;
  return (
    <Accordion header={header} defaultOpen={defaultOpen}>
      {body}
    </Accordion>
  );
}

export interface RevealItemProps {
  text: string;
  animation?: RevealProps['animation'];
  playOnMount?: boolean;
}

export function validateRevealProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

export function RevealItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const animation =
    typeof props.animation === 'string' ? (props.animation as RevealProps['animation']) : undefined;
  const playOnMount = props.playOnMount === true;
  return (
    <Reveal animation={animation} playOnMount={playOnMount}>
      <p>{text}</p>
    </Reveal>
  );
}

export interface FlipCardItemProps {
  frontText: string;
  backText: string;
  height?: number;
  width?: number;
}

export function validateFlipCardProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.frontText !== 'string' || props.frontText.length === 0) {
    errors.push('frontText is required and must be a string');
  }
  if (typeof props.backText !== 'string' || props.backText.length === 0) {
    errors.push('backText is required and must be a string');
  }
  return errors;
}

export function FlipCardItem(props: Record<string, unknown>) {
  const frontText = typeof props.frontText === 'string' ? props.frontText : '';
  const backText = typeof props.backText === 'string' ? props.backText : '';
  const height = typeof props.height === 'number' ? props.height : 240;
  const width = typeof props.width === 'number' ? props.width : undefined;
  return (
    <FlipCard
      height={height}
      width={width}
      front={<div>{frontText}</div>}
      back={<div>{backText}</div>}
    />
  );
}

export const expandableTextPropertySchema: PropertySchema = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'body', label: 'Body', type: 'textarea', required: true },
  { key: 'defaultOpen', label: 'Open by default', type: 'boolean' },
];

export const accordionPropertySchema: PropertySchema = [
  { key: 'header', label: 'Header', type: 'text', required: true },
  { key: 'body', label: 'Body', type: 'textarea', required: true },
  { key: 'defaultOpen', label: 'Open by default', type: 'boolean' },
];

export const revealPropertySchema: PropertySchema = [
  { key: 'text', label: 'Text', type: 'text', required: true },
  {
    key: 'animation',
    label: 'Animation',
    type: 'select',
    options: [
      { value: 'fade', label: 'Fade' },
      { value: 'slideUp', label: 'Slide up' },
      { value: 'slideDown', label: 'Slide down' },
      { value: 'slideLeft', label: 'Slide left' },
      { value: 'slideRight', label: 'Slide right' },
      { value: 'zoom', label: 'Zoom' },
      { value: 'zoomIn', label: 'Zoom in' },
      { value: 'zoomOut', label: 'Zoom out' },
    ],
  },
  { key: 'playOnMount', label: 'Play on mount', type: 'boolean' },
];

export const flipCardPropertySchema: PropertySchema = [
  { key: 'frontText', label: 'Front text', type: 'textarea', required: true },
  { key: 'backText', label: 'Back text', type: 'textarea', required: true },
  { key: 'height', label: 'Height (px)', type: 'number', min: 0 },
  { key: 'width', label: 'Width (px)', type: 'number', min: 0 },
];
