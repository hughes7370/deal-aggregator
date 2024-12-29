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
        width={40}
        height={40}
        className="mr-2"
      />
      <span className="text-xl font-semibold text-gray-900">
        DealSight
      </span>
    </Link>
  );
} 