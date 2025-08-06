import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatReleaseDate(timestamp: number): string {
  return format(timestamp * 1000, "MMM dd, yyyy");
}

export function getYearsAgo(timestamp: number): string {
  return formatDistanceToNow(timestamp * 1000, { addSuffix: true });
}

export function formatRating(rating: number): string {
  return (rating / 10).toFixed(1);
}

export function getImageUrl(hash: string, size: string = "cover_big"): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${hash}.jpg`;
} 