import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateCreateTask, ValidateUpdateTask, validateJoiSchema } from '../../service/validationService.js';
import Task from '../../model/taskModel.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import Student from '../../model/studentModel.js';
import Subtask from '../../model/subtaskModel.js';
import Member from '../../model/membersModel.js';
import TaskCategory from '../../model/taskCategoryModel.js';

export default {
    // Create a new task with associated students and subtasks (ADMIN only)
    createTask: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateCreateTask, req.body);
            if (error) return httpError(next, error, req, 422);

            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentIds, subtaskIds, assignee, category, ...taskData } = value;
            taskData.assignee = assignee ? assignee : req.authenticatedMember._id;

            const assigneeExists = await Member.findById(taskData.assignee).lean();
            if (!assigneeExists) return httpError(next, new Error('Assignee not found'), req, 404);

            if (category) {
                const categoryExists = await TaskCategory.findById(category).lean();
                if (!categoryExists) return httpError(next, new Error('Category not found'), req, 404);
            }

            if (studentIds?.length > 0) {
                const students = await Student.find({ _id: { $in: studentIds } }).lean();
                if (students.length !== studentIds.length) return httpError(next, new Error('One or more studentIds are invalid'), req, 400);
            }

            if (subtaskIds?.length > 0) {
                const subtasks = await Subtask.find({ _id: { $in: subtaskIds } }).lean();
                if (subtasks.length !== subtaskIds.length) return httpError(next, new Error('One or more subtaskIds are invalid'), req, 400);
            }

            const task = new Task({ ...taskData, category });
            await task.save();

            if (studentIds?.length > 0) {
                await Promise.all(studentIds.map(studentId => new StudentTaskAssignment({
                    studentId,
                    taskId: task._id,
                    assignedAt: new Date(),
                    status: "PENDING",
                    isLocked: false,
                    dueDate: null
                }).save()));
            }

            if (subtaskIds?.length > 0 && studentIds?.length > 0) {
                await Promise.all(studentIds.flatMap(studentId => subtaskIds.map(subtaskId => new TaskSubtaskAssignment({
                    studentId,
                    taskId: task._id,
                    subtaskId,
                    assignedAt: new Date(),
                    status: "PENDING",
                    isLocked: false,
                    dueDate: null
                }).save())));
            }

            const populatedTask = await Task.findById(task._id).populate('category', 'name description').lean();
            const studentAssignments = await StudentTaskAssignment.find({ taskId: task._id }).populate('studentId', '-password').lean();
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId', '-password')
                .populate('subtaskId')
                .lean();

            populatedTask.students = studentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = taskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 201, responseMessage.SUCCESS, { message: 'Task created successfully', task: populatedTask });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update task details (ADMIN only)
    updateTaskDetails: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateUpdateTask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Validate assignee if provided
            if (value.assignee) {
                const assigneeExists = await Member.findById(value.assignee);
                if (!assigneeExists) {
                    return httpError(next, new Error('Assignee not found'), req, 404);
                }
            }


            if (value.category) {
                const categoryExists = await TaskCategory.findById(value.category);
                if (!categoryExists) return httpError(next, new Error('Category not found'), req, 404);
            }

            // Update task fields
            if (value.title) task.title = value.title;
            if (value.description !== undefined) task.description = value.description;
            if (value.logo !== undefined) task.logo = value.logo;
            if (value.priority) task.priority = value.priority;
            if (value.assignee) task.assignee = value.assignee;
            if (value.isDefault !== undefined) task.isDefault = value.isDefault;
            if (value.createdDate) task.createdDate = value.createdDate;
            if (value.category) task.category = value.category
            await task.save();

            // Fetch updated task with associations
            const populatedTask = await Task.findById(task._id).lean();
            const studentAssignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId', "-password")
                .lean();
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId', "-password")
                .populate('subtaskId')
                .lean();

            populatedTask.students = studentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = taskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Task updated successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Delete a task and its associated assignments (ADMIN only)
    deleteTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Delete associated StudentTaskAssignment and TaskSubtaskAssignment records
            await StudentTaskAssignment.deleteMany({ taskId: task._id });
            await TaskSubtaskAssignment.deleteMany({ taskId: task._id });

            // Delete task
            await Task.findByIdAndDelete(task._id);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Task deleted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all tasks with associated students and subtasks (accessible to all members)
    getAllTasks: async (req, res, next) => {
        try {
            // Extract pagination parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Fetch total count for pagination
            const totalTasks = await Task.countDocuments();

            // Fetch paginated tasks
            const tasks = await Task.find()
                .skip(skip)
                .limit(limit)
                .lean();

            const taskIds = tasks.map(task => task._id);

            // Fetch associated assignments
            const studentAssignments = await StudentTaskAssignment.find({ taskId: { $in: taskIds } })
                .populate('studentId', '-password')
                .lean();
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: { $in: taskIds } })
                .populate('subtaskId')
                .lean();

            // Map assignments to tasks
            const tasksWithAssignments = tasks.map(task => {
                const taskStudentAssignments = studentAssignments.filter(assignment => assignment.taskId.toString() === task._id.toString());
                const taskSubtaskAssignmentsForTask = taskSubtaskAssignments.filter(assignment => assignment.taskId.toString() === task._id.toString());

                task.students = taskStudentAssignments.map(assignment => assignment.studentId);
                // Get unique subtasks by subtaskId
                const uniqueSubtasks = [...new Map(taskSubtaskAssignmentsForTask.map(assignment => [assignment.subtaskId._id.toString(), {
                    subtask: assignment.subtaskId,
                    status: assignment.status,
                    isLocked: assignment.isLocked,
                    dueDate: assignment.dueDate
                }])).values()];
                task.subtasks = uniqueSubtasks;
                task.totalStudent = task.students.length;
                task.totalSubtask = task.subtasks.length;
                return task;
            });

            // Pagination metadata
            const pagination = {
                total: totalTasks,
                page,
                limit,
                totalPages: Math.ceil(totalTasks / limit),
                hasNextPage: page < Math.ceil(totalTasks / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                tasks: tasksWithAssignments,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    // Get a specific task by ID with associated students and subtasks (accessible to all members)
    getTaskById: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const task = await Task.findById(taskId).lean();
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Fetch associated assignments
            const studentAssignments = await StudentTaskAssignment.find({ taskId })
                .populate('studentId', "-password")
                .lean();
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId })
                .populate('studentId', "-password")
                .populate('subtaskId')
                .lean();

            task.students = studentAssignments.map(assignment => assignment.studentId);
            task.subtasks = taskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, task);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


};