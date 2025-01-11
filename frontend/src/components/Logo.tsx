'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/images/branding/DealSightLogo.png"
        alt="DealSight Logo"
        width={120}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </Link>
  );
} 