'use client';

import { DndProvider } from '@true-tech-team/react-components';

export interface PageDragDropContainerProps {
  children: React.ReactNode;
}

export function PageDragDropContainer({ children }: PageDragDropContainerProps) {
  return <DndProvider>{children}</DndProvider>;
}
