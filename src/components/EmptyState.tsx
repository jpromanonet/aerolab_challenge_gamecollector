import Image from "next/image";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {

  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      {/* Simple sad face emoji */}
      <div className="mb-4 mt-5">
        <Image src="/nothing.svg" alt="Empty image" width={400} height={170} />
      </div>
      
      <h3 className="text-md font-bold text-black mb-2">{title}</h3>
      <p className="text-gray-600 text-sm text-center max-w-md">{description}</p>
    </div>
  );
} 