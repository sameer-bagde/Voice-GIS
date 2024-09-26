import React from 'react';

interface ClearSearchProps {
  onClear: () => void;
  isVisible: boolean;
}


const ClearSearch: React.FC<ClearSearchProps> = ({ onClear, isVisible }) => {
  if (!isVisible) return null;

  return (
    <button 
      onClick={onClear}
      className="clear-search-button"
    >
      <i className="fa fa-times"></i>
    </button>
  );
};

export default ClearSearch;