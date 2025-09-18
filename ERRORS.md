

1/1

Next.js 15.5.2 (stale)
Turbopack
Runtime ReferenceError


Cannot access 'updateMarkers' before initialization

src/app/components/MapVisualization.tsx (142:40) @ MapVisualization


  140 |       setIsRefreshing(false);
  141 |     }
> 142 |   }, [filteredHubs, selectedHub, mode, updateMarkers, isRefreshing]);
      |                                        ^
  143 |
  144 |   // Create optimized marker icons with smooth transitions
  145 |   const createMarkerIcon = useCallback((hub: typeof hubsToDisplay[0], isSelected: boolean) => {
Call Stack
18

Show 14 ignore-listed frame(s)
MapVisualization
src/app/components/MapVisualization.tsx (142:40)
BusinessHubs
src/app/components/BusinessHubs.tsx (2497:7)
renderContent
src/app/dashboard/page.tsx (118:16)
Dashboard
src/app/dashboard/page.tsx (255:16)