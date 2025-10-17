import { AlignLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStudentUpcomingTasks } from '@/services/dashboardService';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        setIsLoading(true);
        const response = await getStudentUpcomingTasks({
          page: pagination.page,
          limit: pagination.limit
        });
        
        if (response.success) {
          const formattedTasks = response.data.upcomingTasks.map(task => ({
            id: task._id,
            name: task.title,
            category: task.priority || 'NORMAL',
            deadline: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB') : 'No deadline'
          }));
          
          setTasks(formattedTasks);
          setPagination({
            page: response.data.currentPage || 1,
            limit: response.data.limit || 10,
            total: response.data.total || 0,
            totalPages: response.data.pages || 1
          });
        }
      } catch (error) {
        console.error('Error fetching upcoming tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingTasks();
  }, [pagination.page, pagination.limit]);

  return (
    <div className="rounded-md bg-white p-4 md:p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Upcoming Tasks
        {isLoading && <span className="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-primary-1 animate-spin"></span>}
      </h3>
      
      {tasks.length > 0 ? (
        <>
          <div className="hidden md:block bg-white overflow-hidden rounded-none">
            <table className="min-w-full">
              <thead className="border-y border-primary-1">
                <tr className="text-left text-black">
                  <th className="px-6 py-3 text-sm">Task</th>
                  <th className="px-6 py-3 text-sm">Priority</th>
                  <th className="px-6 py-3 text-sm text-right">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-gray-800 font-medium">{task.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center font-semibold">
                        <AlignLeft className="h-4 w-4 text-primary-1 mr-2 font-bold" />
                        <span className="text-primary-1">{task.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex px-3 py-1 text-sm font-medium text-white bg-primary-1 rounded-md">
                        {task.deadline}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="md:hidden space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-50 p-4 rounded-md shadow-sm">
                <div className="mb-3">
                  <span className="text-gray-800 font-medium">{task.name}</span>
                </div>
                <div className="flex items-center font-semibold mb-3">
                  <AlignLeft className="h-4 w-4 text-primary-1 mr-2 font-bold" />
                  <span className="text-primary-1 text-sm">{task.category}</span>
                </div>
                <div className="flex justify-end">
                  <span className="inline-flex px-3 py-1 text-sm font-medium text-white bg-primary-1 rounded-md">
                    {task.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !isLoading && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No upcoming tasks</h3>
          <p className="text-gray-500 max-w-md">
            There are no tasks scheduled for you at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default TasksList;
