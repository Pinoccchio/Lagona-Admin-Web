import type { Json } from '@/lib/supabase/types';
import type { LocationData } from '@/types/location';

/**
 * Location validation utilities for extracting data from JSONB structure
 */

// Type guard for JSON value to LocationData
function isLocationData(data: Json): data is LocationData & Json {
  return (
    typeof data === 'object' &&
    data !== null &&
    'coordinates' in data &&
    typeof data.coordinates === 'object' &&
    data.coordinates !== null &&
    'lat' in data.coordinates &&
    'lng' in data.coordinates
  );
}

/**
 * Extract validation status from location JSONB
 */
export function getLocationValidationStatus(location: Json | null): string | null {
  if (!location || !isLocationData(location)) return null;
  return location.validation_status || null;
}

/**
 * Extract territory bounds information from location JSONB
 */
export function getLocationTerritoryBounds(location: Json | null): boolean | null {
  if (!location || !isLocationData(location)) return null;
  return location.territory?.is_within_bounds ?? null;
}

/**
 * Extract location accuracy from location JSONB
 */
export function getLocationAccuracy(location: Json | null): number | null {
  if (!location || !isLocationData(location)) return null;
  return location.accuracy_meters || null;
}

/**
 * Extract location source from location JSONB
 */
export function getLocationSource(location: Json | null): string | null {
  if (!location || !isLocationData(location)) return null;
  return location.source || null;
}

/**
 * Extract coordinates from location JSONB
 */
export function getLocationCoordinates(location: Json | null): { lat: number; lng: number } | null {
  if (!location || !isLocationData(location)) return null;
  const coords = location.coordinates;
  if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    return {
      lat: coords.lat as number,
      lng: coords.lng as number
    };
  }
  return null;
}

/**
 * Extract Plus Code from location JSONB
 */
export function getLocationPlusCode(location: Json | null): string | null {
  if (!location || !isLocationData(location)) return null;
  return location.plus_code || null;
}

/**
 * Extract formatted address from location JSONB
 */
export function getLocationFormattedAddress(location: Json | null): string | null {
  if (!location || !isLocationData(location)) return null;
  return location.display || null;
}

/**
 * Extract distance from center from location JSONB
 */
export function getLocationDistanceFromCenter(location: Json | null): number | null {
  if (!location || !isLocationData(location)) return null;
  return location.territory?.distance_from_center ?? null;
}

/**
 * Extract location selected timestamp from location JSONB
 */
export function getLocationSelectedAt(location: Json | null): string | null {
  if (!location || !isLocationData(location)) return null;
  return location.territory?.selected_at || null;
}

/**
 * Extract administrative location data from location JSONB
 */
export function getLocationAdministrative(location: Json | null) {
  if (!location || !isLocationData(location)) return null;
  return location.administrative || null;
}

/**
 * Legacy fallback for components that still access individual columns
 * This helps maintain backward compatibility
 */
export function extractLegacyLocationData(businessHub: any) {
  const location = businessHub.location;

  return {
    // Primary location data from JSONB
    location_validation_status: getLocationValidationStatus(location),
    is_within_territory_bounds: getLocationTerritoryBounds(location),
    location_accuracy_meters: getLocationAccuracy(location),
    location_source: getLocationSource(location),
    coordinates: getLocationCoordinates(location),
    plus_code: getLocationPlusCode(location),
    formatted_address: getLocationFormattedAddress(location),
    distance_from_center: getLocationDistanceFromCenter(location),
    location_selected_at: getLocationSelectedAt(location),

    // Fallback to individual columns if JSONB data not available
    ...(businessHub.coordinates && !getLocationCoordinates(location) && {
      coordinates: businessHub.coordinates
    }),
    ...(businessHub.plus_code && !getLocationPlusCode(location) && {
      plus_code: businessHub.plus_code
    }),
    ...(businessHub.formatted_address && !getLocationFormattedAddress(location) && {
      formatted_address: businessHub.formatted_address
    })
  };
}