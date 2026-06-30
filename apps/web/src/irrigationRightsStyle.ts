import Feature from 'ol/Feature';
import type { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style } from 'ol/style';

export const IRRIGATION_RIGHT_FIELDS = ['Tipo_der_r', 'Concesion', 'tipo_der_r'];

export interface IrrigationRightCategory {
  key: string;
  label: string;
  stroke: string;
  fill: string;
  pattern: 'horizontal-vertical' | 'dots' | 'horizontal' | 'diagonal-45' | 'vertical' | 'diagonal-135' | 'none' | 'cross-diagonal' | 'solid';
}

export const IRRIGATION_RIGHT_CATEGORIES: IrrigationRightCategory[] = [
  { key: 'Aguas Subterraneas', label: 'Aguas Subterraneas', stroke: '#1f78b4', fill: '#1f78b4', pattern: 'horizontal-vertical' },
  { key: 'Cultivo clandestino', label: 'Cultivo clandestino', stroke: '#e31a1c', fill: '#e31a1c', pattern: 'dots' },
  { key: 'Definitivo', label: 'Definitivo', stroke: '#1f78b4', fill: '#1f78b4', pattern: 'horizontal' },
  { key: 'Desague', label: 'Desague', stroke: '#1f78b4', fill: '#1f78b4', pattern: 'diagonal-45' },
  { key: 'Eventual', label: 'Eventual', stroke: '#1f78b4', fill: '#1f78b4', pattern: 'vertical' },
  { key: 'Privado', label: 'Privado', stroke: '#1f78b4', fill: '#1f78b4', pattern: 'diagonal-135' },
  { key: 'Sin derecho', label: 'Sin derecho', stroke: '#111111', fill: 'rgba(255,255,255,0)', pattern: 'none' },
  { key: 'Sobrante', label: 'Sobrante', stroke: '#1f78b4', fill: '#1f78b4', pattern: 'cross-diagonal' },
  { key: 'NULL', label: 'Sin dato / NULL', stroke: '#3a2f4f', fill: '#b371ec', pattern: 'solid' },
];

const CATEGORY_BY_KEY = new Map(IRRIGATION_RIGHT_CATEGORIES.map((category) => [category.key, category]));

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeIrrigationRightValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const normalized = stripAccents(raw).toLocaleLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized || ['null', 's/d', 'sd', 's d', 'sin dato', 'sin datos'].includes(normalized)) return null;
  if (/aguas?\s+subterraneas?/.test(normalized)) return 'Aguas Subterraneas';
  if (/cultivo\s+clandestino/.test(normalized)) return 'Cultivo clandestino';
  if (/definitiv[oa]/.test(normalized)) return 'Definitivo';
  if (/desague/.test(normalized)) return 'Desague';
  if (/eventual/.test(normalized)) return 'Eventual';
  if (/privad[oa]/.test(normalized)) return 'Privado';
  if (/sin\s+derecho/.test(normalized)) return 'Sin derecho';
  if (/sobrante/.test(normalized)) return 'Sobrante';
  return raw;
}

function featureValue(feature: Feature | FeatureLike, field: string): unknown {
  const candidate = feature as { get?: (key: string) => unknown; getProperties?: () => Record<string, unknown> };
  if (typeof candidate.get === 'function') return candidate.get(field);
  return candidate.getProperties?.()[field];
}

export function irrigationRightFromFeature(feature: Feature | FeatureLike): string | null {
  for (const field of IRRIGATION_RIGHT_FIELDS) {
    const normalized = normalizeIrrigationRightValue(featureValue(feature, field));
    if (normalized) return normalized;
  }
  return null;
}

export function featureHasIrrigationRight(feature: Feature | FeatureLike): boolean {
  return irrigationRightFromFeature(feature) !== null;
}

function createCanvasPattern(draw: (ctx: CanvasRenderingContext2D, size: number) => void): CanvasPattern | string {
  if (typeof document === 'undefined') return 'rgba(31,120,180,0.24)';
  const size = 14;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'rgba(31,120,180,0.24)';
  draw(ctx, size);
  return ctx.createPattern(canvas, 'repeat') ?? 'rgba(31,120,180,0.24)';
}

function linePattern(angles: number[], color: string): CanvasPattern | string {
  return createCanvasPattern((ctx, size) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (const angle of angles) {
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-size / 2, -size / 2);
      for (let offset = -size; offset <= size * 2; offset += 7) {
        ctx.beginPath();
        ctx.moveTo(offset, -size);
        ctx.lineTo(offset, size * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  });
}

function dotPattern(color: string): CanvasPattern | string {
  return createCanvasPattern((ctx, size) => {
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = color;
    for (const [x, y] of [
      [4, 4],
      [11, 10],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function fillForCategory(category: IrrigationRightCategory): CanvasPattern | string {
  switch (category.pattern) {
    case 'horizontal-vertical':
      return linePattern([0, 90], category.fill);
    case 'horizontal':
      return linePattern([0], category.fill);
    case 'vertical':
      return linePattern([90], category.fill);
    case 'diagonal-45':
      return linePattern([45], category.fill);
    case 'diagonal-135':
      return linePattern([135], category.fill);
    case 'cross-diagonal':
      return linePattern([45, 135], category.fill);
    case 'dots':
      return dotPattern(category.fill);
    case 'none':
      return 'rgba(255,255,255,0)';
    case 'solid':
      return 'rgba(179,113,236,0.35)';
    default:
      return 'rgba(31,120,180,0.24)';
  }
}

export function createIrrigationRightStyle() {
  const cache = new Map<string, Style>();
  return (feature: FeatureLike) => {
    const categoryKey = irrigationRightFromFeature(feature) ?? 'NULL';
    const category = CATEGORY_BY_KEY.get(categoryKey) ?? CATEGORY_BY_KEY.get('NULL') ?? IRRIGATION_RIGHT_CATEGORIES.at(-1)!;
    const cached = cache.get(category.key);
    if (cached) return cached;

    const style = new Style({
      fill: new Fill({ color: fillForCategory(category) }),
      stroke: new Stroke({ color: category.stroke === '#111111' ? '#050505' : category.stroke, width: category.key === 'Cultivo clandestino' ? 2 : 1.6 }),
    });
    cache.set(category.key, style);
    return style;
  };
}
