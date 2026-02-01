
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  imageUrl: string;
  isHero?: boolean;
}

export interface Inquiry {
  id: string;
  artworkId: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
}
