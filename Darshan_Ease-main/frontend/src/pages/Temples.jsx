import React, { useState, useEffect } from 'react';
import { getTemples } from '../services/templeService';
import TempleCard from '../components/TempleCard';
import { Search, MapPin, Star, Heart, SlidersHorizontal, Trash2 } from 'lucide-react';

const Temples = () => {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [favoritesList, setFavoritesList] = useState([]);

  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const data = await getTemples();
        setTemples(data);
      } catch (err) {
        setError('Failed to fetch temples');
      } finally {
        // Minimal delay to ensure smooth transition and render of loading skeletons
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };
    fetchTemples();

    // Retrieve initial bookmarks
    const favs = JSON.parse(localStorage.getItem('templeFavorites') || '[]');
    setFavoritesList(favs);
  }, []);

  const handleFavoriteToggle = (templeId, isFav) => {
    if (isFav) {
      setFavoritesList(prev => [...prev, templeId]);
    } else {
      setFavoritesList(prev => prev.filter(id => id !== templeId));
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setMinRating('');
    setShowOnlyBookmarks(false);
  };

  // Get distinct locations dynamically
  const locations = [...new Set(temples.map(t => t.location).filter(Boolean))];

  // Filtering calculations
  const filteredTemples = temples.filter(temple => {
    const matchesSearch = temple.templeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (temple.description && temple.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesLocation = selectedLocation ? temple.location === selectedLocation : true;
    
    // Deterministic rating calculated inside card
    const rating = parseFloat(temple.rating || (4.5 + (temple.templeName.length % 5) * 0.1).toFixed(1));
    const matchesRating = minRating ? rating >= parseFloat(minRating) : true;
    
    const matchesBookmarks = showOnlyBookmarks ? favoritesList.includes(temple._id) : true;

    return matchesSearch && matchesLocation && matchesRating && matchesBookmarks;
  });

  const SkeletonCard = () => (
    <div className="skeleton-card shimmer">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-title" />
        <div className="skeleton-location" />
        <div className="skeleton-text">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
        <div className="skeleton-btn" />
      </div>
    </div>
  );

  return (
    <div className="container page-section fade-in">
      <div className="mandala-bg" />
      
      {/* Explorer Hero Section */}
      <section className="explorer-hero">
        <h1 className="explorer-hero-title">Explore India's Divine Temples</h1>
        <p className="explorer-hero-subtitle">
          Embark on a sacred journey. Find and reserve priority entries, special timings, and secure darshans across the nation's most historic shrines.
        </p>

        {/* Search & Filter Bar */}
        <div className="search-filter-box">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by temple name or deity..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-divider" />

          {/* Location Selector */}
          <div className="filter-select-wrapper">
            <MapPin size={16} className="logo-icon" style={{ marginRight: '4px' }} />
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="filter-divider" />

          {/* Rating filter */}
          <div className="filter-select-wrapper">
            <Star size={16} className="logo-icon" style={{ marginRight: '4px' }} />
            <select 
              value={minRating} 
              onChange={(e) => setMinRating(e.target.value)}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="4.6">4.6+ Stars</option>
              <option value="4.7">4.7+ Stars</option>
              <option value="4.8">4.8+ Stars</option>
              <option value="4.9">4.9 Stars</option>
            </select>
          </div>

          <div className="filter-divider" />

          {/* Bookmarks Toggle button */}
          <button 
            type="button"
            onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
            className={`bookmarks-toggle-btn ${showOnlyBookmarks ? 'active' : ''}`}
            title="Favorites Only"
          >
            <Heart size={16} fill={showOnlyBookmarks ? "currentColor" : "none"} />
            <span>Favorites</span>
          </button>
        </div>
      </section>

      {error ? (
        <div className="page-center"><p className="error-text">{error}</p></div>
      ) : loading ? (
        <div className="grid">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredTemples.length === 0 ? (
        <div className="card empty-state fade-in" style={{ padding: '60px 40px' }}>
          <SlidersHorizontal size={48} className="logo-icon" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.6 }} />
          <h3 style={{ marginBottom: '8px' }}>No Shrines Found</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
            Try expanding your search query or removing selected filters.
          </p>
          <button onClick={resetFilters} className="btn btn-outline" style={{ display: 'inline-flex', gap: '8px' }}>
            <Trash2 size={16} />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)' }}>
              Showing {filteredTemples.length} {filteredTemples.length === 1 ? 'temple' : 'temples'}
            </span>
            {(searchQuery || selectedLocation || minRating || showOnlyBookmarks) && (
              <button 
                onClick={resetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reset All Filters
              </button>
            )}
          </div>
          
          <div className="grid">
            {filteredTemples.map(temple => (
              <TempleCard 
                key={temple._id} 
                temple={temple} 
                onFavoriteToggle={handleFavoriteToggle} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Temples;
