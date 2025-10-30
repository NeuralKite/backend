import { ValueTransformer } from 'typeorm';

export class ColumnNumericTransformer implements ValueTransformer {
  to(value?: number | null): number | null {
    if (typeof value === 'number') {
      return value;
    }

    return value ?? null;
  }

  from(value?: string | number | null): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return Number(value);
    }

    return value ?? null;
  }
}
