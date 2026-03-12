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
  user_created?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string | null;
  // Computed field — not stored in Directus, populated by the assets service
  distance_miles?: number;
}

export interface SwapSchema {
  assets: Asset[];
  exchanges: Exchange[];
  exchange_messages: ExchangeMessage[];
}

export type ExchangeStatus = 'pending' | 'active' | 'completed' | 'declined';

export interface ExchangeUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Exchange {
  id: number;
  status: ExchangeStatus;
  asset: Pick<Asset, 'id' | 'title' | 'type' | 'thumbnail' | 'asset_status'>;
  initiator: ExchangeUser;
  owner: ExchangeUser;
  date_created: string;
  date_updated: string;
}

export interface ExchangeMessage {
  id: number;
  exchange: number;
  sender: ExchangeUser;
  content: string;
  date_created: string;
}