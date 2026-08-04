import Link from 'next/link';
import { getColorCache } from '@/lib/color-cache';
import { getColorName } from '@/lib/color-utils';
import ColorClient from './ColorClient';

export default function ColorPage() {
  const allColors = getColorCache();
  const displayColors = allColors.slice(0, 24);
  
  return <ColorClient initialColors={displayColors} totalColors={allColors.length} />;
}