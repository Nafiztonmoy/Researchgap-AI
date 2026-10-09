import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5.5" y="4.5" width="23" height="30" rx="5.5" stroke="currentColor" strokeWidth="2.4" />
            <path d="M11 12.5H23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M11 18.5H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M11 24.5H16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="27" cy="26.5" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="M32.5 32L36 35.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24.2 26.5H29.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
    );
}
