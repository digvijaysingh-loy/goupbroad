import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAdminStudentActivities, getAdminDashboardStats, getAdminUpcomingDeadlines } from '@/services/adminActivityService';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
}


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActiveApplications: 0,
    totalPendingTasks: 0,
    totalCompletedTasks: 0,
    statsChange: {},
  });
  const [activities, setActivities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    activities: true,
    deadlines: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading({
        stats: true,
        activities: true,
        deadlines: true,
      });
      setError(null);
      
      try {
        const statsRes = await getAdminDashboardStats();
        
        setStats({
          totalStudents: statsRes.data?.totalStudents || 0,
          totalActiveApplications: statsRes.data?.totalActiveApplications || 0,
          totalPendingTasks: statsRes.data?.totalPendingTasks || 0,
          totalCompletedTasks: statsRes.data?.totalCompletedTasks || 0,
          statsChange: statsRes.data?.statsChange || {
            totalStudents: '0%',
            totalActiveApplications: '0%',
            totalPendingTasks: '0%',
            totalCompletedTasks: '0%'
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
      
      try {
        const activitiesRes = await getAdminStudentActivities(1, 5 , {});
        setActivities(activitiesRes.data?.activities || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(prev => ({ ...prev, activities: false }));
      }
      
      try {
        const deadlinesRes = await getAdminUpcomingDeadlines(1, 5);
        setDeadlines(deadlinesRes.data?.upcomingDeadlines || []);
      } catch (err) {
        console.error('Error fetching deadlines:', err);
      } finally {
        setLoading(prev => ({ ...prev, deadlines: false }));
      }
    }
    
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Calendar className="mr-2 h-4 w-4" /> {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6">
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading.stats ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="pt-6 pb-4">
                      <div className="text-center text-muted-foreground py-4">Loading...</div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Total Students</div>
                    <div className="text-3xl font-bold mt-1">
                      {stats.totalStudents}
                    </div>
                    
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Active Applications</div>
                    <div className="text-3xl font-bold mt-1">
                      {stats.totalActiveApplications}
                    </div>
                   
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Pending Tasks</div>
                    <div className="text-3xl font-bold mt-1">
                      {stats.totalPendingTasks}
                    </div>
                    
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Completed Tasks</div>
                    <div className="text-3xl font-bold mt-1">
                      {stats.totalCompletedTasks}
                    </div>
                    
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main Content Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="col-span-2 bg-white rounded-lg shadow-sm p-6 max-md:p-3">
              <div className="font-semibold text-lg mb-4">Recent Activity</div>
              <div className="divide-y">
                {loading.activities ? (
                  <div className="text-center text-muted-foreground py-8">Loading activities...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No recent activity found.</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity._id} className="flex items-center py-4 gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600">
                        {getInitials(activity.student?.name || activity.student?.email || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{activity.student?.name || activity.student?.email || 'Unknown Student'}</div>
                        <div className="text-sm text-muted-foreground">{activity.message}</div>
                      </div>
                      <div className="flex flex-col items-end min-w-[100px]">
                        <span className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${activity.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{activity.status?.toLowerCase()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  className="text-primary-600"
                  onClick={() => {

                    if (typeof window !== 'undefined') {
                      window.location.href = '/admin/all-activities';
                    }
                  }}
                >
                  View All
                </Button>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white max-lg:col-span-2 rounded-lg shadow-sm p-6 max-md:p-3">
              <div className="font-semibold text-lg mb-4">Upcoming Deadlines</div>
              <div className="space-y-4">
                {loading.deadlines ? (
                  <div className="text-center text-muted-foreground py-8">Loading deadlines...</div>
                ) : deadlines.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Not available</div>
                ) : (
                  deadlines.map((deadline, i) => (
                    <div key={deadline._id || i} className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        deadline.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        deadline.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 
                        deadline.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-green-100 text-green-700'}`}>
                        {deadline.title?.[0] || 'T'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{deadline.title || 'Not available'}</div>
                        <div className="text-xs text-muted-foreground">{deadline.student?.name || deadline.student?.email || 'Not available'}</div>
                      </div>
                      <div className="flex flex-col items-end min-w-[90px]">
                        <span className="text-xs text-gray-500">
                          {deadline.dueDate ? new Date(deadline.dueDate).toLocaleDateString() : 
                           deadline.assignedAt ? new Date(deadline.assignedAt).toLocaleDateString() : 
                           'Not set'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;