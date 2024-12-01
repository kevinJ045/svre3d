
import React, { useState, useEffect, useContext } from 'react';

export function SearchBar({
  searchQuery,
  setSearchQuery,
  className,
  placeholder
} : {
  className?: string,
  placeholder?: string,
  searchQuery: string,
  setSearchQuery: (s: string) => any
}){
  return <div className={
    "search-bar" + (className ? ' '+className : '')  
  }>
    <span className="search-icon"></span>
    <input
      type="text"
      placeholder={placeholder || "Search..."}
      className='input-search-bar'
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
}