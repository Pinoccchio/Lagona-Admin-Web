'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { extractLegacyLocationData } from '@/utils/location';
import type { Database } from '@/lib/supabase/types';
import type { LocationData, TerritoryBounds } from '@/types/location';

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'] & {
  // Legacy fields for backward compatibility
  coordinates?: { lat: number; lng: number } | null;
  users?: {
    status?: string;
  };
};

interface MapVisualizationProps {
  // Single hub mode
  businessHub?: BusinessHub | null;
  // Multi-hub mode
  businessHubs?: Array<BusinessHub>;
  // Common props
  isOpen: boolean;
  onClose: () => void;
  onHubSelect?: (hubId: string) => void;
  selectedHubId?: string;
  mode?: 'single' | 'multi';
  title?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapVisualization({
  businessHub,
  businessHubs = [],
  isOpen,
  onClose,
  onHubSelect,
  selectedHubId,
  mode = 'single',
  title
}: MapVisualizationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'active' | 'with-location'>('all');
  const [selectedHub, setSelectedHub] = useState<string | null>(selectedHubId || null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const circlesRef = useRef<Map<string, google.maps.Circle>>(new Map());
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());
  const currentOpenInfoWindow = useRef<google.maps.InfoWindow | null>(null);
  const isMapInitialized = useRef<boolean>(false);
  const googleMapsLoader = useRef<Promise<typeof google> | null>(null);
  const userHasInteracted = useRef<boolean>(false);
  const lastBounds = useRef<string | null>(null);
  const previousHubId = useRef<string | null>(null);

  // Get the data to display based on mode
  const hubsToDisplay = mode === 'multi' ? businessHubs : (businessHub ? [businessHub] : []);

  // Filter hubs based on active layer
  const filteredHubs = hubsToDisplay.filter(hub => {
    switch (activeLayer) {
      case 'active':
        return hub.users?.status === 'active' || (!hub.users && mode === 'single');
      case 'with-location':
        const locationInfo = extractLegacyLocationData(hub);
        return locationInfo.coordinates;
      default:
        return true;
    }
  });

  // Handle hub selection with debouncing
  const handleHubClick = useCallback((hubId: string) => {
    setSelectedHub(hubId);
    onHubSelect?.(hubId);
  }, [onHubSelect]);


  // Create optimized marker icons with smooth transitions
  const createMarkerIcon = useCallback((hub: typeof hubsToDisplay[0], isSelected: boolean) => {
    const statusColor = getHubStatusColor(hub);
    return {
      url: 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${statusColor}" style="transition: all 0.3s ease;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          ${isSelected ? '<circle cx="12" cy="9" r="1" fill="white"/>' : ''}
        </svg>
      `),
      scaledSize: new google.maps.Size(isSelected ? 36 : 32, isSelected ? 36 : 32),
      anchor: new google.maps.Point(isSelected ? 18 : 16, isSelected ? 36 : 32)
    };
  }, []);

  // Update existing marker appearance without recreating
  const updateMarkerAppearance = useCallback((hub: typeof hubsToDisplay[0], marker: google.maps.Marker, isSelected: boolean) => {
    const newIcon = createMarkerIcon(hub, isSelected);
    marker.setIcon(newIcon);

    // Update territory circle if it exists
    const circle = circlesRef.current.get(hub.id);
    if (circle) {
      const statusColor = getHubStatusColor(hub);
      circle.setOptions({
        strokeWeight: isSelected ? 3 : 2,
        fillOpacity: isSelected ? 0.15 : 0.1,
        strokeColor: statusColor,
        fillColor: statusColor
      });
    }
  }, [createMarkerIcon]);

  // Create new marker for hub
  const createMarkerForHub = useCallback((hub: typeof hubsToDisplay[0], isSelected: boolean) => {
    if (!mapInstance.current) return;

    const hubLocationInfo = extractLegacyLocationData(hub);
    let coordinates: { lat: number; lng: number };

    if (hubLocationInfo.coordinates) {
      coordinates = hubLocationInfo.coordinates;
    } else if (hub.territory_boundaries) {
      const boundaries = hub.territory_boundaries as any;
      coordinates = { lat: boundaries.centerLat, lng: boundaries.centerLng };
    } else {
      return;
    }

    const marker = new google.maps.Marker({
      position: coordinates,
      map: mapInstance.current,
      title: hub.name,
      icon: createMarkerIcon(hub, isSelected),
      animation: google.maps.Animation.DROP // Smooth drop animation
    });

    markersRef.current.set(hub.id, marker);

    // Create info window
    const plusCode = hubLocationInfo.plus_code;
    const statusLabel = hub.users?.status ? hub.users.status.toUpperCase() : 'UNKNOWN';
    const statusColor = getHubStatusColor(hub);

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">${hub.name}</h3>
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Code:</strong> ${hub.bhcode}</p>
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${statusLabel}</span></p>
          ${territoryRadius ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Territory:</strong> <span style="color: #f59e0b; font-weight: 600;">${territoryRadius}km radius</span></p>` : ''}
          ${plusCode ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Plus Code:</strong> ${plusCode}</p>` : `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Location:</strong> ${hub.municipality}, ${hub.province}</p>`}
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Manager:</strong> ${hub.manager_name || 'N/A'}</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Coordinates:</strong> ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}</p>
          ${mode === 'multi' ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6; cursor: pointer;" onclick="window.selectBusinessHub('${hub.id}')">Click to select →</p>` : ''}
        </div>
      `
    });

    infoWindowsRef.current.set(hub.id, infoWindow);

    // Show info window for single mode or selected hub
    if (mode === 'single' || isSelected) {
      if (currentOpenInfoWindow.current && currentOpenInfoWindow.current !== infoWindow) {
        currentOpenInfoWindow.current.close();
      }
      infoWindow.open(mapInstance.current, marker);
      currentOpenInfoWindow.current = infoWindow;
    }

    // Add click listener
    marker.addListener('click', () => {
      if (currentOpenInfoWindow.current && currentOpenInfoWindow.current !== infoWindow) {
        currentOpenInfoWindow.current.close();
      }
      infoWindow.open(mapInstance.current, marker);
      currentOpenInfoWindow.current = infoWindow;

      if (mode === 'multi') {
        handleHubClick(hub.id);
      }
    });

    // Add territory boundary circle if available
    const hubLocationData = hub.location ? (hub.location as unknown as LocationData) : null;
    const territoryRadius = hubLocationData?.territory.radius_km ||
                          (hub.territory_boundaries as any)?.radiusKm;

    if (territoryRadius && coordinates) {
      const statusColor = getHubStatusColor(hub);
      const circle = new google.maps.Circle({
        strokeColor: statusColor,
        strokeOpacity: 0.8,
        strokeWeight: isSelected ? 3 : 2,
        fillColor: statusColor,
        fillOpacity: isSelected ? 0.15 : 0.1,
        map: mapInstance.current,
        center: coordinates,
        radius: territoryRadius * 1000 // Convert km to meters
      });

      circlesRef.current.set(hub.id, circle);
    }
  }, [mode, createMarkerIcon, handleHubClick]);


  // Get hub status color
  const getHubStatusColor = (hub: typeof hubsToDisplay[0]) => {
    const locationInfo = extractLegacyLocationData(hub);
    if (!locationInfo.coordinates) return '#6b7280'; // gray

    switch (hub.users?.status) {
      case 'active': return '#10b981'; // green
      case 'pending': return '#f59e0b'; // yellow
      case 'suspended': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Incremental marker update instead of clearing all
  const updateMarkers = useCallback((hubs: typeof filteredHubs, selectedHubId: string | null) => {
    if (!mapInstance.current) return;

    const currentHubIds = new Set(hubs.map(h => h.id));
    const existingMarkerIds = new Set(markersRef.current.keys());

    // Remove markers that are no longer needed
    existingMarkerIds.forEach(hubId => {
      if (!currentHubIds.has(hubId)) {
        const marker = markersRef.current.get(hubId);
        const circle = circlesRef.current.get(hubId);
        const infoWindow = infoWindowsRef.current.get(hubId);

        if (marker) {
          google.maps.event.clearInstanceListeners(marker);
          marker.setMap(null);
          markersRef.current.delete(hubId);
        }
        if (circle) {
          circle.setMap(null);
          circlesRef.current.delete(hubId);
        }
        if (infoWindow) {
          infoWindow.close();
          infoWindowsRef.current.delete(hubId);
        }
      }
    });

    // Update or create markers for current hubs
    hubs.forEach(hub => {
      const existingMarker = markersRef.current.get(hub.id);
      const isSelected = selectedHubId === hub.id;

      if (existingMarker) {
        // Update existing marker
        updateMarkerAppearance(hub, existingMarker, isSelected);
      } else {
        // Create new marker
        createMarkerForHub(hub, isSelected);
      }
    });
  }, [updateMarkerAppearance, createMarkerForHub]);

  // Debounced marker updates to prevent rapid re-renders
  const debouncedUpdateMarkers = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (hubs: typeof filteredHubs, selectedHubId: string | null) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          updateMarkers(hubs, selectedHubId);
        }, 50); // 50ms debounce
      };
    }, [updateMarkers]),
    [updateMarkers]
  );

  // Clear all map elements (used only on unmount)
  const clearAllMapElements = useCallback(() => {
    if (currentOpenInfoWindow.current) {
      currentOpenInfoWindow.current.close();
      currentOpenInfoWindow.current = null;
    }

    markersRef.current.forEach(marker => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    circlesRef.current.forEach(circle => circle.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => {
      infoWindow.close();
    });

    markersRef.current.clear();
    circlesRef.current.clear();
    infoWindowsRef.current.clear();
  }, []);


  // Hub change detection - reset map only when switching between different hubs
  useEffect(() => {
    const currentHubId = businessHub?.id || null;

    // Only reset map state when the hub actually changes, not on modal close/reopen
    if (previousHubId.current !== currentHubId) {
      if (previousHubId.current !== null) { // Don't reset on first load
        isMapInitialized.current = false;
        clearAllMapElements();
        userHasInteracted.current = false;
        lastBounds.current = null;
      }
      previousHubId.current = currentHubId;
    }
  }, [businessHub?.id, clearAllMapElements]);

  // Map initialization effect - allows reinitialization when modal reopens
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Reset user interaction state when modal opens
    userHasInteracted.current = false;

    // If map is already initialized and modal is reopening, just return
    if (isMapInitialized.current && mapInstance.current) {
      return;
    }

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!GOOGLE_MAPS_API_KEY) {
          setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
          setIsLoading(false);
          return;
        }

        // Use cached Google Maps loader
        if (!googleMapsLoader.current) {
          const loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ['maps']
          });
          googleMapsLoader.current = loader.load();
        }

        const google = await googleMapsLoader.current;

        // Create map with default center (will be updated by marker effect)
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 7.0, lng: 125.0 }, // Default center for Philippines
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add interaction listeners to detect user activity
        mapInstance.current.addListener('dragstart', () => {
          userHasInteracted.current = true;
        });
        mapInstance.current.addListener('zoom_changed', () => {
          // Only mark as interacted if it's a manual zoom (not programmatic)
          if (mapInstance.current && !userHasInteracted.current) {
            const currentZoom = mapInstance.current.getZoom();
            // If zoom is different from our calculated values, it's likely user interaction
            userHasInteracted.current = true;
          }
        });

        // Global function for info window clicks
        (window as any).selectBusinessHub = (hubId: string) => {
          handleHubClick(hubId);
        };

        // Wait for map to be fully rendered before marking as initialized
        google.maps.event.addListenerOnce(mapInstance.current, 'idle', () => {
          isMapInitialized.current = true;
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map. Please try again.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [isOpen, handleHubClick]);

  // Effect to handle modal close cleanup
  useEffect(() => {
    if (!isOpen) {
      // Only reset user interaction state, preserve map initialization for modal reopening
      userHasInteracted.current = false;
      lastBounds.current = null;
      // Keep isMapInitialized.current intact to enable fast modal reopening
    }
  }, [isOpen]);

  // Smart marker and bounds update effect
  useEffect(() => {
    if (!isOpen || !isMapInitialized.current || !mapInstance.current || filteredHubs.length === 0) return;

    // Calculate map bounds for hubs with coordinates
    const hubsWithCoords = filteredHubs.filter(hub => {
      const locationInfo = extractLegacyLocationData(hub);
      return locationInfo.coordinates || (hub.territory_boundaries as any)?.centerLat;
    });

    if (hubsWithCoords.length === 0) {
      setError('No location coordinates available for any business hubs');
      return;
    }

    // Get all coordinates for bounds calculation
    const allCoords = hubsWithCoords.map(hub => {
      const locationInfo = extractLegacyLocationData(hub);
      if (locationInfo.coordinates) {
        return locationInfo.coordinates;
      } else if (hub.territory_boundaries) {
        const boundaries = hub.territory_boundaries as any;
        return { lat: boundaries.centerLat, lng: boundaries.centerLng };
      }
      return null;
    }).filter(Boolean) as { lat: number; lng: number }[];

    // Create bounds signature to detect if data has changed
    const boundsSignature = JSON.stringify({
      coords: allCoords.sort((a, b) => a.lat - b.lat),
      mode,
      selectedHub
    });

    // Only update map view if data has changed and user hasn't interacted
    const shouldUpdateBounds = !userHasInteracted.current &&
                              lastBounds.current !== boundsSignature;

    if (shouldUpdateBounds) {
      lastBounds.current = boundsSignature;

      if (allCoords.length === 1) {
        // Single point - center and zoom
        const singleCoord = allCoords[0];
        mapInstance.current.setCenter(singleCoord);
        mapInstance.current.setZoom(mode === 'single' ? 16 : 15);
      } else {
        // Multiple points - fit bounds
        const bounds = new google.maps.LatLngBounds();
        allCoords.forEach(coord => {
          bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
        });

        // Add padding to bounds
        mapInstance.current.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        });
      }
    }

    // Update markers after a brief delay to ensure map is ready
    setTimeout(() => {
      debouncedUpdateMarkers(filteredHubs, selectedHub);
    }, 100);

  }, [isOpen, filteredHubs, selectedHub, mode, debouncedUpdateMarkers]);

  // Cleanup effect - only runs on component unmount
  useEffect(() => {
    return () => {
      clearAllMapElements();
      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
      }
      isMapInitialized.current = false;
      userHasInteracted.current = false;
      lastBounds.current = null;
    };
  }, [clearAllMapElements]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {title || (mode === 'multi' ? 'Business Hubs Map' : 'Business Hub Location')}
              </h2>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {filteredHubs.length} {filteredHubs.length === 1 ? 'hub' : 'hubs'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'multi' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveLayer('all')}
                    className={`px-2 py-1 text-xs rounded ${
                      activeLayer === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveLayer('active')}
                    className={`px-2 py-1 text-xs rounded ${
                      activeLayer === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveLayer('with-location')}
                    className={`px-2 py-1 text-xs rounded ${
                      activeLayer === 'with-location' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Located
                  </button>
                </div>
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
          <div className="p-6">
            {mode === 'single' && businessHub && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{businessHub.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div><strong>BHCODE:</strong> {businessHub.bhcode}</div>
                  <div><strong>Manager:</strong> {businessHub.manager_name || 'N/A'}</div>
                  <div><strong>Municipality:</strong> {businessHub.municipality}</div>
                  <div><strong>Province:</strong> {businessHub.province}</div>
                  {(businessHub as any).region && <div><strong>Region:</strong> {(businessHub as any).region}</div>}
                  {(() => {
                    const location = businessHub.location as LocationData | null;
                    const plusCode = location?.plus_code || (businessHub as any).plus_code;
                    const hierarchicalAddress = (businessHub as any).hierarchical_address;

                    if (plusCode) {
                      return <div className="col-span-2"><strong>Plus Code:</strong> {plusCode}</div>;
                    } else if (hierarchicalAddress) {
                      return <div className="col-span-2"><strong>Address:</strong> {hierarchicalAddress}</div>;
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}

            {mode === 'multi' && selectedHub && (() => {
              const hub = filteredHubs.find(h => h.id === selectedHub);
              if (!hub) return null;

              return (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">{hub.name}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
                    <div><strong>BHCODE:</strong> {hub.bhcode}</div>
                    <div><strong>Status:</strong> {hub.users?.status || 'Unknown'}</div>
                    <div><strong>Municipality:</strong> {hub.municipality}</div>
                    <div><strong>Province:</strong> {hub.province}</div>
                  </div>
                </div>
              );
            })()}

            {/* Map Container */}
            <div className={`relative w-full ${mode === 'multi' ? 'h-[500px]' : 'h-96'} bg-gray-100 rounded-lg overflow-hidden`}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center text-red-600">
                    <p className="font-medium">Error loading map</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div ref={mapRef} className="w-full h-full" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}