import React, { useState, useEffect, useRef } from 'react';
import { Search, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';

interface Room {
  id: string;
  label: string;
  description: string;
  floor: string;
}

interface SearchBarProps {
  rooms: Room[];
  onRoomSelect: (roomId: string, floor: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  rooms, 
  onRoomSelect, 
  placeholder = "Search rooms (e.g., A013, B105)" 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<Room[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(rooms, {
    keys: ['id', 'label', 'description'],
    threshold: 0.3,
    includeScore: true
  });

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle search and filter results
  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuse.search(query).map(result => result.item);
      setResults(searchResults.slice(0, 8)); // Limit to 8 results
      setSelectedIndex(0);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, fuse]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleRoomSelect(results[selectedIndex]);
        }
        break;
    }
  };

  const handleRoomSelect = (room: Room) => {
    setQuery(room.label);
    setIsOpen(false);
    onRoomSelect(room.id, room.floor);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                   text-foreground placeholder:text-muted-foreground
                   transition-all duration-200"
          aria-label="Search for rooms"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs 
                         bg-muted text-muted-foreground border border-border rounded">
            <Command className="w-3 h-3" />
            /
          </kbd>
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-background border border-border 
                     rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="py-2">
              {results.map((room, index) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={`w-full px-4 py-3 text-left transition-colors duration-150
                           hover:bg-accent hover:text-accent-foreground
                           ${index === selectedIndex ? 'bg-accent text-accent-foreground' : ''}
                           focus:outline-none focus:bg-accent focus:text-accent-foreground`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{room.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {room.description} • {room.floor}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {room.floor}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {isOpen && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-background border border-border 
                     rounded-xl shadow-lg z-50 p-4"
          >
            <div className="text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No rooms found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for room IDs like A013 or B105</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;