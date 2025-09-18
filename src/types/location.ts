// LocationData interface matching the mobile app's Dart structure
export interface LocationData {
  display: string;
  plus_code?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy_meters?: number;
  source: string;
  validation_status: string;
  administrative: {
    region?: string;
    province?: string;
    municipality?: string;
    barangay?: string;
    zone?: string;
    district?: string;
  };
  territory: {
    radius_km?: number;
    is_within_bounds?: boolean;
    distance_from_center?: number;
    boundaries?: any;
    selected_at?: string;
  };
}

// Territory Bounds interface matching mobile app
export interface TerritoryBounds {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  polygonPoints?: Array<{ lat: number; lng: number }>;
}

// Business Hub Status enum
export type BusinessHubStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// Enhanced BusinessHub interface with location data
export interface EnhancedBusinessHub {
  id: string;
  user_id: string;
  bhcode: string;
  name: string;
  municipality: string;
  province: string;
  territory_boundaries?: TerritoryBounds;
  commission_rate?: number;
  total_revenue?: number;
  created_at?: string;
  updated_at?: string;
  manager_name?: string;
  territory_name?: string;
  current_balance?: number;
  initial_balance?: number;
  uses_system_commission_rate?: boolean;
  created_by?: string;
  last_modified_by?: string;
  admin_notes?: string;

  // New consolidated location field
  location?: LocationData;

  // Status is managed in users table
  users?: {
    email: string;
    full_name: string;
    phone_number?: string;
    status?: string;
  };

  // Statistics (calculated fields)
  loadingStationsCount?: number;
  activeMerchants?: number;
  totalRiders?: number;
  totalOrders?: number;
}

// Form data interface for creating/editing business hubs
export interface BusinessHubFormData {
  name: string;
  municipality: string;
  province: string;
  manager_name: string;
  territory_name?: string;
  phone_number?: string;
  email?: string;
  password?: string;
  initial_load_amount?: number;
  commission_rate?: number;
  admin_notes?: string;

  // Location data
  location?: LocationData;
  territory_boundaries?: TerritoryBounds;
  bhcode?: string;
}

// Plus Code utilities
export interface PlusCodeUtils {
  validate: (plusCode: string) => boolean;
  generate: (lat: number, lng: number, locality: string) => string;
  parse: (plusCode: string) => { lat: number; lng: number } | null;
}

// Location source types
export type LocationSource = 'user_selection' | 'geocoded' | 'gps';

// Location validation status types
export type LocationValidationStatus = 'pending' | 'valid' | 'invalid' | 'needs_review';

// Territory selection utility functions
export interface TerritoryUtils {
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  isWithinBounds: (lat: number, lng: number, center: { lat: number; lng: number }, radiusKm: number) => boolean;
  generateTerritoryName: (administrative: LocationData['administrative']) => string;
}

// Constants for location handling
export const LOCATION_CONSTANTS = {
  DEFAULT_ACCURACY_METERS: 10,
  DEFAULT_TERRITORY_RADIUS_KM: 15,
  MAX_TERRITORY_RADIUS_KM: 50,
  PLUS_CODE_REGEX: /^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2,3}$/i,
  VALIDATION_STATUSES: ['pending', 'valid', 'invalid', 'needs_review'] as const,
  LOCATION_SOURCES: ['user_selection', 'geocoded', 'gps'] as const,
} as const;

export default LocationData;