import Image from "next/image";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Image
      src="/mygloven-logo.svg"
      alt="my'G"
      width={120}
      height={32}
      className={className}
      style={{ filter: "invert(1)" }}
      priority
    />
  );
}
