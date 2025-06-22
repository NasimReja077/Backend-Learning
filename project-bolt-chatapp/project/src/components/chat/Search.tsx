import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface User {
  id: string;
  name: string;
  avatar: string;
}

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Mock results
          const mockResults = [
            {
              id: '1',
              name: 'John Doe',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
            },
            {
              id: '2',
              name: 'Jane Smith',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
            }
          ];
          setSearchResults(mockResults);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm]);

  return (
    <div className='p-4 bg-[#0a0d17] rounded-lg shadow-md'>
      <div className='relative mt-1 flex items-center gap-2'>
        <input
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Search profiles...'
          className='w-full rounded-lg border border-[#1a1e2e] bg-[#0F172A] p-2.5 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300'
        />
        <span className='absolute inset-y-0 right-2 flex items-center justify-center text-[#1e90ff] cursor-pointer hover:text-white transition'>
          <SearchIcon className='w-5 h-5' />
        </span>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="mt-4 space-y-2">
          {isSearching ? (
            <SkeletonLoader count={3} className="h-16" />
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-[#1a1e2e] rounded-lg hover:bg-[#252a3e] transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-white">{user.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Search;