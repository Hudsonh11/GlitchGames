import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Users, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UltraBadge from './UltraBadge';
import blockBlastImg from '@/assets/block-puzzle-feature.jpg';
import fruitSliceImg from '@/assets/fruit-slice-feature.jpg';
import geometryDashImg from '@/assets/geometry-dash-feature.jpg';
import pacManImg from '@/assets/pac-man-feature.jpg';
import snakeImg from '@/assets/snake-feature.jpg';

interface FeaturedGameData {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  players: string;
  category: string;
  featured: string;
}

const featuredGames: FeaturedGameData[] = [
  {
    id: 'block-blast',
    title: 'Block Blast',
    description: 'Blast through colorful block puzzles in this addictive strategy game. Clear lines, chain combos, chase the high score!',
    image: blockBlastImg,
    rating: 5.0,
    players: '52.3K',
    category: 'Puzzle',
    featured: 'Featured Pick',
  },
  {
    id: 'fruit-slice',
    title: 'Fruit Slice',
    description: 'Swipe, slash and chain combos through a storm of flying fruit. Don\'t hit the bombs — how long can you keep the streak alive?',
    image: fruitSliceImg,
    rating: 4.7,
    players: '38.6K',
    category: 'Arcade',
    featured: 'Fan Favorite',
  },
  {
    id: 'geometry-dash',
    title: 'Geometry Dash',
    description: 'Jump and fly through danger in this rhythm-based action platformer! Test your reflexes and timing.',
    image: geometryDashImg,
    rating: 4.9,
    players: '25.1K',
    category: 'Action',
    featured: 'Most Popular',
  },
  {
    id: 'pac-man',
    title: 'Pac-Man',
    description: 'Gobble every dot, dodge the ghosts and chase the power pellet through the neon maze in the arcade legend.',
    image: pacManImg,
    rating: 4.9,
    players: '41.8K',
    category: 'Arcade',
    featured: 'Arcade Legend',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'The classic arcade legend — grow your snake, dodge the walls, and beat your best length!',
    image: snakeImg,
    rating: 4.8,
    players: '31.4K',
    category: 'Arcade',
    featured: 'Trending Now',
  },
];

const FeaturedGame: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const game = featuredGames[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${game.image})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      
      {/* Content */}
      <div className={`relative p-8 md:p-12 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <UltraBadge variant="legendary" icon="sparkles">
              {game.featured}
            </UltraBadge>
            <UltraBadge variant="rare">{game.category}</UltraBadge>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {game.title}
          </h2>
          
          <p className="text-muted-foreground mb-6 line-clamp-2">
            {game.description}
          </p>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-bold text-foreground">{game.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{game.players} playing</span>
            </div>
          </div>
          
          <Button variant="gaming" size="lg" asChild>
            <Link to={`/game/${game.id}`}>
              <Play className="w-5 h-5 mr-2" />
              Play Now
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex gap-1">
          {featuredGames.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/50'
              }`}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setIsTransitioning(false);
                }, 300);
              }}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={nextSlide}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FeaturedGame;
