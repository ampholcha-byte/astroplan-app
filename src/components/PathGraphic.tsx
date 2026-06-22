export default function PathGraphic() {
  return (
    <svg
      viewBox="0 0 60 20"
      className="w-full h-3 opacity-40 text-current"
      preserveAspectRatio="none"
    >
      <text x="2" y="16" fontSize="7" fill="currentColor">E</text>
      <text x="26" y="16" fontSize="7" fill="currentColor">S</text>
      <text x="50" y="16" fontSize="7" fill="currentColor">W</text>
      <path
        d="M 5 12 Q 30 -5 55 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
