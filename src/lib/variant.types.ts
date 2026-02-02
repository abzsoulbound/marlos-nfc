// variant.types.ts
// Shared variant system for size / format / extras.

export interface VariantOption {
  id: string;        // e.g. "small", "large", "bottle"
  label: string;     // UI label
  priceDelta: number; // +/- adjustment from base price
}

export interface VariantGroup {
  id: string;              // matches MenuItem.variantGroupId
  title: string;           // UI heading
  required: boolean;       // must pick one
  options: VariantOption[];
}
