// 중요 날짜 표시용 빨간 별 (모서리가 둥근 귀여운 별)
interface ImportantStarProps {
  size?: number;
  filled?: boolean;
  strokeWidth?: number;
  className?: string;
}

const ImportantStar: React.FC<ImportantStarProps> = ({ size = 10, filled = true, strokeWidth = 2.4, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

export default ImportantStar;
