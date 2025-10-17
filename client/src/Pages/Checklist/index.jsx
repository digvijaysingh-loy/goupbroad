import { useState, useEffect, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';
import { Check, LockKeyhole, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStudentTasks } from '@/services/taskService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Checklist = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getStudentTasks({
        sortOrder: 'desc',
        page: currentPage,
        limit: 10
      });

      if (response.success) {
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
        // Select first task by default if none selected
        if (!selectedTaskId && response.data.tasks.length > 0) {
          setSelectedTaskId(response.data.tasks[0]._id);
        }
      } else {
        toast.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('An error occurred while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedTaskId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const selectedTask = tasks.find(task => task._id === selectedTaskId);
  const subtasks = selectedTask?.subtasks || [];

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
  };

  const handleQuestionnaireClick = (taskId, subtaskId) => {
    // Navigate to the questionnaires list page
    navigate(`/questionnaires/${taskId}/${subtaskId}`);
  };

  const checklistItems = tasks.map(task => ({
    id: task._id,
    type: task.title,
    university: task.description || 'No description',
    program: `Priority: ${task.priority}`,
    status: task.subtasks?.some(st => st.isLocked) ? 'locked' : 'completed',
    isHighlighted: task._id === selectedTaskId
  }));

  const formattedTasks = subtasks.map(subtask => ({
    id: subtask._id,
    title: subtask.title,
    assignedTo: 'Me',
    deadline: subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : 'Not set',
    status: subtask.isLocked ? 'locked' : 'pending',
    taskId: selectedTask._id, // Add taskId for questionnaire navigation
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={isSidebarOpen} />

        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3">
                <h2 className="text-xl font-semibold text-primary-1 mb-4">Tasks</h2>

                {isLoading ? (

                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="mb-4 rounded-lg overflow-hidden bg-white animate-pulse">
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  checklistItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleTaskClick(item.id)}
                      className={`mb-4 rounded-lg overflow-hidden cursor-pointer ${item.isHighlighted ? 'bg-primary-1 text-white' : 'bg-white'
                        }`}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-grow">
                          <h3 className={`font-medium ${item.isHighlighted ? 'text-white' : 'text-primary-1'}`}>
                            {item.type}
                          </h3>
                          <p className={`text-sm mt-1 ${item.isHighlighted ? 'text-white' : 'text-gray-700'}`}>
                            {item.university}
                          </p>
                          <p className={`text-xs ${item.isHighlighted ? 'text-gray-200' : 'text-gray-500'}`}>
                            {item.program}
                          </p>
                        </div>
                        {item.status === 'completed' ? (
                          <div className={`rounded-full p-1 ${item.isHighlighted ? 'bg-white' : 'bg-primary-1'}`}>
                            <Check className={`h-5 w-5 ${item.isHighlighted ? 'text-primary-1' : 'text-white'}`} />
                          </div>
                        ) : (
                          <LockKeyhole className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))
                )}

                {!isLoading && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={!pagination.hasPrevPage}
                      className={`p-2 rounded ${!pagination.hasPrevPage ? 'text-gray-400' : 'text-primary-1 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`p-2 rounded ${!pagination.hasNextPage ? 'text-gray-400' : 'text-primary-1 hover:bg-gray-100'}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 mt-10">
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <h2 className="text-xl font-semibold text-black mb-4">
                    {selectedTask ? `Subtasks in ${selectedTask.title}` : 'Select a task to view subtasks'}
                  </h2>

                  {isLoading ? (

                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="mb-4 p-4 rounded-lg bg-gray-50 animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    formattedTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`mb-4 p-4 rounded-lg ${task.status === 'locked'
                            ? 'bg-gray-100'
                            : index % 2 === 0 ? 'bg-red-50' : 'bg-primary-1/10'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {task.status === 'locked' && <LockKeyhole className="h-5 w-5 text-gray-400 mr-2" />}
                            <h3 className="font-medium text-gray-800">
                              {task.title}
                            </h3>
                          </div>
                          {task.status !== 'locked' && (
                            <button 
                              onClick={() => handleQuestionnaireClick(task.taskId, task.id)}
                              className="bg-primary-1 cursor-pointer hover:bg-teal-800 text-white text-xs font-medium py-2 px-5 rounded"
                            >
                              Goto Questionnaire
                            </button>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Assigned to: </span>
                            <span className="font-medium bg-white px-1 rounded-xs">{task.assignedTo}</span>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-gray-600">Deadline: </span>
                            <span className="font-medium bg-white px-1 rounded-xs">{task.deadline}</span>
                          </div>
{/* 
                          {task.status !== 'locked' && (
                            <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white text-xs font-medium py-2 px-3 rounded">
                              Send Message to AIFA
                            </button>
                          )}

                          {task.status === 'locked' && (
                            <button className="bg-orange-300 text-white text-xs font-medium py-2 px-3 rounded cursor-not-allowed">
                              Send Message to AIFA
                            </button>
                          )} */}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Checklist;