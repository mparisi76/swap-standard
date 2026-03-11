// types/schema.ts
export type AssetType = 'goods' | 'skills' | 'services';
export type DirectusStatus = 'draft' | 'published' | 'archived';
export type AssetStatus = 'available' | 'pending' | 'unavailable';

export interface GalleryItem {
  directus_files_id: string;
}

export interface Asset {
  id: number;
  status: DirectusStatus;
  title: string;
  type: 'goods' | 'skills' | 'services';
  offering: string;
  seeking: string;
  asset_status: AssetStatus;
  thumbnail: string | null;
  image_gallery: GalleryItem[];
  date_created: string;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string | null;
  // Computed field — not stored in Directus, populated by the assets service
  distance_miles?: number;
}

export interface SwapSchema {
  assets: Asset[];
}