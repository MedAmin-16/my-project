import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Programs", path: "/programs" },
    { name: "Submissions", path: "/submissions" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  // Function to check if the link is active
  const isActive = (path: string) => {
    return path === "/" ? location === path : location.startsWith(path);
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-terminal border-b border-matrix/30 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-matrix text-xl font-mono font-bold">CyberHunt_</a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`${
                      isActive(link.path)
                        ? "text-light-gray border-matrix"
                        : "text-dim-gray border-transparent hover:text-matrix"
                    } border-b-2 px-3 pt-5 pb-3 text-sm font-mono`}
                  >
                    {link.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-light-gray hover:text-matrix focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-matrix/20 flex items-center justify-center border border-matrix/30">
                  <span className="text-xs font-mono text-matrix">
                    {user?.username?.substring(0, 2).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-mono">{user?.username || "user"}</span>
                <ChevronDown className="h-4 w-4 text-dim-gray" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-terminal border border-matrix/30 mt-1">
                <DropdownMenuItem className="text-light-gray hover:bg-matrix/10 cursor-pointer font-mono text-sm">
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-light-gray hover:bg-matrix/10 cursor-pointer font-mono text-sm">
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-matrix/20" />
                <DropdownMenuItem 
                  className="text-alert-red hover:bg-matrix/10 cursor-pointer font-mono text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center sm:hidden ml-4">
              <button
                onClick={toggleMobileMenu}
                className="text-light-gray hover:text-matrix focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-matrix/30">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a
                  className={`block px-3 py-2 rounded-md text-base font-mono ${
                    isActive(link.path)
                      ? "text-light-gray bg-matrix/10 border-l-2 border-matrix"
                      : "text-dim-gray hover:bg-matrix/10 hover:text-light-gray"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
            <Link href="/profile">
              <a
                className="block px-3 py-2 rounded-md text-base font-mono text-dim-gray hover:bg-matrix/10 hover:text-light-gray"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </a>
            </Link>
            <Link href="/settings">
              <a
                className="block px-3 py-2 rounded-md text-base font-mono text-dim-gray hover:bg-matrix/10 hover:text-light-gray"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </a>
            </Link>
            <button
              className="block w-full text-left px-3 py-2 rounded-md text-base font-mono text-alert-red hover:bg-matrix/10"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
