import { Button } from "@/components/ui/button";

const NAV_LINKS = ["Services", "About Us", "Projects", "Team", "Contacts"];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5">
      <span className="text-foreground text-xl font-semibold tracking-tight select-none">
        SENTINEL
      </span>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(" ", "-")}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
          >
            {link}
          </a>
        ))}
      </div>

      <Button variant="navCta" size="lg" className="hidden md:inline-flex rounded-lg px-6">
        Get Quote
      </Button>
    </nav>
  );
}
