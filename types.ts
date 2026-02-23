
export interface DocumentContent {
  id: string;
  title: string;
  body: string;
  elements: VisualElement[];
}

export interface VisualElement {
  id: string;
  type: 'image' | 'seal' | 'divider' | 'illustration' | 'scenery';
  src: string;
  position: { x: number; y: number };
  alt: string;
  isAnimated?: boolean;
  scale?: number;
  rotation?: number;
}

export enum AIServiceAction {
  REWRITE = 'REWRITE',
  ILLUMINATE = 'ILLUMINATE',
  PROPHESY = 'PROPHESY',
  SEAL = 'SEAL',
  CIPHER = 'CIPHER',
  SCENERY = 'SCENERY',
  ENCHANT = 'ENCHANT'
}
