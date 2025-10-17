import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  School,
  MessageSquare,
  FileQuestion,
  FolderOpen,
  HelpCircle,
  Settings,
} from 'lucide-react';

import logo from '/logo.svg';
import { SidebarHeader } from '../ui/sidebar';

const sidebarItems = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Student Management',
    path: '/admin/students',
    icon: Users,
  },  {
    title: 'Tasks',
    path: '/admin/tasks',
    icon: ClipboardList,
  },
  {
    title: 'Subtasks',
    path: '/admin/subtasks',
    icon: FileText,
  },
  {
    title: 'Application & Essays',
    path: '/admin/applications',
    icon: FileText,
  },
  {
    title: 'University Management',
    path: '/admin/universities',
    icon: School,
  },
  {
    title: 'Communication',
    path: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Questionnaires',
    path: '/admin/forms',
    icon: FileQuestion,
  },
  {
    title: 'Document Manager',
    path: '/admin/documents',
    icon: FolderOpen,
  },
  {
    title: 'FAQs & Knowledge Base',
    path: '/admin/faqs',
    icon: HelpCircle,
  },
  {
    title: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [isOpen , setIsOpen] = useState(true)

  return (
    <>
      <Sidebar collapsible='icon' className={`border-r border-border overflow-hidden `}>

        <SidebarHeader  className={'bg-white'} >
          {collapsed && (
            <div className="py-4 ml-1">
              <img src="/logo.svg" height={35} width={35} />
            </div>
          )}
            {!collapsed && (
          <div className="md:py-6 flex items-center space-x-3 px-1">
              <>
                <img src="/logo.svg" height={40} width={40} />
                <span className={cn("text-2xl font-bold text-gray-900" )}>GoupBroad</span>
              </>
          </div>
            )}
      </SidebarHeader>
 
        <SidebarContent className={`p-2 w-fit`}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        location.pathname === item.path ? 'bg-primary-1 text-white' : 'hover:bg-gray-300/50'
                      )}
                    >
                      <Link to={item.path} className="w-full flex items-center">
                        <item.icon className={cn('h-5 w-5', collapsed ? 'mx-auto' : 'mr-2')} />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {collapsed && (
          <div className="mt-auto p-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="h-8 w-8 mx-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Sidebar>
      
      <div className="mt-5">
        <SidebarTrigger onClick={()=>{setIsOpen(!isOpen) ; console.log("worked")}}>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
      </div>
    </>
  );
}