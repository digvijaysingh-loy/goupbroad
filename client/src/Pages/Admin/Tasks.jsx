import { useState, useEffect } from 'react';
import { servicesAxiosInstance } from '@/services/config';
import { getUser } from '@/lib/auth';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addStudentsToTask,
  removeStudentFromTask,
  addSubtasksToTask,
  removeSubtaskFromTask,
  updateTaskSubtaskAssignment
} from '@/services/taskService';
import { getSubtasks, getSubtasksByTaskAndStudent } from '@/services/subtaskService';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/taskCategoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, X, Briefcase } from 'lucide-react';


const Tasks = () => {
  const [mainTaskCategories, setMainTaskCategories] = useState([]);
  const [selectedMainTask, setSelectedMainTask] = useState('');

  // Permission check functions
  const hasAdminPermission = () => {
    const currentUser = getUser();
    return currentUser && currentUser.role === 'ADMIN';
  };

  const hasEditPermission = () => {
    const currentUser = getUser();
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
  };

  const subtaskTemplates = {
    'Application Documents': [
      'Draft SOP',
      'Review with counselor',
      'Final submission'
    ],
    'Test Preparation': [
      'Mock test',
      'Review session',
      'Practice questions'
    ],
    'Financial Documentation': [
      'Bank statements',
      'Affidavit preparation',
      'Source of funds'
    ],
    'Visa Application': [
      'Form filling',
      'Document preparation',
      'Interview preparation'
    ],
    'University Selection': [
      'Research universities',
      'Shortlist options',
      'Compare programs'
    ]
  };

  const [loading, setLoading] = useState({
    tasks: false,
    add: false,
    edit: false,
    delete: false,
    students: false,
    subtasks: false,
    members: false,
    categories: false
  });


  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableSubtasks, setAvailableSubtasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');

  const [selectedStudentDetails, setSelectedStudentDetails] = useState([]);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'HIGH',
    logo: '',
    assignee: ''
  });

  // State for task details dialog
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState(null);
  const [studentSubtasks, setStudentSubtasks] = useState([]);

  // State for category management dialog
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [newCategoryData, setNewCategoryData] = useState({ name: '', description: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});

  // New state for student dropdown
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [studentPagination, setStudentPagination] = useState({});
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);


  const validateTaskData = (data) => {
    if (!data.title?.trim()) {
      toast.error('Task title is required');
      return false;
    }
    return true;
  };


  const handleMainTaskChange = (value) => {
    setSelectedMainTask(value);
  };

  // Updated fetchStudents function
  const fetchStudents = async (searchQuery = studentSearch, page = 1) => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const params = { search: searchQuery, page, limit: 10 };
      const response = await servicesAxiosInstance.get('/admin/students', { params });
      if (response.data.success) {
        setStudents(response.data.data.students.map(student => ({
          id: student._id,
          name: student.name || student.email,
          email: student.email
        })));
        setStudentPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };
 
  useEffect(()=>{
    fetchStudents()
  },[studentSearch])
  
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async (page = 1) => {
      try {
        setLoading(prev => ({ ...prev, tasks: true }));
        const response = await getTasks({ page: page, limit: 10 });

        const { tasks, pagination } = response.data;

        const transformedTasks = tasks.map(task => ({
          ...task,
          status: task.subtasks.length > 0 ?
            task.subtasks.every(st => st.status === 'COMPLETED') ? 'COMPLETED' :
            task.subtasks.some(st => st.status === 'IN_PROGRESS') ? 'IN_PROGRESS' : 'PENDING'
            : 'PENDING',
          studentNames: task.students?.map(s => s?.name || s?.email).join(', '),
          subtaskCount: task.subtasks?.length || 0
        }));

        setTasks(transformedTasks);
        setPaginationData(pagination);
        setCurrentPage(page);

      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks : '+ error.response?.data?.message);
      } finally {
        setLoading(prev => ({ ...prev, tasks: false }));
      }
    };

    const fetchTeamMembers = async () => {
      // Only fetch team members if user is an admin
      if (!hasAdminPermission()) {
        return;
      }

      try {
        setLoading(prev => ({ ...prev, members: true }));
        const response = await servicesAxiosInstance.get('/admin/members');
        if (response.data.success && isMounted) {
          setTeamMembers(response.data.data.members
            .filter(member => member.status === 'ACTIVE')
            .map(member => ({
              id: member._id,
              name: `${member.firstName} ${member.lastName}`,
              role: member.role,
              status: member.status
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        if (isMounted) toast.error(error.response?.data?.message || 'Failed to fetch team members');
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, members: false }));
      }
    };

    const fetchSubtasks = async () => {
      try {
        setLoading(prev => ({ ...prev, subtasks: true }));
        const response = await getSubtasks();
        if (response?.data?.subtasks && isMounted) {
          setAvailableSubtasks(response.data.subtasks.map(subtask => ({
            id: subtask._id,
            title: subtask.title,
            description: subtask.description,
            priority: subtask.priority
          })));
        }
      } catch (error) {
        console.error('Error fetching subtasks:', error);
        if (isMounted) toast.error('Failed to fetch subtasks: '+ error.response?.data?.message);
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, subtasks: false }));
      }
    };

    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const response = await getCategories();
        if (response.success && isMounted) {
          const categories = response.data.categories || [];
          setMainTaskCategories(categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (isMounted) toast.error('Failed to fetch categories: ' + error.response?.data?.message);
      } finally {
        if (isMounted) setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    const fetchInitialData = async () => {
      try {
        if (!isMounted) return;
        await fetchTeamMembers();
        await fetchSubtasks();
        await fetchTasks();
        await fetchStudents('', 1);
        await fetchCategories();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Standalone fetch functions for use throughout the component
   const fetchTasks = async (page = 1) => {
      try {
        setLoading(prev => ({ ...prev, tasks: true }));

        const response = await getTasks({ page: page, limit: 10 });

        const { tasks, pagination } = response.data;

        const transformedTasks = tasks.map(task => ({
          ...task,
          status: task.subtasks.length > 0 ?
            task.subtasks.every(st => st.status === 'COMPLETED') ? 'COMPLETED' :
            task.subtasks.some(st => st.status === 'IN_PROGRESS') ? 'IN_PROGRESS' : 'PENDING'
            : 'PENDING',
          studentNames: task.students?.map(s => s?.name || s?.email).join(', '),
          subtaskCount: task.subtasks?.length || 0
        }));

        setTasks(transformedTasks);
        setPaginationData(pagination);
        setCurrentPage(page);

      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks: '+ error.response?.data?.message);
      } finally {
        setLoading(prev => ({ ...prev, tasks: false }));
      }
    };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await getCategories();
      if (response.success) {
        const categories = response.data.categories || [];
        setMainTaskCategories(categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories: '+ error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;

    // Check if user has permission to delete tasks
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to delete tasks');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await deleteTask(taskId);
      await fetchTasks();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };




  const handleSubtaskSelection = async (subtaskId) => {
    const subtask = availableSubtasks.find(s => s?.id === subtaskId);

    if (subtask && !selectedSubtasks.includes(subtask.id)) {
      setSelectedSubtasks([...selectedSubtasks, subtask.id]);

      if (isEditTaskOpen && selectedTask) {
        try {
          setLoading(prev => ({ ...prev, subtasks: true }));
          await addSubtasksToTask(selectedTask._id, {
            subtaskIds: [subtask.id]
          });
          toast.success(`Added subtask "${subtask.title}" to task`);
        } catch (error) {
          console.error('Error adding subtask:', error.response.data.message);
          toast.error('Failed to Add Subtask: ' + error.response.data.message);
          setSelectedSubtasks(selectedSubtasks.filter(id => id !== subtask.id));
        } finally {
          setLoading(prev => ({ ...prev, subtasks: false }));
        }
      }
    }
  };


  const handleRemoveSubtask = async (subtaskId) => {
    setSelectedSubtasks(selectedSubtasks.filter(id => id !== subtaskId));

    // If we're in edit mode, remove the subtask from the task immediately
    if (isEditTaskOpen && selectedTask) {
      try {
        setLoading(prev => ({ ...prev, subtasks: true }));
        await removeSubtaskFromTask(selectedTask._id, {
          subtaskIds: [subtaskId]
        });
        toast.success('Removed subtask from task');
      } catch (error) {
        console.error('Error removing subtask:', error);
        toast.error('Failed to remove subtask: ' + error.response?.data?.message);
        // Revert the UI change if the API call fails
        setSelectedSubtasks([...selectedSubtasks, subtaskId]);
      } finally {
        setLoading(prev => ({ ...prev, subtasks: false }));
      }
    }
  };

  const resetTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'HIGH',
      logo: '',
      assignee: ''
    });
    setSelectedStudents([]);
    setSelectedSubtasks([]);
    setNewSubtask('');
    setSelectedMainTask('');
    setCurrentPage(1);
    setStudentSearch('');
    setIsStudentDropdownOpen(false);
    setSelectedStudentDetails([]);


  };
  const handleOpenEditTask = (task) => {
    // Check if user has permission to edit tasks
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to edit tasks');
      return;
    }

    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'HIGH',
      logo: task.logo || '',
      assignee: task.assignee || ''
    });

    setSelectedStudents(task.students?.map(s => s?._id) || []);

    setSelectedSubtasks(task.subtasks?.map(s => s?.subtask?._id) || []);

    setSelectedMainTask(task.category || '');

    setIsEditTaskOpen(true);
  };


  const handleSaveStudentAssignment = async () => {
    if (!selectedTask || selectedStudents.length === 0) {
      toast.error('Please select students to assign');
      return;
    }

    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to assign students to tasks');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, students: true }));

      const currentStudentIds = selectedTask.students?.map(s => s?._id) || [];

      const studentsToAdd = selectedStudents.filter(id => !currentStudentIds.includes(id));
      if (studentsToAdd.length > 0) {
        await addStudentsToTask(selectedTask._id, {
          studentIds: studentsToAdd
        });
      }

      const studentsToRemove = currentStudentIds.filter(id => !selectedStudents.includes(id));
      for (const studentId of studentsToRemove) {
        await removeStudentFromTask(selectedTask?._id, { studentId });
      }

      await fetchTasks();
      setIsAssignStudentOpen(false);
      toast.success('Students assigned successfully!');
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign students');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };
  const handleAddTask = async () => {
    if (!validateTaskData(newTask)) {
      return;
    }

    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to create tasks');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, add: true }));

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        priority: newTask.priority.toUpperCase(),
        logo: newTask.logo || '',
        studentIds: selectedStudents,
        subtaskIds: selectedSubtasks
      };

      // Only include category if it has a value
      if (selectedMainTask) {
        taskData.category = selectedMainTask;
      }

      // Only include optional fields if they have values
      if (newTask.assignee) {
        // newTask.assignee already contains the ID from our SelectItem value
        taskData.assignee = newTask.assignee;
      }

      await createTask(taskData);
      await fetchTasks();
      resetTaskForm();
      setIsAddTaskOpen(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(error?.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask || !validateTaskData(newTask)) {
      return;
    }

    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to edit tasks');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, edit: true }));

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        priority: newTask.priority.toUpperCase(),
        logo: newTask.logo || ''
      };

      // Only include category if it has a value
      if (selectedMainTask) {
        taskData.category = selectedMainTask;
      }

      // Only include assignee if it has a value
      if (newTask.assignee) {
        taskData.assignee = newTask.assignee;
      }

      await updateTask(selectedTask._id, taskData);

      // Handle students separately if they changed
      const currentStudentIds = selectedTask.students?.map(s => s?._id) || [];
      const studentsToAdd = selectedStudents.filter(id => !currentStudentIds.includes(id));
      const studentsToRemove = currentStudentIds.filter(id => !selectedStudents.includes(id));

      if (studentsToAdd.length > 0) {
        await addStudentsToTask(selectedTask._id, { studentIds: studentsToAdd });
      }

      for (const studentId of studentsToRemove) {
        await removeStudentFromTask(selectedTask._id, { studentId });
      }

      // Handle subtasks separately if they changed
      const currentSubtaskIds = selectedTask.subtasks?.map(s => s?.subtask?._id) || [];
      const subtasksToAdd = selectedSubtasks.filter(id => !currentSubtaskIds.includes(id));
      const subtasksToRemove = currentSubtaskIds.filter(id => !selectedSubtasks.includes(id));

      if (subtasksToAdd.length > 0) {
        await addSubtasksToTask(selectedTask._id, { subtaskIds: subtasksToAdd });
      }

      if (subtasksToRemove.length > 0) {
        await removeSubtaskFromTask(selectedTask._id, { subtaskIds: subtasksToRemove });
      }

      await fetchTasks();
      setIsEditTaskOpen(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error?.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  // Function to fetch subtasks for a specific student and task
  const fetchStudentTaskDetails = async (taskId, studentId) => {
    if (!taskId || !studentId) return;

    try {
      setLoading(prev => ({ ...prev, subtasks: true }));
      const response = await getSubtasksByTaskAndStudent(taskId, studentId);
      if (response?.success) {
        setStudentSubtasks(response.data.subtasks || []);
      }
    } catch (error) {
      console.error('Error fetching student task details:', error);
      toast.error('Failed to fetch task details: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  // Function to open task details for a specific student
  const handleOpenTaskDetails = (task, studentId) => {
    const student = students.find(s => s?.id === studentId);
    if (!student) return;

    setSelectedTask(task);
    setSelectedStudentForTask(student);
    fetchStudentTaskDetails(task._id, studentId);
    setIsTaskDetailOpen(true);
  };

  // Function to update a subtask assignment status
  const handleUpdateSubtaskStatus = async (assignmentId, status, isLocked = false) => {
    // Check if user has permission to update subtask status
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update subtask status');
      return;
    }

    const currentSubtask = studentSubtasks.find(st => st.assignmentId === assignmentId);
    const isStatusChange = currentSubtask && currentSubtask.status !== status;
    const isLockChange = currentSubtask && currentSubtask.isLocked !== isLocked;

    try {
      setLoading(prev => ({ ...prev, subtasks: true }));
      await updateTaskSubtaskAssignment({
        assignmentId,
        status,
        isLocked
      });

      // Refresh the task details
      if (selectedTask && selectedStudentForTask) {
        await fetchStudentTaskDetails(selectedTask._id, selectedStudentForTask.id);
      }

      // Provide appropriate success message
      if (isStatusChange && isLockChange) {
        toast.success(`Subtask status updated and ${isLocked ? 'locked' : 'unlocked'}`);
      } else if (isStatusChange) {
        toast.success('Subtask status updated');
      } else if (isLockChange) {
        toast.success(`Subtask ${isLocked ? 'locked' : 'unlocked'}`);
      } else {
        toast.success('Subtask updated');
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
      toast.error('Failed to update subtask status: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, subtasks: false }));

    }
  };

  // Functions for category management
  const handleOpenCategoryManage = (category = null) => {
    // Check if user has permission to manage categories
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to manage categories');
      return;
    }

    if (category) {
      setCategoryToEdit(category);
      setNewCategoryData({ name: category.name, description: category.description || '' });
    } else {
      setCategoryToEdit(null);
      setNewCategoryData({ name: '', description: '' });
    }
    setIsCategoryManageOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Check if user has permission to manage categories
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to create or edit categories');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, categories: true }));

      if (categoryToEdit) {
        // Update existing category
        await updateCategory(categoryToEdit._id, newCategoryData);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await createCategory(newCategoryData);
        toast.success('Category created successfully');
      }

      // Refresh categories
      await fetchCategories();
      setIsCategoryManageOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error?.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) return;

    // Check if user has permission to delete categories
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to delete categories');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, categories: true }));
      await deleteCategory(categoryId);
      await fetchCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleStudentSearch = (e) => {
    setStudentSearch(e.target.value);
    fetchStudents(e.target.value, 1);
  };


  return (
    <div className="space-y-4  max-w-[100vw] md:max-w-full  overflow-x-auto ">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenCategoryManage()}
            disabled={loading.categories || !hasEditPermission()}
            title={hasEditPermission() ? 'Manage task categories' : 'You don\'t have permission to manage categories'}
          >
            {loading.categories ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m7 20.66 1-1.73"/></svg>
            )}
            Manage Categories
          </Button>
          <Button
            onClick={() => {setIsAddTaskOpen(true) ; resetTaskForm()}}
            disabled={loading.add || !hasEditPermission()}
            title={hasEditPermission() ? 'Add a new task' : 'You don\'t have permission to add tasks'}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        View and manage all tasks assigned to students
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full ">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Task</th>
              {/* <th className="px-4 py-3 text-left font-medium">Main Task</th>   */}
              <th className="px-4 py-3 text-left font-medium">Student</th>
              <th className="px-4 py-3 text-left font-medium">Assignee</th>
              <th className="px-4 py-3 text-left font-medium">Priority</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading.tasks ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No tasks found. Start by adding a new task.
                </td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task._id} className="border-b">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {task.status === 'COMPLETED' ? (
                        <Badge variant="success">Completed</Badge>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <Badge variant="warning">In Progress</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium truncate max-w-[100px]" title={task.title}>{task.title}</div>
                      {task.subtasks?.length > 0 && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {task.subtasks.length} subtasks
                        </div>
                      )}
                    </div>
                  </td>
                  {/* <td className="px-4 py-3">{task.mainTask || '-'}</td> */}
                  <td className="px-4 py-3 max-w-[250px] truncate" title={task.students?.map(student => student?.email).join(', ') || '-'}>
                    {task.students?.map(student => student?.email).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee ? teamMembers.find(m => m.id === task.assignee)?.name : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={task.priority === 'HIGH' ? 'destructive' :
                              task.priority === 'MEDIUM' ? 'warning' : 'secondary'}
                    >
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {hasEditPermission() && (
                        <>
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task);
                                const currentStudents = task.students || [];
                                // Set the simple ID array
                                setSelectedStudents(currentStudents.map(s => s._id));
                                // Set the detailed object array
                                setSelectedStudentDetails(currentStudents.map(s => ({
                                  id: s._id,
                                  name: s.name || s.email,
                                  email: s.email
                                })));
                                setIsAssignStudentOpen(true);
                              }}
                            >
                              Assign
                            </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditTask(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTask(task._id)}
                            disabled={loading.delete}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {/* {!hasEditPermission() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setIsTaskDetailOpen(true);
                          }}
                        >
                          View
                        </Button>
                      )} */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
</div>
                {paginationData && (
          <div className="flex justify-center my-6 gap-2">
            <Button
              variant="outline"
              disabled={!paginationData.hasPrevPage}
              onClick={()=> fetchTasks(paginationData.page - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {paginationData.page} of {paginationData.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!paginationData.hasNextPage}
              onClick={() => fetchTasks(paginationData.page + 1)}
            >
              Next
            </Button>
          </div>
        )}

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={(open) => {
            setIsAddTaskOpen(open);
            if (!open) {
              resetTaskForm();
            }
          }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to students.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="mainTask" className="text-sm font-medium">
                Main Task Category
              </label>
              <Select
                value={selectedMainTask}
                onValueChange={handleMainTaskChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main task category" />
                </SelectTrigger>
                <SelectContent>
                  {mainTaskCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="taskTitle" className="text-sm font-medium">
                Task Title
              </label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">
                Assign to Students
              </label>
              <div className="relative">
                <button
                  className="w-full border rounded-md p-2 text-left"
                  onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                >
                  Select students
                </button>
                {isStudentDropdownOpen && (
                  <div className="text-xs z-10 w-full bg-white border rounded-md mt-1">
                    <div className="p-2">
                      <Input
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e)=>setStudentSearch(e.target.value)}
                      />
                    </div>
                    <ul>
                      {students.map(student => (
                        <li
                          key={student.id}
                          className="p-2 ml-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            // Check if the student is already selected
                            if (!selectedStudents.includes(student.id)) {
                              // Add the ID to the simple array
                              setSelectedStudents([...selectedStudents, student.id]);
                              // Add the full student object to our new details array
                              setSelectedStudentDetails([...selectedStudentDetails, student]);
                            }
                          }}
                        >
                          {student.name} ({student.email})
                        </li>   
                      ))}
                    </ul>
                    <div className="flex justify-center p-2">
                      <Button
                        variant="outline"
                        disabled={!studentPagination.hasPrev}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2">
                        {studentPagination.currentPage} of {studentPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!studentPagination.hasNext}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {selectedStudentDetails.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <p className="text-sm font-medium mb-2">Selected Students:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudentDetails.map((student) => {
                      if (!student) return null;
                      return (
                        <Badge
                          key={student.id}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {student.name}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-blue-100 hover:text-blue-700 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTaskDetails(selectedTask, student.id);
                              }}
                              title="View subtasks"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove from both state arrays
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              setSelectedStudentDetails(selectedStudentDetails.filter(s => s.id !== student.id));
                            }}
                            title="Remove student"
                          >
                            <X className="h-2 w-2" />
                          </Button>
                          </div>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Subtasks</label>
              <Select
                value={newSubtask}
                onValueChange={handleSubtaskSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subtask" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubtasks.map(subtask => (
                    <SelectItem key={subtask.id} value={subtask.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{subtask.title}</span>
                          <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                        </div>
                        <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSubtasks.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <p className="text-sm font-medium mb-2">Selected Subtasks:</p>
                  <ul className="space-y-1">
                    {selectedSubtasks.map((subtaskId) => {
                      const subtask = availableSubtasks.find(s => s?.id === subtaskId);
                      if (!subtask) return null;
                      return (
                        <li key={subtask.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-sm px-2 py-1">
                          <div>
                            <span>{subtask.title}</span>
                            <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {selectedMainTask !== 'create_new' && subtaskTemplates[selectedMainTask]?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Suggested subtasks:</p>
                  <div className="flex flex-wrap gap-1">
                    {subtaskTemplates[selectedMainTask].map((template, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          const matchedSubtask = availableSubtasks.find(s => s?.title === template);
                          if (matchedSubtask && !selectedSubtasks.includes(matchedSubtask.id)) {
                            setSelectedSubtasks([...selectedSubtasks, matchedSubtask.id]);
                          }
                        }}
                      >
                        {template}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue  placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="assignee" className="text-sm font-medium">
                  Assignee
                </label>
                <Select
                  value={newTask.assignee}
                  onValueChange={(val) => setNewTask({ ...newTask, assignee: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{member.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({member.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={loading.add}>
              {loading.add ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              {selectedTask?.title ? `Edit "${selectedTask.title}"` : 'Edit task'}
              <p className="mt-2 text-xs text-muted-foreground">Note: Status and Due Date are managed automatically based on subtask progress.</p>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="mainTask" className="text-sm font-medium">
                Main Task Category
              </label>
              <Select
                value={selectedMainTask}
                onValueChange={handleMainTaskChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main task category" />
                </SelectTrigger>
                <SelectContent>
                  {mainTaskCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="taskTitle" className="text-sm font-medium">
                Task Title
              </label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            {/* Student assignment removed from edit dialog as it's handled by the Assign button */}

            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Subtasks</label>
              <Select
                value={newSubtask}
                onValueChange={handleSubtaskSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subtask" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubtasks.map(subtask => (
                    <SelectItem key={subtask.id} value={subtask.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{subtask.title}</span>
                          <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                        </div>
                        <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSubtasks.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <p className="text-sm font-medium mb-2">Selected Subtasks:</p>
                  <ul className="space-y-1">
                    {selectedSubtasks.map((subtaskId) => {
                      const subtask = availableSubtasks.find(s => s?.id === subtaskId);
                      if (!subtask) return null;
                      return (
                        <li key={subtask.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-sm px-2 py-1">
                          <div>
                            <span>{subtask.title}</span>
                            <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="assignee" className="text-sm font-medium">
                  Assignee
                </label>
                <Select
                  value={newTask.assignee}
                  onValueChange={(val) => setNewTask({ ...newTask, assignee: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{member.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({member.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={loading.edit}>
              {loading.edit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={isAssignStudentOpen} onOpenChange={setIsAssignStudentOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Students to Task</DialogTitle>
            <DialogDescription>
              {selectedTask?.title ? `Select students to assign to "${selectedTask.title}"` : 'Select students to assign to this task'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="relative text-xs">
                <button
                  className="w-full border rounded-md p-2 text-left"
                  onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                >
                  Select students
                </button>
                {isStudentDropdownOpen && (
                  <div className=" z-10 w-full bg-white border rounded-md mt-1">
                    <div className="p-2">
                      <Input
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e)=>setStudentSearch(e.target.value)}
                      />
                    </div>
                    <ul>
                      {students.map(student => (
                       <li
                          key={student.id}
                          className="p-2 ml-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            // Check if the student is already selected
                            if (!selectedStudents.includes(student.id)) {
                              // Add the ID to the simple array
                              setSelectedStudents([...selectedStudents, student.id]);
                              // Add the full student object to our new details array
                              setSelectedStudentDetails([...selectedStudentDetails, student]);
                            }
                          }}
                        >
                          {student.name} ({student.email})
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-center p-2">
                      <Button
                        variant="outline"
                        disabled={!studentPagination.hasPrev}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2">
                        {studentPagination.currentPage} of {studentPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!studentPagination.hasNext}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            {selectedStudentDetails.length > 0 && (
              <div className="border rounded-md p-2">
                <p className="text-sm font-medium mb-2">Selected Students:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudentDetails.map((student) => {
                    if (!student) return null;
                    return (
                      <Badge
                        key={student.id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 flex items-center gap-1"
                      >
                        {student?.email}
                         <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove from both state arrays
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            setSelectedStudentDetails(selectedStudentDetails.filter(s => s.id !== student.id));
                          }}
                          title="Remove student"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStudentAssignment} disabled={loading.students}>
              {loading.students ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              {selectedTask?.title && selectedStudentForTask?.name 
                ? `Subtasks for "${selectedTask.title}" assigned to ${selectedStudentForTask.name}` 
                : 'Task details'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {loading.subtasks ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : studentSubtasks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No subtasks found for this task and student.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground mb-2 bg-blue-50 p-2 rounded-md">
                  <span className="font-medium">Note:</span> Locking a subtask prevents students from updating its status. Use this for completed subtasks that should not be modified.
                </div>
                {studentSubtasks.map((subtask) => (
                  <div key={subtask._id} className="border rounded-md p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="font-medium flex items-center">
                        {subtask.title}
                        {subtask.isLocked && (
                          <span className="ml-2 text-blue-700" title="This subtask is locked">🔒</span>
                        )}
                      </div>
                      <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                    </div>
                    
                    {subtask.description && (
                      <div className="text-sm text-muted-foreground mt-1">{subtask.description}</div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm">
                        Status: 
                        <Badge variant={
                          subtask.status === 'COMPLETED' ? 'success' : 
                          subtask.status === 'IN_PROGRESS' ? 'warning' : 
                          'secondary'
                        } className="ml-2">
                          {subtask.status.replace('_', ' ')}
                        </Badge>
                        {subtask.isLocked && (
                          <Badge variant="outline" className="ml-1">🔒 Locked</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={subtask.status}
                          onValueChange={(value) => handleUpdateSubtaskStatus(subtask.assignmentId, value, subtask.isLocked)}
                          disabled={subtask.isLocked}
                        >
                          <SelectTrigger className={`w-[140px] ${subtask.isLocked ? 'opacity-70' : ''}`}>
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant={subtask.isLocked ? 'secondary' : 'outline'}
                          size="sm"
                          className={`gap-1 ${subtask.isLocked ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}`}
                          onClick={() => handleUpdateSubtaskStatus(subtask.assignmentId, subtask.status, !subtask.isLocked)}
                          title={subtask.isLocked ? 'Unlock subtask' : 'Lock subtask'}
                        >
                          {subtask.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={isCategoryManageOpen} onOpenChange={setIsCategoryManageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {categoryToEdit
                ? `Edit details for "${categoryToEdit.name}" category`
                : 'Create a new task category'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="categoryName" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="categoryDescription" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="categoryDescription"
                placeholder="Enter category description"
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
              />
            </div>

            {mainTaskCategories.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Current Categories:</p>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
                  <ul className="space-y-2">
                    {mainTaskCategories.map((category) => (
                      <li key={category._id} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                        <span>{category.name}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenCategoryManage(category)}
                            className="h-7 w-7 p-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`)) {
                                handleDeleteCategory(category._id);
                              }
                            }}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryManageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={loading.categories || !newCategoryData.name.trim()}
            >
              {loading.categories ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;