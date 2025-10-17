import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User,
  Calendar,
  ChevronDown,
  LogOut,
  Settings,

} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { getUser, getUserInitials, logout, subscribeToAuth } from '@/lib/auth';

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userInitials, setUserInitials] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/signin');
      return;
    }
    setUser(userData);
    setUserInitials(getUserInitials());


    const unsubscribe = subscribeToAuth((isAuthenticated) => {
      if (!isAuthenticated) {
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);
    const handleLogout = () => {
    try {

      logout();

      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const userEmail = user?.email || '';
  
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur flex items-center px-4 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold ">Dashboard</h2>
          
          {/* {searchOpen ? (
            <div className="relative md:ml-4 ml-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-[300px] bg-background"
                placeholder="Search students, applications..."
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-2" 
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )} */}
        </div>
        
        <div className="flex items-center gap-2">
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Today</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuLabel>Date Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Yesterday</DropdownMenuItem>
              <DropdownMenuItem>This Week</DropdownMenuItem>
              <DropdownMenuItem>This Month</DropdownMenuItem>
              <DropdownMenuItem>This Quarter</DropdownMenuItem>
              <DropdownMenuItem>This Year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>           */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage src="" alt={user?.name || userEmail} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || userEmail}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate('/admin')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate('/admin/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}