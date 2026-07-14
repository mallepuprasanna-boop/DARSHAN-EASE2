import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Compass, PhoneCall, ShieldAlert, Award, ExternalLink, RefreshCw, Car, Bed, Utensils, Award as Hospital, CreditCard } from 'lucide-react';

const TempleNavigator = ({ temple, onClose }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState(null);
  
  // Navigation statistics
  const [routeStats, setRouteStats] = useState({
    distance: 'Calculating...',
    duration: 'Calculating...',
    traffic: 'Normal' // Normal, Moderate, Slow
  });
  
  // Active amenity tab
  const [activeAmenity, setActiveAmenity] = useState(null);
  const [amenityMarkers, setAmenityMarkers] = useState([]);
  
  const mapRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const routePolylineRef = useRef(null);
  const markersGroupRef = useRef(null);
  
  // Default coordinates (e.g. New Delhi if browser geo fails)
  const defaultUserCoords = { lat: 28.6139, lng: 77.2090 }; 
  const templeCoords = {
    lat: temple?.latitude || 26.7956,
    lng: temple?.longitude || 82.1943
  };

  // Load Leaflet dynamically
  useEffect(() => {
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    const scriptId = 'leaflet-cdn-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }

    return () => {
      // Keep Leaflet loaded globally for subsequent uses
    };
  }, []);

  // Detect user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setUserLocation(defaultUserCoords);
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMsg = 'Could not access your location. Using default location (New Delhi).';
        if (error.code === 1) errorMsg = 'Location permission denied. Using default location (New Delhi).';
        setLocationError(errorMsg);
        // Default location (e.g. New Delhi) or near temple if temple is far away
        setUserLocation(defaultUserCoords);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !userLocation || !mapRef.current) return;

    // Clean up previous map if it exists
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.remove();
    }

    const L = window.L;
    
    // Create map centered between user and temple
    const centerLat = (userLocation.lat + templeCoords.lat) / 2;
    const centerLng = (userLocation.lng + templeCoords.lng) / 2;
    
    const map = L.map(mapRef.current, {
      zoomControl: false // we will add it on top right
    }).setView([centerLat, centerLng], 6);
    
    L.control.zoom({ position: 'topright' }).addTo(map);
    
    leafletMapInstanceRef.current = map;

    // Premium dark-mode/styled tile layer (CartoDB Positron or Voyager looks premium)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      
    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Create marker groups
    markersGroupRef.current = L.layerGroup().addTo(map);

    // 1. Add Temple Marker
    const templeIcon = L.divIcon({
      html: `<div class="temple-marker-icon" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🛕</div>`,
      className: 'custom-temple-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    
    L.marker([templeCoords.lat, templeCoords.lng], { icon: templeIcon })
      .addTo(map)
      .bindPopup(`<h4>${temple?.templeName}</h4><p>${temple?.location}</p>`)
      .openPopup();

    // 2. Add User Location Marker
    const userIcon = L.divIcon({
      html: `<div class="user-location-pulsing"></div>`,
      className: 'custom-user-marker',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<h4>Your Location</h4><p>Starting point</p>');

    // 3. Draw Route and Calculate ETA
    calculateRoute(L, map, userLocation, templeCoords);

  }, [mapLoaded, userLocation]);

  // Handle Amenity Markers rendering
  useEffect(() => {
    if (!leafletMapInstanceRef.current || !activeAmenity) return;

    const L = window.L;
    const map = leafletMapInstanceRef.current;
    
    // Clear old amenity markers
    amenityMarkers.forEach(marker => marker.remove());
    
    // Generate mock amenities around the temple
    const items = generateMockAmenities(templeCoords.lat, templeCoords.lng, temple?.templeName || 'Temple', activeAmenity);
    
    const colors = {
      parking: '#f97316',
      hotel: '#3b82f6',
      restaurant: '#10b981',
      hospital: '#ef4444',
      atm: '#8b5cf6'
    };

    const newMarkers = items.map(item => {
      const iconHtml = `<div class="amenity-marker-icon" style="border-color: ${colors[activeAmenity]}; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px;">${item.emoji}</div>`;
      
      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-amenity-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([item.lat, item.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <h4 style="margin: 0 0 4px; color: ${colors[activeAmenity]}; font-size: 0.9rem;">${item.name}</h4>
            <p style="margin: 0; font-size: 0.75rem; color: #64748b;">${item.distance} away</p>
            ${item.rating ? `<p style="margin: 2px 0 0; font-size: 0.75rem; color: #f59e0b;">⭐ ${item.rating}</p>` : ''}
          </div>
        `);
        
      return marker;
    });

    setAmenityMarkers(newMarkers);

    // Zoom in closer to temple to see amenities
    map.setView([templeCoords.lat, templeCoords.lng], 15, { animate: true });

  }, [activeAmenity]);

  // Route Drawing Logic using free OSRM Routing API
  const calculateRoute = async (L, map, start, end) => {
    try {
      const response = await fetch(`https://router.projectosrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
      
      if (!response.ok) throw new Error('OSRM Route request failed');
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        
        let durationStr = `${durationMin} mins`;
        if (durationMin > 60) {
          const hrs = Math.floor(durationMin / 60);
          const mins = durationMin % 60;
          durationStr = `${hrs} hr ${mins} mins`;
        }

        // Mock traffic status based on time & random delay
        const trafficOptions = ['Normal', 'Moderate', 'Slow'];
        const randomTraffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];

        setRouteStats({
          distance: `${distanceKm} km`,
          duration: durationStr,
          traffic: randomTraffic
        });

        // Remove old polyline
        if (routePolylineRef.current) {
          routePolylineRef.current.remove();
        }

        // Draw route polyline
        const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const polyline = L.polyline(coords, {
          color: '#4f46e5',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round'
        }).addTo(map);

        routePolylineRef.current = polyline;

        // Fit map boundaries to include both markers nicely
        map.fitBounds(polyline.getBounds(), {
          padding: [50, 50]
        });
      } else {
        fallbackDirectLine(L, map, start, end);
      }
    } catch (err) {
      console.warn('Error fetching route, falling back to direct line calculation:', err);
      fallbackDirectLine(L, map, start, end);
    }
  };

  // Fallback if routing API fails
  const fallbackDirectLine = (L, map, start, end) => {
    // Calculate simple Haversine distance
    const R = 6371; // Earth radius in km
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    const estDuration = Math.round(dist * 1.5); // estimate 1.5 min per km driving

    setRouteStats({
      distance: `${dist.toFixed(1)} km`,
      duration: estDuration > 60 
        ? `${Math.floor(estDuration/60)} hr ${estDuration%60} mins`
        : `${estDuration} mins`,
      traffic: 'Normal'
    });

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
    }

    const polyline = L.polyline([[start.lat, start.lng], [end.lat, end.lng]], {
      color: '#6366f1',
      dashArray: '8, 8',
      weight: 4,
      opacity: 0.7
    }).addTo(map);

    routePolylineRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  // Amenity Helper Mock Data Generator
  const generateMockAmenities = (lat, lng, name, type) => {
    const offsets = [
      { lat: 0.002, lng: 0.001 },
      { lat: -0.0015, lng: 0.0025 },
      { lat: 0.003, lng: -0.002 },
      { lat: -0.002, lng: -0.001 }
    ];

    switch (type) {
      case 'parking':
        return [
          { name: `${name} Main Devotee Parking`, lat: lat + offsets[0].lat, lng: lng + offsets[0].lng, distance: '150m', emoji: '🅿️', rating: '4.2' },
          { name: `Multi-Level Municipal Parking`, lat: lat + offsets[1].lat, lng: lng + offsets[1].lng, distance: '400m', emoji: '🅿️', rating: '4.0' },
          { name: `West Gate Parking Lot`, lat: lat + offsets[2].lat, lng: lng + offsets[2].lng, distance: '600m', emoji: '🅿️', rating: '3.8' }
        ];
      case 'hotel':
        return [
          { name: `Shree Dham Dharamshala`, lat: lat + offsets[0].lat, lng: lng + offsets[0].lng, distance: '200m', emoji: '🏨', rating: '4.6' },
          { name: `Hotel Saffron Residency`, lat: lat + offsets[1].lat, lng: lng + offsets[1].lng, distance: '500m', emoji: '🏨', rating: '4.4' },
          { name: `The Divine Guest House`, lat: lat + offsets[2].lat, lng: lng + offsets[2].lng, distance: '850m', emoji: '🏨', rating: '4.1' }
        ];
      case 'restaurant':
        return [
          { name: `Annapoorna Prasad Veg Hall`, lat: lat + offsets[0].lat, lng: lng + offsets[0].lng, distance: '80m', emoji: '🍽️', rating: '4.8' },
          { name: `Shree Balaji Pure Veg`, lat: lat + offsets[1].lat, lng: lng + offsets[1].lng, distance: '300m', emoji: '🍽️', rating: '4.3' },
          { name: `Govindas Sweet & Snack Corner`, lat: lat + offsets[3].lat, lng: lng + offsets[3].lng, distance: '450m', emoji: '🍽️', rating: '4.5' }
        ];
      case 'hospital':
        return [
          { name: `Temple Trust Free Medical Center`, lat: lat + offsets[0].lat, lng: lng + offsets[0].lng, distance: '120m', emoji: '🏥' },
          { name: `City Emergency Clinic`, lat: lat + offsets[1].lat, lng: lng + offsets[1].lng, distance: '900m', emoji: '🏥' },
          { name: `Civil Hospital Health Care`, lat: lat + offsets[2].lat, lng: lng + offsets[2].lng, distance: '1.4km', emoji: '🏥' }
        ];
      case 'atm':
        return [
          { name: `State Bank of India (SBI) ATM`, lat: lat + offsets[0].lat, lng: lng + offsets[0].lng, distance: '50m', emoji: '🏧' },
          { name: `HDFC Bank ATM Counter`, lat: lat + offsets[1].lat, lng: lng + offsets[1].lng, distance: '250m', emoji: '🏧' },
          { name: `PNB ATM Lobby`, lat: lat + offsets[3].lat, lng: lng + offsets[3].lng, distance: '380m', emoji: '🏧' }
        ];
      default:
        return [];
    }
  };

  const getTrafficColorClass = () => {
    if (routeStats.traffic === 'Normal') return 'traffic-normal';
    if (routeStats.traffic === 'Moderate') return 'traffic-slow';
    return 'traffic-heavy';
  };

  // Google Maps Direction URL Fallback
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation ? `${userLocation.lat},${userLocation.lng}` : ''}&destination=${templeCoords.lat},${templeCoords.lng}&travelmode=driving`;

  return (
    <div className="nav-modal-overlay">
      <div className="nav-modal-container">
        
        {/* Header */}
        <div className="nav-modal-header">
          <div className="nav-modal-title">
            <h3>Navigating to {temple?.templeName}</h3>
            <p>{temple?.location}</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Navigation">
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="nav-modal-body">
          
          {/* Sidebar */}
          <div className="nav-sidebar">
            
            {/* Route Stats Panel */}
            <div className="nav-section">
              <div className="nav-section-title">Route & Time</div>
              
              <div className="route-info-card">
                <div className="route-stats">
                  <div className="stat-item">
                    <span className="stat-label">DISTANCE</span>
                    <span className="stat-val">{routeStats.distance}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">TRAVEL TIME</span>
                    <span className="stat-val" style={{ color: 'var(--primary)' }}>{routeStats.duration}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="stat-label">LIVE TRAFFIC:</span>
                  <span className={`traffic-badge ${getTrafficColorClass()}`}>
                    {routeStats.traffic} Traffic
                  </span>
                </div>
              </div>
              
              {locationError && (
                <div style={{ fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'var(--danger-light)', padding: '10px', borderRadius: 'var(--radius-sm)', marginTop: '10px' }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{locationError}</span>
                </div>
              )}
            </div>

            {/* Amenities Panel */}
            <div className="nav-section">
              <div className="nav-section-title">Nearby Amenities</div>
              <div className="amenities-grid">
                <button 
                  className={`amenity-btn ${activeAmenity === 'parking' ? 'active' : ''}`}
                  onClick={() => setActiveAmenity(activeAmenity === 'parking' ? null : 'parking')}
                >
                  <div className="amenity-icon-wrapper">
                    <Car size={16} />
                  </div>
                  <span>Parking</span>
                </button>
                <button 
                  className={`amenity-btn ${activeAmenity === 'hotel' ? 'active' : ''}`}
                  onClick={() => setActiveAmenity(activeAmenity === 'hotel' ? null : 'hotel')}
                >
                  <div className="amenity-icon-wrapper">
                    <Bed size={16} />
                  </div>
                  <span>Hotels</span>
                </button>
                <button 
                  className={`amenity-btn ${activeAmenity === 'restaurant' ? 'active' : ''}`}
                  onClick={() => setActiveAmenity(activeAmenity === 'restaurant' ? null : 'restaurant')}
                >
                  <div className="amenity-icon-wrapper">
                    <Utensils size={16} />
                  </div>
                  <span>Food</span>
                </button>
                <button 
                  className={`amenity-btn ${activeAmenity === 'hospital' ? 'active' : ''}`}
                  onClick={() => setActiveAmenity(activeAmenity === 'hospital' ? null : 'hospital')}
                >
                  <div className="amenity-icon-wrapper">
                    <Hospital size={16} />
                  </div>
                  <span>Hospitals</span>
                </button>
                <button 
                  className={`amenity-btn ${activeAmenity === 'atm' ? 'active' : ''}`}
                  onClick={() => setActiveAmenity(activeAmenity === 'atm' ? null : 'atm')}
                  style={{ gridColumn: 'span 2' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                    <div className="amenity-icon-wrapper" style={{ padding: '6px' }}>
                      <CreditCard size={16} />
                    </div>
                    <span>Find Nearby ATM Outlets</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Google Maps link */}
            <div className="nav-section" style={{ marginTop: 'auto' }}>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="external-maps-btn">
                <Navigation size={16} /> Launch Google Maps <ExternalLink size={14} />
              </a>
            </div>

          </div>

          {/* Map Viewer */}
          <div className="map-container">
            {locating && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <RefreshCw size={24} className="spinner" style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Detecting your GPS coordinates...</span>
              </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TempleNavigator;
