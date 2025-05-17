
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate average rating from an array of video requests
export function calculateAverageRating(reviews: any[], defaultRating = 0): number {
  if (!reviews || reviews.length === 0) {
    return defaultRating;
  }
  
  const validRatings = reviews.filter(r => r.rating !== null && r.rating !== undefined);
  if (validRatings.length === 0) {
    return defaultRating;
  }
  
  const sum = validRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  return sum / validRatings.length;
}

// Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}
