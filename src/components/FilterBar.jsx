import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const FilterBar = ({ 
  searchQuery, 
  onSearchChange, 
  filterCircle, 
  onFilterCircleChange, 
  filterStatus, 
  onFilterStatusChange, 
  showFilters, 
  onToggleFilters, 
  circles, 
  hasActiveFilters, 
  onClearFilters, 
  currentTheme 
}) => {
  return (
    <div
      className={`mb-6 rounded-xl shadow-lg p-4 transition-colors duration-200 ${
        currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts..."
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
              currentTheme === 'dark'
                ? 'border-nord3 bg-nord2 text-nord6 placeholder-nord4'
                : 'border-nord4 bg-white text-nord0 placeholder-nord3'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                currentTheme === 'dark'
                  ? 'text-nord4 hover:text-nord6'
                  : 'text-nord3 hover:text-nord0'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={onToggleFilters}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            hasActiveFilters && !searchQuery.trim()
              ? 'bg-nord10 text-white'
              : currentTheme === 'dark'
              ? 'bg-nord2 text-nord6 hover:bg-nord3'
              : 'bg-nord5 text-nord0 hover:bg-nord4'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && !searchQuery.trim() && (
            <span className="w-2 h-2 bg-nord11 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div
          className="mt-4 pt-4 border-t space-y-4"
          style={{
            borderColor: currentTheme === 'dark' ? 'var(--nord3)' : 'var(--nord4)',
          }}
        >
          {/* Circle Filter */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              Filter by Circle
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterCircleChange(null)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  !filterCircle
                    ? 'bg-nord10 text-white'
                    : currentTheme === 'dark'
                    ? 'bg-nord2 text-nord6 hover:bg-nord3'
                    : 'bg-nord5 text-nord0 hover:bg-nord4'
                }`}
              >
                All Circles
              </button>
              {circles.map((circle) => (
                <button
                  key={circle.id}
                  onClick={() => onFilterCircleChange(circle.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2 ${
                    filterCircle === circle.id
                      ? 'ring-2 ring-nord10'
                      : currentTheme === 'dark'
                      ? 'bg-nord2 text-nord6 hover:bg-nord3'
                      : 'bg-nord5 text-nord0 hover:bg-nord4'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: circle.color }}
                  ></div>
                  {circle.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterStatusChange('all')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filterStatus === 'all'
                    ? 'bg-nord10 text-white'
                    : currentTheme === 'dark'
                    ? 'bg-nord2 text-nord6 hover:bg-nord3'
                    : 'bg-nord5 text-nord0 hover:bg-nord4'
                }`}
              >
                All Contacts
              </button>
              <button
                onClick={() => onFilterStatusChange('overdue')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filterStatus === 'overdue'
                    ? 'bg-nord11 text-white'
                    : currentTheme === 'dark'
                    ? 'bg-nord2 text-nord6 hover:bg-nord3'
                    : 'bg-nord5 text-nord0 hover:bg-nord4'
                }`}
              >
                Overdue Only
              </button>
              <button
                onClick={() => onFilterStatusChange('birthday')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filterStatus === 'birthday'
                    ? 'bg-nord15 text-white'
                    : currentTheme === 'dark'
                    ? 'bg-nord2 text-nord6 hover:bg-nord3'
                    : 'bg-nord5 text-nord0 hover:bg-nord4'
                }`}
              >
                Upcoming Birthdays
              </button>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 rounded-lg text-sm transition"
              style={{
                color: '#5E81AC',
                backgroundColor:
                  currentTheme === 'dark'
                    ? 'rgba(94, 129, 172, 0.1)'
                    : 'rgba(94, 129, 172, 0.05)',
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
