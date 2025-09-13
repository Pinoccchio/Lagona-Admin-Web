'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader } from '@googlemaps/js-api-loader';
import type { Database } from '@/lib/supabase/types';

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'];

interface MapModalProps {
  businessHub: BusinessHub | null;
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapModal({ businessHub, isOpen, onClose }: MapModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isOpen || !businessHub) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate API key
        if (!GOOGLE_MAPS_API_KEY) {
          setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
          setIsLoading(false);
          return;
        }

        // Parse coordinates from businessHub
        let coordinates: { lat: number; lng: number } | null = null;

        if (businessHub.coordinates) {
          coordinates = businessHub.coordinates as { lat: number; lng: number };
        } else if (businessHub.territory_boundaries) {
          const boundaries = businessHub.territory_boundaries as any;
          if (boundaries.centerLat && boundaries.centerLng) {
            coordinates = {
              lat: boundaries.centerLat,
              lng: boundaries.centerLng
            };
          }
        }

        if (!coordinates) {
          setError('No location coordinates available for this business hub');
          setIsLoading(false);
          return;
        }

        // Initialize Google Maps loader
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['maps']
        });

        const google = await loader.load();

        if (mapRef.current) {
          // Create map
          mapInstance.current = new google.maps.Map(mapRef.current, {
            center: coordinates,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          // Add marker for business hub
          const marker = new google.maps.Marker({
            position: coordinates,
            map: mapInstance.current,
            title: businessHub.name,
            icon: {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dc2626">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 32)
            }
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">${businessHub.name}</h3>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Code:</strong> ${businessHub.bhcode}</p>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Location:</strong> ${businessHub.municipality}, ${businessHub.province}</p>
                ${businessHub.hierarchical_address ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Address:</strong> ${businessHub.hierarchical_address}</p>` : ''}
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;"><strong>Manager:</strong> ${businessHub.manager_name || 'N/A'}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>Coordinates:</strong> ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}</p>
              </div>
            `
          });

          // Show info window by default
          infoWindow.open(mapInstance.current, marker);

          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindow.open(mapInstance.current, marker);
          });

          // Add territory boundary circle if available
          if (businessHub.territory_boundaries) {
            const boundaries = businessHub.territory_boundaries as any;
            if (boundaries.radiusKm && boundaries.centerLat && boundaries.centerLng) {
              new google.maps.Circle({
                strokeColor: '#dc2626',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#dc2626',
                fillOpacity: 0.1,
                map: mapInstance.current,
                center: {
                  lat: boundaries.centerLat,
                  lng: boundaries.centerLng
                },
                radius: boundaries.radiusKm * 1000 // Convert km to meters
              });
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);

        // Handle specific Google Maps API errors
        if (err instanceof Error) {
          if (err.message.includes('ApiNotActivatedMapError')) {
            setError('Google Maps API is not enabled. Please enable the Maps JavaScript API in your Google Cloud Console.');
          } else if (err.message.includes('InvalidKeyMapError')) {
            setError('Invalid Google Maps API key. Please check your API key configuration.');
          } else if (err.message.includes('RequestDeniedMapError')) {
            setError('Google Maps request denied. Please check your API key restrictions.');
          } else {
            setError(`Failed to load map: ${err.message}`);
          }
        } else {
          setError('Failed to load map. Please try again.');
        }

        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [isOpen, businessHub]);

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
            <h2 className="text-xl font-semibold text-gray-900">
              Business Hub Location
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {businessHub && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{businessHub.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div><strong>BHCODE:</strong> {businessHub.bhcode}</div>
                  <div><strong>Manager:</strong> {businessHub.manager_name || 'N/A'}</div>
                  <div><strong>Municipality:</strong> {businessHub.municipality}</div>
                  <div><strong>Province:</strong> {businessHub.province}</div>
                  {businessHub.region && <div><strong>Region:</strong> {businessHub.region}</div>}
                  {businessHub.hierarchical_address && (
                    <div className="col-span-2"><strong>Address:</strong> {businessHub.hierarchical_address}</div>
                  )}
                </div>
              </div>
            )}

            {/* Map Container */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
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

  return createPortal(modalContent, document.body);
}