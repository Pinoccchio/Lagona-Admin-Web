'use client';

import { createPortal } from 'react-dom';
import type { Database } from '@/lib/supabase/types';

type BusinessHub = Database['public']['Tables']['business_hubs']['Row'];

interface LocationDetailsModalProps {
  businessHub: BusinessHub | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationDetailsModal({ businessHub, isOpen, onClose }: LocationDetailsModalProps) {
  if (!isOpen || !businessHub) return null;

  // Parse coordinates and territory boundaries
  const coordinates = businessHub.coordinates as { lat: number; lng: number } | null;
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
            <h2 className="text-xl font-semibold text-gray-900">
              Location Details
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
                  {businessHub.region && (
                    <div>
                      <span className="font-medium text-blue-700">Region:</span>
                      <span className="ml-2 text-blue-900">{businessHub.region}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-blue-700">Province:</span>
                    <span className="ml-2 text-blue-900">{businessHub.province}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Municipality:</span>
                    <span className="ml-2 text-blue-900">{businessHub.municipality}</span>
                  </div>
                  {businessHub.barangay && (
                    <div>
                      <span className="font-medium text-blue-700">Barangay:</span>
                      <span className="ml-2 text-blue-900">{businessHub.barangay}</span>
                    </div>
                  )}
                  {businessHub.zone && (
                    <div>
                      <span className="font-medium text-blue-700">Zone:</span>
                      <span className="ml-2 text-blue-900">{businessHub.zone}</span>
                    </div>
                  )}
                  {businessHub.district && (
                    <div>
                      <span className="font-medium text-blue-700">District:</span>
                      <span className="ml-2 text-blue-900">{businessHub.district}</span>
                    </div>
                  )}
                  {businessHub.hierarchical_address && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-700">Full Address:</span>
                      <span className="ml-2 text-blue-900">{businessHub.hierarchical_address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GPS Coordinates */}
            {coordinates && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">GPS Coordinates</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Latitude:</span>
                      <span className="ml-2 text-green-900 font-mono">{coordinates.lat.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Longitude:</span>
                      <span className="ml-2 text-green-900 font-mono">{coordinates.lng.toFixed(6)}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-700">Coordinates:</span>
                      <span className="ml-2 text-green-900 font-mono">
                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </span>
                      <button
                        onClick={() => {
                          const coordString = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
                          navigator.clipboard.writeText(coordString);
                        }}
                        className="ml-2 text-green-600 hover:text-green-800 underline text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
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