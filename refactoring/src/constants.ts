import { MapPin, Coffee, Utensils, Camera, Heart, Star } from 'lucide-react';

export const CATEGORIES = [
  { id: 'default', icon: MapPin, label: 'General', color: 'bg-stone-500' },
  { id: 'cafe', icon: Coffee, label: 'Cafe', color: 'bg-amber-500' },
  { id: 'food', icon: Utensils, label: 'Food', color: 'bg-orange-500' },
  { id: 'photo', icon: Camera, label: 'Photo', color: 'bg-blue-500' },
  { id: 'favorite', icon: Heart, label: 'Favorite', color: 'bg-pink-500' },
  { id: 'must-visit', icon: Star, label: 'Must Visit', color: 'bg-yellow-500' },
] as const;
