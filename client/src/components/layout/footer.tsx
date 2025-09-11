import Link from "next/link";
import { Newspaper, Mail, Phone, MapPin, Twitter, Github, Youtube } from "lucide-react";

const staticSocialLinks = [
  { text: "twitter", href: "https://twitter.com/newshub", isExternal: true, isPrimary: false },
  { text: "github", href: "https://github.com/newshub", isExternal: true, isPrimary: false },
  { text: "youtube", href: "https://youtube.com/newshub", isExternal: true, isPrimary: false },
];

const footerLinks = {
  company: [
    { text: "About Us", href: "/about", isExternal: false },
    { text: "Our Team", href: "/team", isExternal: false },
    { text: "Careers", href: "/careers", isExternal: false },
    { text: "Contact", href: "/contact", isExternal: false },
  ],
  services: [
    { text: "Breaking News", href: "/news", isExternal: false },
    { text: "Expert Analysis", href: "/analysis", isExternal: false },
    { text: "Live Updates", href: "/live", isExternal: false },
    { text: "Premium Content", href: "/premium", isExternal: false },
  ],
  support: [
    { text: "Help Center", href: "/help", isExternal: false },
    { text: "Privacy Policy", href: "/privacy", isExternal: false },
    { text: "Terms of Service", href: "/terms", isExternal: false },
    { text: "Cookie Policy", href: "/cookies", isExternal: false },
  ],
};

function renderIcon(text: string) {
  switch (text.toLowerCase()) {
    case "twitter":
      return <Twitter className="w-5 h-5" />;
    case "github":
      return <Github className="w-5 h-5" />;
    case "youtube":
      return <Youtube className="w-5 h-5" />;
    default:
      return null;
  }
}

export function Footer() {
  const text = "NewsHub - Your trusted source for reliable journalism";
  const socialLinks = staticSocialLinks;

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">NewsHub</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Stay informed with breaking news, expert analysis, and thought-provoking articles
              from around the world. Your trusted source for reliable journalism.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  key={link.text}
                  target="_blank"
                >
                  {renderIcon(link.text)}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.text}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Stay Updated
            </h3>
            <p className="text-muted-foreground mb-4">
              Get the latest news delivered to your inbox
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NewsHub. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@newshub.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
