declare module "leaflet" {
  export interface LatLng {
    lat: number;
    lng: number;
  }

  export type LatLngExpression = [number, number] | LatLng;

  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
    [key: string]: unknown;
  }

  export interface Map {
    setView(center: LatLngExpression, zoom: number): Map;
    addTo(map: Map): Map;
    removeLayer(layer: TileLayer | Marker): void;
    on(event: string, handler: () => void): void;
    invalidateSize(): void;
    remove(): void;
    flyTo(latlng: LatLngExpression, zoom?: number, options?: { animate?: boolean; duration?: number }): void;
    fitBounds(bounds: LatLngBounds, options?: { pad?: number }): void;
    zoomIn(): void;
    zoomOut(): void;
  }

  export interface TileLayer {
    addTo(map: Map): TileLayer;
  }

  export interface IconOptions {
    iconRetinaUrl?: string;
    iconUrl?: string;
    shadowUrl?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    html?: string;
    className?: string;
  }

  export interface IconDefault {
    prototype: Record<string, unknown> & {
      _getIconUrl?: () => string;
    };
    mergeOptions(options: IconOptions): void;
  }

  export interface Icon {
    Default: IconDefault;
  }

  export interface DivIconOptions {
    html?: string;
    className?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }

  export interface DivIcon {}

  export interface MarkerOptions {
    icon?: DivIcon;
  }

  export interface Marker {
    addTo(map: Map): Marker;
    bindPopup(content: string): Marker;
    openPopup(): Marker;
    on(event: string, handler: () => void): void;
  }

  export interface LatLngBounds {
    pad(bufferRatio: number): LatLngBounds;
  }

  export interface FeatureGroup {
    getBounds(): LatLngBounds;
  }

  export interface LeafletStatic {
    map(element: HTMLElement | null, options?: MapOptions): Map;
    tileLayer(urlTemplate: string, options?: Record<string, unknown>): TileLayer;
    Icon: Icon;
    divIcon(options: DivIconOptions): DivIcon;
    marker(latlng: LatLngExpression, options?: MarkerOptions): Marker;
    featureGroup(layers: Marker[]): FeatureGroup;
  }

  const L: LeafletStatic;
  export default L;
}

declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}
