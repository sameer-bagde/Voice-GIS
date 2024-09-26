import React, { useState, useEffect, useCallback, useRef } from 'react';
import MicrophoneControl from './microphoneControl';
import { getPlaceDetails, getPlaceSuggestions } from '../../api/googleMapsAPI';
import ClearSearch from './clearSearch';

interface SearchBarProps {
  onPlaceSelect: (location: { lat: number; lng: number }, bounds: { northeast: { lat: number; lng: number }, southwest: { lat: number; lng: number } }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onPlaceSelect }) => {
  const [query, setQuery] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async () => {
    if (query) {
      const result = await getPlaceSuggestions(query);
      setSuggestions(result || []);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const debounceFetch = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceFetch);
  }, [fetchSuggestions]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery) {
      const details = await getPlaceDetails(searchQuery);
      if (details && details.results.length > 0) {
        const { location, viewport } = details.results[0].geometry;
        onPlaceSelect(location, viewport);
        closeSuggestions();
      } else {
        console.error('No results found');
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, suggestions.length - 1)
      );
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) =>
        Math.max(prevIndex - 1, 0)
      );
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        handleSearch(query);
      }
    }
  };

  const toggleMic = (isOn: boolean) => {
    setIsMicOn(isOn);
  };

  const openSuggestions = () => {
    setIsFocused(true);
    fetchSuggestions();
  };

  const closeSuggestions = () => {
    setIsFocused(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Updated function to clear the input field
  // const clearInput = () => {
  //   setQuery('');
  //   setSuggestions([]);
  //   setHighlightedIndex(-1);
  //   // Do not focus the search input here
  // };

  return (
    <div className="search-container relative">
      <i className=' fa fa-location-arrow'></i>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a place"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={openSuggestions}
        autoComplete="off"
      />
      <div className="flex items-center space-x-2">
        <i 
          className="fa fa-search mr-2 cursor-pointer text-gray-400 hover:text-gray-600" 
          onClick={() => {
            handleSearch(query); // Search for the query
            closeSuggestions();   // Close suggestions
          }}
        ></i>
        <ClearSearch onClear={handleClear} isVisible={!!query} />
        <MicrophoneControl toggleMic={toggleMic} isMicOn={isMicOn}  />
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="suggestions-container absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`suggestion p-2 cursor-pointer hover:bg-gray-100 ${index === highlightedIndex ? 'bg-gray-100' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
