import Link from 'next/link';
import { getColorPageColors   } from '@/lib/color-cache.server';
import { getColorName } from '@/lib/color-utils';
import ColorClient from './ColorClient';

export default function ColorPage() {
  const allColors = getColorPageColors ();
  const displayColors = allColors.slice(0, 24);
  
  return <ColorClient initialColors={displayColors} totalColors={allColors.length} />;
}