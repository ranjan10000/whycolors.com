'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight, Folder, FileText, MoreHorizontal } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  homeLabel?: string;
  separator?: React.ReactNode;
  maxItems?: number; // Maximum items to show before truncating
  showHomeIcon?: boolean;
}

export default function Breadcrumb({
  items = [],
  className = '',
  homeLabel = 'Home',
  separator = <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />,
  maxItems = 4,
  showHomeIcon = true,
}: BreadcrumbProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-generate breadcrumb from pathname if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items.length > 0) return items;

    if (!pathname || pathname === '/') {
      return [{ label: homeLabel, href: '/' }];
    }

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: homeLabel, href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Format the label: replace hyphens with spaces and capitalize
      let label = segment
        .replace(/-/g, ' ')
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
      
      // Special case for slugs (like blog post URLs)
      if (segment.includes('-') && segment.length > 20) {
        label = 'Post';
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrent: isLast,
      });
    });

    return breadcrumbs;
  };

  // Get truncated items for mobile
  const getDisplayItems = (allItems: BreadcrumbItem[]): BreadcrumbItem[] => {
    if (!isMobile || allItems.length <= maxItems) {
      return allItems;
    }

    // Always show first (Home) and last (Current) items
    const firstItem = allItems[0];
    const lastItem = allItems[allItems.length - 1];
    
    // Show Home, then "...", then last 2 items
    return [
      firstItem,
      { label: '...', href: '#', isCurrent: false } as BreadcrumbItem,
      ...allItems.slice(-2),
    ];
  };

  const breadcrumbItems = generateBreadcrumbs();
  const displayItems = getDisplayItems(breadcrumbItems);
  const isTruncated = displayItems.some(item => item.label === '...');

  if (!mounted) {
    return (
      <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </nav>
    );
  }

  return (
    <nav 
      className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${className}`} 
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-0.5 sm:gap-1.5 min-w-0">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0;
          const isEllipsis = item.label === '...';

          return (
            <li key={item.href + index} className="flex items-center gap-0.5 sm:gap-1.5 min-w-0">
              {!isFirst && separator}
              
              {isEllipsis ? (
                <span className="flex items-center px-1 text-gray-400 dark:text-gray-500">
                  <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                </span>
              ) : isLast ? (
                <span
                  className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium cursor-default truncate max-w-[120px] sm:max-w-[200px]"
                  aria-current="page"
                >
                  {isFirst && showHomeIcon ? (
                    <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" aria-hidden="true" />
                  ) : item.label === 'Post' ? (
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" aria-hidden="true" />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors
                    hover:bg-gray-100 dark:hover:bg-white/10
                    text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                    truncate max-w-[80px] sm:max-w-[150px]
                  `}
                >
                  {isFirst && showHomeIcon && (
                    <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile breadcrumb counter */}
      {isMobile && breadcrumbItems.length > 2 && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1 flex-shrink-0 hidden xs:inline">
          {breadcrumbItems.length - 1} pages
        </span>
      )}
    </nav>
  );
}