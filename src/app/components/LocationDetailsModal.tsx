'use client';

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Database } from '@/lib/supabase/types';
import type { LocationData, TerritoryBounds } from '@/types/location';
import { extractLegacyLocationData } from '@/utils/location';

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'];

interface LocationDetailsModalProps {
  businessHub: BusinessHub | null;
  isOpen: boolean;
  onClose: () => void;
  onLocationUpdate?: (hubId: string, locationData: LocationData, territoryBounds: TerritoryBounds) => void;
  allowEdit?: boolean;
}

export default function LocationDetailsModal({
  businessHub,
  isOpen,
  onClose,
  onLocationUpdate,
  allowEdit = false
}: LocationDetailsModalProps) {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedTerritoryBounds, setSelectedTerritoryBounds] = useState<TerritoryBounds | null>(null);

  // Handle territory selection from embedded mini-modal
  const handleTerritorySelect = useCallback((locationData: LocationData, territoryBounds: TerritoryBounds) => {
    setSelectedLocation(locationData);
    setSelectedTerritoryBounds(territoryBounds);
  }, []);

  // Save location updates
  const handleSaveLocation = useCallback(async () => {
    if (!selectedLocation || !selectedTerritoryBounds || !onLocationUpdate || !businessHub) return;

    setIsUpdatingLocation(true);
    try {
      await onLocationUpdate(businessHub.id, selectedLocation, selectedTerritoryBounds);
      setIsEditMode(false);
      setSelectedLocation(null);
      setSelectedTerritoryBounds(null);
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setIsUpdatingLocation(false);
    }
  }, [selectedLocation, selectedTerritoryBounds, onLocationUpdate, businessHub]);

  // Get current GPS location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation || !businessHub) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocationData: LocationData = {
          display: `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          coordinates: { lat: latitude, lng: longitude },
          accuracy_meters: accuracy,
          source: 'gps',
          validation_status: 'pending',
          administrative: {
            municipality: businessHub.municipality,
            province: businessHub.province,
          },
          territory: {
            radius_km: 15,
            is_within_bounds: true,
            distance_from_center: 0,
            selected_at: new Date().toISOString(),
          },
        };

        const newTerritoryBounds: TerritoryBounds = {
          centerLat: latitude,
          centerLng: longitude,
          radiusKm: 15,
        };

        setSelectedLocation(newLocationData);
        setSelectedTerritoryBounds(newTerritoryBounds);
      },
      (error) => {
        console.error('GPS error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [businessHub]);

  // EARLY RETURN AFTER ALL HOOKS - this fixes the React Hooks order violation
  if (!isOpen || !businessHub) return null;

  // Extract location data using utility functions that handle JSONB structure
  const locationInfo = extractLegacyLocationData(businessHub);
  const locationData = businessHub.location ? (businessHub.location as unknown as LocationData) : null;
  const coordinates = locationInfo.coordinates;
  const territoryBoundaries = businessHub.territory_boundaries as any;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Location' : 'Location Details'}
              </h2>
              {!isEditMode && allowEdit && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Edit Location
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditMode && (
                <>
                  <button
                    onClick={handleGetCurrentLocation}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    📍 Get GPS
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedLocation(null);
                      setSelectedTerritoryBounds(null);
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Business Hub Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{businessHub.name}</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">BHCODE:</span>
                    <span className="ml-2 text-gray-900">{businessHub.bhcode}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Manager:</span>
                    <span className="ml-2 text-gray-900">{businessHub.manager_name || 'N/A'}</span>
                  </div>
                  {businessHub.territory_name && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Territory Name:</span>
                      <span className="ml-2 text-gray-900">{businessHub.territory_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hierarchical Address */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Administrative Location</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Province:</span>
                    <span className="ml-2 text-blue-900">{businessHub.province}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Municipality:</span>
                    <span className="ml-2 text-blue-900">{businessHub.municipality}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Coordinates */}
            {(coordinates || selectedLocation) && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  GPS Coordinates {selectedLocation && <span className="text-blue-600">(Pending Update)</span>}
                </h4>
                <div className={`p-4 rounded-lg ${
                  selectedLocation ? 'bg-blue-50 border-2 border-blue-200' : 'bg-green-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {(() => {
                      const coords = selectedLocation?.coordinates || coordinates!;
                      const colorClass = selectedLocation ? 'text-blue' : 'text-green';
                      return (
                        <>
                          <div>
                            <span className={`font-medium ${colorClass}-700`}>Latitude:</span>
                            <span className={`ml-2 ${colorClass}-900 font-mono`}>{coords.lat.toFixed(6)}</span>
                          </div>
                          <div>
                            <span className={`font-medium ${colorClass}-700`}>Longitude:</span>
                            <span className={`ml-2 ${colorClass}-900 font-mono`}>{coords.lng.toFixed(6)}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className={`font-medium ${colorClass}-700`}>Coordinates:</span>
                            <span className={`ml-2 ${colorClass}-900 font-mono`}>
                              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                            </span>
                            <button
                              onClick={() => {
                                const coordString = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
                                navigator.clipboard.writeText(coordString);
                              }}
                              className={`ml-2 ${colorClass}-600 hover:${colorClass}-800 underline text-xs`}
                            >
                              Copy
                            </button>
                          </div>
                          {selectedLocation && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-blue-700">Source:</span>
                              <span className="ml-2 text-blue-900 capitalize">{selectedLocation.source}</span>
                              {selectedLocation.accuracy_meters && (
                                <span className="ml-3 text-blue-700">
                                  Accuracy: {selectedLocation.accuracy_meters.toFixed(1)}m
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Plus Code & Enhanced Location Data */}
            {(locationInfo.plus_code || locationInfo.formatted_address || locationInfo.location_accuracy_meters) && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Enhanced Location Data</h4>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {locationInfo.plus_code && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-orange-700">Plus Code:</span>
                        <span className="ml-2 text-orange-900 font-mono bg-orange-100 px-2 py-1 rounded">
                          {locationInfo.plus_code}
                        </span>
                        <a
                          href={`https://plus.codes/${locationInfo.plus_code.split(' ')[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-orange-600 hover:text-orange-800 underline text-xs"
                          title={`Open ${locationInfo.plus_code.split(' ')[0]} in Plus Codes`}
                        >
                          Open Plus Code ↗
                        </a>
                      </div>
                    )}
                    {locationInfo.formatted_address && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-orange-700">Formatted Address:</span>
                        <span className="ml-2 text-orange-900">{locationInfo.formatted_address}</span>
                      </div>
                    )}
                    {locationInfo.location_accuracy_meters && (
                      <div>
                        <span className="font-medium text-orange-700">Location Accuracy:</span>
                        <span className="ml-2 text-orange-900">
                          {locationInfo.location_accuracy_meters} meters
                          {locationInfo.location_accuracy_meters <= 10 && (
                            <span className="ml-1 text-green-600 font-medium">⭐ High Accuracy</span>
                          )}
                        </span>
                      </div>
                    )}
                    {locationInfo.location_source && (
                      <div>
                        <span className="font-medium text-orange-700">Location Source:</span>
                        <span className="ml-2 text-orange-900 capitalize">{locationInfo.location_source.replace('_', ' ')}</span>
                      </div>
                    )}
                    {locationInfo.distance_from_center !== null && (
                      <div>
                        <span className="font-medium text-orange-700">Distance from Center:</span>
                        <span className="ml-2 text-orange-900">{locationInfo.distance_from_center} km</span>
                      </div>
                    )}
                    {locationInfo.location_selected_at && (
                      <div>
                        <span className="font-medium text-orange-700">Location Selected:</span>
                        <span className="ml-2 text-orange-900">
                          {new Date(locationInfo.location_selected_at).toLocaleDateString()} at{' '}
                          {new Date(locationInfo.location_selected_at).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location Validation Status */}
            {(locationInfo.location_validation_status || locationInfo.is_within_territory_bounds !== null) && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Location Validation</h4>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {locationInfo.location_validation_status && (
                      <div>
                        <span className="font-medium text-indigo-700">Validation Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          locationInfo.location_validation_status === 'valid'
                            ? 'bg-green-100 text-green-800'
                            : locationInfo.location_validation_status === 'invalid'
                            ? 'bg-red-100 text-red-800'
                            : locationInfo.location_validation_status === 'needs_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {locationInfo.location_validation_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    )}
                    {locationInfo.is_within_territory_bounds !== null && (
                      <div>
                        <span className="font-medium text-indigo-700">Within Territory:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          locationInfo.is_within_territory_bounds
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {locationInfo.is_within_territory_bounds ? '✓ YES' : '✗ NO'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Validation Actions */}
                  {locationInfo.location_validation_status === 'needs_review' && (
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <p className="text-xs text-indigo-600 mb-2">This location requires admin review:</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                          Approve Location
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                          Reject Location
                        </button>
                        <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors">
                          Request Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Territory Boundaries */}
            {territoryBoundaries && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Territory Boundaries</h4>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {territoryBoundaries.centerLat && territoryBoundaries.centerLng && (
                      <>
                        <div>
                          <span className="font-medium text-purple-700">Center Latitude:</span>
                          <span className="ml-2 text-purple-900 font-mono">{territoryBoundaries.centerLat.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700">Center Longitude:</span>
                          <span className="ml-2 text-purple-900 font-mono">{territoryBoundaries.centerLng.toFixed(6)}</span>
                        </div>
                      </>
                    )}
                    {territoryBoundaries.radiusKm && (
                      <div>
                        <span className="font-medium text-purple-700">Radius:</span>
                        <span className="ml-2 text-purple-900">{territoryBoundaries.radiusKm} km</span>
                      </div>
                    )}
                    {territoryBoundaries.polygonPoints && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-purple-700">Polygon Points:</span>
                        <span className="ml-2 text-purple-900">{territoryBoundaries.polygonPoints.length} points defined</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Links */}
            {coordinates && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">External Links</h4>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Open in Google Maps
                  </a>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View on OpenStreetMap
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between p-6 border-t border-gray-200">
            <div>
              {isEditMode && selectedLocation && (
                <div className="text-sm text-gray-600">
                  📍 New location selected. Click "Save Changes" to update.
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {isEditMode && selectedLocation && (
                <button
                  onClick={handleSaveLocation}
                  disabled={isUpdatingLocation}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUpdatingLocation ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {isEditMode ? 'Cancel' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}