import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Campus, searchCampuses } from '@/data/campuses';
import { motion, AnimatePresence } from 'framer-motion';

interface CampusSearchProps {
  onCampusSelect: (campus: Campus) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export const CampusSearch: React.FC<CampusSearchProps> = ({
  onCampusSelect,
  query,
  onQueryChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredResults, setFilteredResults] = useState<Campus[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const results = searchCampuses(query);
    setFilteredResults(results.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleCampusSelect(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCampusSelect = (campus: Campus) => {
    onCampusSelect(campus);
    setIsOpen(false);
    onQueryChange(campus.name);
  };

  const handleInputChange = (value: string) => {
    onQueryChange(value);
    setIsOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <motion.div 
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Input */}
      <div className="relative glass-card rounded-2xl border border-white/20 overflow-hidden backdrop-blur-md">
        <div className="flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            placeholder="Search campuses... (Press '/' to focus)"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            className="flex-1 border-none bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {query.length === 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1">
              <Command className="w-3 h-3" />
              <span>/</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-white/20 backdrop-blur-md shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {filteredResults.map((campus, index) => (
                <motion.button
                  key={campus.id}
                  className={`w-full text-left px-4 py-3 transition-colors border-b border-white/10 last:border-b-0 ${
                    index === selectedIndex
                      ? 'bg-kiit-green/20 text-kiit-green'
                      : 'hover:bg-white/10 text-foreground'
                  }`}
                  onClick={() => handleCampusSelect(campus)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {campus.name} ({campus.code})
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {campus.quickFacts.specialization}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                        campus.id <= 5 
                          ? 'from-kiit-green to-campus-blue'
                          : campus.id <= 10
                          ? 'from-campus-blue to-campus-purple'
                          : campus.id <= 15
                          ? 'from-campus-purple to-campus-orange'
                          : campus.id <= 20
                          ? 'from-campus-orange to-kiit-green'
                          : 'from-kiit-green to-campus-blue'
                      }`} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Use ↑↓ to navigate, Enter to select</span>
                <span>{filteredResults.length} results</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {isOpen && query.length > 0 && filteredResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-white/20 backdrop-blur-md p-4 text-center"
          >
            <div className="text-muted-foreground text-sm">
              No campuses found matching "{query}"
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Try searching for campus numbers (1-25) or specializations
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};