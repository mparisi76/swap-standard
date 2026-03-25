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
  offering_tags?: string | null;
  seeking_tags?: string | null;
  featured_until?: string | null;
  // Computed field — not stored in Directus, populated by the assets service
  distance_miles?: number;
}

export type ChainTradeStatus = 'suggested' | 'pending' | 'completed' | 'expired' | 'declined';

export interface ChainTradeAsset {
  id: number;
  title: string;
  location_label: string | null;
  user_created: { id: string; first_name: string | null; last_name: string | null };
}

export interface ChainTrade {
  id: number;
  chain_status: ChainTradeStatus;
  asset_a: number | ChainTradeAsset;
  asset_b: number | ChainTradeAsset;
  asset_c: number | ChainTradeAsset;
  user_a: string;
  user_b: string;
  user_c: string;
  accepted_a: boolean;
  accepted_b: boolean;
  accepted_c: boolean;
  date_created: string;
  date_updated: string;
}

export type DirectMatchStatus = 'suggested' | 'accepted_both' | 'declined';

export interface DirectMatchAsset {
  id: number;
  title: string;
  location_label: string | null;
  seeking_tags: string | null;
  user_created: { id: string; first_name: string | null; last_name: string | null } | null;
}

export interface DirectMatch {
  id: number;
  match_status: DirectMatchStatus;
  asset_a: number | DirectMatchAsset;
  asset_b: number | DirectMatchAsset;
  user_a: string;
  user_b: string;
  accepted_a: boolean;
  accepted_b: boolean;
  date_created: string;
}

export interface SwapSchema {
  assets: Asset[];
  exchanges: Exchange[];
  exchange_messages: ExchangeMessage[];
  chain_trades: ChainTrade[];
}

export type ExchangeStatus = 'pending' | 'active' | 'completed' | 'declined' | 'cancelled';

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