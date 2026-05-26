
import React, { useRef, useState } from 'react';
import { LocalFile } from '../types.ts';

interface MovieCarouselProps {
  title: string;
  movies: LocalFile[];
  onMovieClick?: (movie: LocalFile) => void;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({ title, movies, onMovieClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="space-y-4 group/carousel relative">
      <div 
        className="flex items-center gap-4 px-6 md:px-12 cursor-pointer group/title"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl md:text-2xl font-bold text-white transition-colors group-hover/carousel:text-red-600">
          {title}
        </h3>
        <span className={`text-red-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </span>
        <span className="text-[10px] font-black uppercase text-gray-500 opacity-0 group-hover/title:opacity-100 transition-opacity italic">
          {isOpen ? 'Masquer' : 'Afficher'}
        </span>
      </div>
      
      {isOpen && (
        <div className="relative animate-fade-in">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/80"
          >
            <span className="text-2xl">‹</span>
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-8 scroll-smooth"
          >
            {movies.map((movie, idx) => (
              <div 
                key={idx}
                onClick={() => onMovieClick?.(movie)}
                className="flex-none w-40 md:w-64 aspect-video bg-[#141414] rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-125 hover:z-50 relative group/card shadow-lg"
              >
                <div className="w-full h-full relative">
                  <video 
                    src={`/video/local/${encodeURIComponent(movie.path)}#t=10`}
                    className="w-full h-full object-cover absolute inset-0 opacity-100 group-hover/card:opacity-0 transition-opacity"
                    muted
                    preload="metadata"
                  />
                  <video 
                    src={`/video/local/${encodeURIComponent(movie.path)}`}
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity"
                    muted
                    loop
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-4 z-10">
                  <p className="text-[10px] font-black uppercase italic text-white line-clamp-1">{movie.name}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-[10px]">▶</button>
                    <button className="bg-gray-500/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px]">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 group-hover/carousel:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/80"
          >
            <span className="text-2xl">›</span>
          </button>
        </div>
      )}
    </div>
  );
};
