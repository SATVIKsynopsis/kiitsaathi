import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, User, Bell, LogOut, LogIn, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">KIIT Saathi</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Home
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Services
              </Button>
            </Link>
            <Link to="/faculty-review">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Faculty Review
              </Button>
            </Link>
            <Link to="/our-team">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Our Team
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                FAQ
              </Button>
            </Link>
            <Link to="/feedback">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Feedback
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Contact
              </Button>
            </Link>
            <Link to="/campus-map">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Campus Map
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="text-white hover:bg-white/20 rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <Link to="/admin/faculty-review">
              <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium" disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate("/auth")} 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full"
              >
                <LogIn className="w-5 h-5" />
              </Button>
            )}
            
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                <Bell className="w-5 h-5" />
              </Button>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                1
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;