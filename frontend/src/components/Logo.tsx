interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: { container: 'h-8', text: 'text-lg', icon: 24 },
    md: { container: 'h-12', text: 'text-2xl', icon: 32 },
    lg: { container: 'h-16', text: 'text-4xl', icon: 48 }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ícone da cruz farmacêutica */}
      <div className={`${currentSize.container} aspect-square bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md`}>
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cruz farmacêutica moderna */}
          <path
            d="M12 6C12 4.89543 12.8954 4 14 4H18C19.1046 4 20 4.89543 20 6V12H26C27.1046 12 28 12.8954 28 14V18C28 19.1046 27.1046 20 26 20H20V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V20H6C4.89543 20 4 19.1046 4 18V14C4 12.8954 4.89543 12 6 12H12V6Z"
            fill="white"
          />
          {/* Detalhe de pílula/cápsula */}
          <circle cx="16" cy="16" r="3" fill="#10b981" />
        </svg>
      </div>
      
      {/* Nome da marca */}
      <div className={`${currentSize.text} font-bold`}>
        <span className="text-emerald-600">Site</span>
        <span className="text-gray-800">Farma</span>
      </div>
    </div>
  );
}
