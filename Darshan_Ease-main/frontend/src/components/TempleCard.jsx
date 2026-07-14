import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const TempleCard = ({ temple, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('templeFavorites') || '[]');
    setIsFavorite(favorites.includes(temple._id));
  }, [temple._id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('templeFavorites') || '[]');
    let updated;
    
    if (favorites.includes(temple._id)) {
      updated = favorites.filter(id => id !== temple._id);
      setIsFavorite(false);
      if (onFavoriteToggle) onFavoriteToggle(temple._id, false);
    } else {
      updated = [...favorites, temple._id];
      setIsFavorite(true);
      if (onFavoriteToggle) onFavoriteToggle(temple._id, true);
    }
    
    localStorage.setItem('templeFavorites', JSON.stringify(updated));
  };

  // Generate a realistic, deterministic rating based on temple name length
  const rating = temple.rating || (4.5 + (temple.templeName.length % 5) * 0.1).toFixed(1);

  return (
    <div className="card temple-card fade-in">
      <div className="temple-img-wrap">
        <span className="floating-rating">
          <Star size={12} fill="currentColor" />
          <span>{rating}</span>
        </span>
        
        <button 
          onClick={toggleFavorite} 
          className={`bookmark-btn ${isFavorite ? 'active' : ''}`}
          title={isFavorite ? "Remove from Bookmarks" : "Add to Bookmarks"}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>

        <img 
          src={temple.image || 'https://images.unsplash.com/photo-1548013146-72479768bbaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'} 
          alt={temple.templeName} 
        />
      </div>
      
      <div className="temple-body">
        <h3>{temple.templeName}</h3>
        
        <p className="temple-location">
          <MapPin size={14} className="logo-icon" />
          <span>{temple.location}</span>
        </p>
        
        <p className="temple-desc">
          {temple.description || 'Experience a divine and peaceful darshan at this sacred shrine. Book your slot now to avoid the crowds.'}
        </p>
        
        <div className="card-action-wrap">
          <Link to={`/temples/${temple._id}`} className="btn btn-card">
            <span>View Details</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TempleCard;
