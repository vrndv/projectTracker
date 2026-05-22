
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 text-xs rounded-md bg-gray-800 text-white">
      {children}
    </span>
  );
}