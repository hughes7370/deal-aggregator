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
        width={150}
        height={40}
        className="h-10 w-auto"
        priority
      />
    </Link>
  );
} 