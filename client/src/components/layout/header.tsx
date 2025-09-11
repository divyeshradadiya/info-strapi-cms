'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNavbar } from "@/components/custom/mobile-navbar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  const logoText = "NewsHub";

  const navItems = [
    { text: "Home", href: "/" },
    { text: "Blog", href: "/blog" },
  ];

  return (
    <header className="flex items-center justify-between gap-10 py-4 px-10 sm:px-5 bg-card ">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <svg viewBox="0 0 238 238" fill="none" className="size-6 text-primary">
          <path
            d="M236.738 121.995C236.743 125.448 236.415 128.865 235.749 132.25C235.077 135.635 234.082 138.922 232.764 142.109C231.441 145.297 229.822 148.328 227.9 151.193C225.978 154.063 223.796 156.708 221.348 159.146L162.816 217.651C161.816 216.88 160.874 216.052 159.978 215.161C159.249 214.432 158.556 213.667 157.905 212.87C157.254 212.073 156.639 211.245 156.066 210.385C155.493 209.531 154.967 208.646 154.478 207.74C153.993 206.828 153.556 205.896 153.16 204.943C152.764 203.995 152.421 203.021 152.124 202.036C151.822 201.052 151.572 200.052 151.374 199.042C151.171 198.031 151.02 197.01 150.921 195.984C150.816 194.958 150.77 193.932 150.77 192.901C150.77 191.87 150.816 190.844 150.921 189.818C151.02 188.792 151.171 187.771 151.374 186.76C151.572 185.75 151.822 184.75 152.124 183.766C152.421 182.776 152.764 181.807 153.16 180.854C153.556 179.906 153.993 178.974 154.478 178.063C154.967 177.156 155.493 176.271 156.066 175.417C156.639 174.557 157.254 173.729 157.905 172.932C158.556 172.135 159.249 171.37 159.978 170.641L211.41 119.203L159.988 67.7656C159.27 67.0417 158.582 66.2865 157.931 65.4948C157.285 64.7031 156.676 63.8854 156.103 63.0313C155.535 62.1823 155.009 61.3073 154.525 60.4063C154.04 59.5052 153.603 58.5833 153.212 57.6406C152.816 56.6979 152.467 55.7396 152.171 54.7604C151.868 53.7813 151.613 52.7917 151.41 51.7917C151.207 50.7865 151.051 49.7813 150.947 48.7604C150.842 47.7448 150.785 46.724 150.78 45.7031C150.775 44.6771 150.816 43.6615 150.91 42.6406C151.004 41.625 151.145 40.6094 151.337 39.6094C151.53 38.6042 151.77 37.6094 152.056 36.6302C152.348 35.6458 152.681 34.6823 153.066 33.7344C153.447 32.7865 153.874 31.8594 154.348 30.9531C154.822 30.0469 155.337 29.1615 155.895 28.3073C156.452 27.4479 157.051 26.625 157.691 25.8229C158.332 25.026 159.004 24.2604 159.717 23.5312C160.712 24.3125 161.655 25.151 162.546 26.0469L221.348 84.849C223.796 87.2813 225.983 89.9323 227.905 92.7969C229.827 95.6667 231.447 98.6927 232.764 101.88C234.087 105.068 235.082 108.354 235.749 111.74C236.421 115.125 236.749 118.542 236.738 121.995Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-heading text-xl font-bold text-foreground">{logoText}</span>
      </Link>

      {/* Desktop Nav */}
      <div className="flex items-center gap-10">
        <nav className="hidden items-center gap-10 md:flex justify-end">
          {navItems.map((item) => (
            <Link
              key={item.text}
              href={item.href}
              className="flex cursor-pointer items-center text-lg font-medium text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            >
              {item.text}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <MobileNavbar>
          <div className="rounded-b-lg bg-card py-4 container text-foreground shadow-xl border-t border-border">
            <nav className="flex flex-col gap-1 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.text}
                  href={item.href}
                  className="flex w-full cursor-pointer items-center rounded-md p-2 font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                >
                  {item.text}
                </Link>
              ))}
            </nav>
          </div>
        </MobileNavbar>
      </div>
    </header>
  );
}