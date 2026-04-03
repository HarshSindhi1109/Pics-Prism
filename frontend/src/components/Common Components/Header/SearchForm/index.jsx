import React, { useState } from 'react';
import './SearchForm.css';

export default function SearchForm({ active, products, setFilteredProducts }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter products based on search query
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );

    setFilteredProducts(filtered);
  };

  return (
    <div className={`search-form ${active ? 'active' : ''}`}>
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleSearch}
      />
    </div>
  );
}
