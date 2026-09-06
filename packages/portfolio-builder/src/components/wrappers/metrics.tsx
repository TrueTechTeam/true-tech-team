import {
  ProgressBar,
  CircularProgress,
  KPI,
  CountUp,
  type KPIProps,
} from '@true-tech-team/react-components';

export interface ProgressBarItemProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export function validateProgressBarProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.value !== 'number') {
    errors.push('value is required and must be a number');
  }
  return errors;
}

export function ProgressBarItem(props: Record<string, unknown>) {
  const value = typeof props.value === 'number' ? props.value : 0;
  const max = typeof props.max === 'number' ? props.max : undefined;
  const label = typeof props.label === 'string' ? props.label : undefined;
  const showValue = props.showValue === true;
  return <ProgressBar value={value} max={max} label={label} showValue={showValue} />;
}

export interface CircularProgressItemProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export function validateCircularProgressProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.value !== 'number') {
    errors.push('value is required and must be a number');
  }
  return errors;
}

export function CircularProgressItem(props: Record<string, unknown>) {
  const value = typeof props.value === 'number' ? props.value : 0;
  const max = typeof props.max === 'number' ? props.max : undefined;
  const label = typeof props.label === 'string' ? props.label : undefined;
  const showValue = props.showValue === true;
  return <CircularProgress value={value} max={max} label={label} showValue={showValue} />;
}

export interface KpiItemProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changeText?: string;
  changeType?: KPIProps['changeType'];
}

export function validateKpiProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.title !== 'string' || props.title.length === 0) {
    errors.push('title is required and must be a string');
  }
  if (typeof props.value !== 'string' && typeof props.value !== 'number') {
    errors.push('value is required and must be a string or number');
  }
  return errors;
}

export function KpiItem(props: Record<string, unknown>) {
  const title = typeof props.title === 'string' ? props.title : '';
  const value =
    typeof props.value === 'string' || typeof props.value === 'number' ? props.value : '';
  const subtitle = typeof props.subtitle === 'string' ? props.subtitle : undefined;
  const change = typeof props.changeText === 'string' ? props.changeText : undefined;
  const changeType =
    typeof props.changeType === 'string' ? (props.changeType as KPIProps['changeType']) : undefined;
  return (
    // eslint-disable-next-line react/jsx-pascal-case
    <KPI title={title} value={value} subtitle={subtitle} change={change} changeType={changeType} />
  );
}

export interface CountUpItemProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function validateCountUpProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.value !== 'number') {
    errors.push('value is required and must be a number');
  }
  return errors;
}

export function CountUpItem(props: Record<string, unknown>) {
  const value = typeof props.value === 'number' ? props.value : 0;
  const prefix = typeof props.prefix === 'string' ? props.prefix : undefined;
  const suffix = typeof props.suffix === 'string' ? props.suffix : undefined;
  const decimals = typeof props.decimals === 'number' ? props.decimals : undefined;
  return <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />;
}
