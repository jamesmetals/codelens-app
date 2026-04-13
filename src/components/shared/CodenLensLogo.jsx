export default function CodenLensLogo({ size = 36, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="CodenLens logo"
    >
      <defs>
        <radialGradient id="cl-bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d1f3c" />
          <stop offset="100%" stopColor="#060e20" />
        </radialGradient>
        <radialGradient id="cl-eyeGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
        <filter id="cl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer soft glow ring */}
      <circle cx="50" cy="50" r="46" stroke="#00e5ff" strokeWidth="1" opacity="0.25" filter="url(#cl-glow)" />
      {/* Main circle background */}
      <circle cx="50" cy="50" r="44" fill="url(#cl-bgGrad)" />
      {/* Neon dashed ring */}
      <circle
        cx="50" cy="50" r="41"
        stroke="#00e5ff" strokeWidth="3"
        strokeDasharray="8 5" strokeLinecap="round"
        filter="url(#cl-glow)"
      />
      {/* Inner subtle ring */}
      <circle cx="50" cy="50" r="33" stroke="#00c0ea" strokeWidth="1.2" opacity="0.5" />

      {/* Left bracket < */}
      <path d="M22 50 L32 40 L32 44.5 L27 50 L32 55.5 L32 60 Z" fill="#00e5ff" filter="url(#cl-glow)" />
      {/* Right bracket > */}
      <path d="M78 50 L68 40 L68 44.5 L73 50 L68 55.5 L68 60 Z" fill="#00e5ff" filter="url(#cl-glow)" />

      {/* Top tick mark */}
      <rect x="47" y="20" width="6" height="3.5" rx="1.75" fill="#00e5ff" opacity="0.75" />
      {/* Bottom tick mark */}
      <rect x="47" y="76.5" width="6" height="3.5" rx="1.75" fill="#00e5ff" opacity="0.75" />

      {/* Eye (lens) shape */}
      <ellipse cx="50" cy="50" rx="12" ry="8.5" fill="url(#cl-eyeGrad)" filter="url(#cl-glow)" />
      {/* Pupil */}
      <circle cx="50" cy="50" r="5" fill="#130834" />
      {/* Pupil glow highlight */}
      <circle cx="48.5" cy="48.5" r="2" fill="#c4b5fd" opacity="0.85" />
    </svg>
  );
}
