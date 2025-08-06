import Link from "next/link";
import 'animate.css';
import classes from './logo.module.css'
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className="animate__animated animate__slideInUp">
      <Image src="/logo.svg" alt="Logo" className={classes.logo} width={180} height={22} />
    </Link>
  );
} 