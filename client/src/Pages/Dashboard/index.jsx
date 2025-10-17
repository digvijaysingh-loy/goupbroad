import { BarChart3, FileText, MessageSquare, Users } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import StatCard from '@/components/StackCard';
import TasksList from '@/components/TaskList';
import { useState, useEffect } from 'react';
import SidebarHeader from '@/components/SidebarHeader';
import { getStudentDashboardStats } from '@/services/dashboardService';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalPendingTasks: 0,
    totalCompletedTasks: 0,
    totalUniversityAssigned: 0,
    totalNewMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await getStudentDashboardStats();
        if (response.success) {
          setDashboardStats({
            totalPendingTasks: response.data.totalPendingTasks || 0,
            totalCompletedTasks: response.data.totalCompletedTasks || 0,
            totalUniversityAssigned: response.data.totalUniversityAssigned || 0,
            totalNewMessages: 0 // This isn't provided by the API, so we'll keep it at 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    {
      id: 1,
      icon: <BarChart3 className="text-white" />,
      iconBg: 'bg-[#FA5A7D]',
      count: isLoading ? '...' : String(dashboardStats.totalPendingTasks),
      title: 'My Pending Tasks',
      bgColor: 'bg-[#FFE2E5]',
    },
    {
      id: 2,
      icon: <FileText className="text-white" />,
      iconBg: 'bg-[#FF947A]',
      count: isLoading ? '...' : String(dashboardStats.totalCompletedTasks),
      title: 'Completed Tasks',
      bgColor: 'bg-[#FFF4DE]',
    },
    {
      id: 3,
      icon: <MessageSquare className="text-white" />,
      iconBg: 'bg-[#3CD856]',
      count: isLoading ? '...' : String(dashboardStats.totalNewMessages),
      title: 'New Messages',
      bgColor: 'bg-[#DCFCE7]',
    },
    {
      id: 4,
      icon: <Users className="text-white" />,
      iconBg: 'bg-[#BF83FF]',
      count: isLoading ? '...' : String(dashboardStats.totalUniversityAssigned),
      title: 'Universities Shortlisted',
      bgColor: 'bg-[#F3E8FF]',
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-screen">
        <AppSidebar isSidebarOpen={isOpen}/>
        <SidebarInset>
          <SidebarHeader isOpen={isOpen} setIsOpen={setIsOpen}/>
          
          <main className="p-3 md:p-6 bg-gray-50 min-w-0  overflow-x-hidden">
            <div className=" grid grid-cols-1 mt-4 sm:mt-6 md:mt-10 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8 bg-white p-4 sm:p-6 md:p-8 rounded-md">
              {stats.map((stat) => (
                <StatCard
                  key={stat.id}
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  count={stat.count}
                  title={stat.title}
                  bgColor={stat.bgColor}
                />
              ))}
            </div>

            <TasksList />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;