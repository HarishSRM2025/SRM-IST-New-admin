import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, placeholder = "Search..." }) => {
  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text" 
        className="search-input" 
        placeholder={placeholder} 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
