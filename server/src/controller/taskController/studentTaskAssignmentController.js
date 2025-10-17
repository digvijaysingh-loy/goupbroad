import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateAddStudentsToTask, ValidateUpdateStudentTaskAssignment, ValidateRemoveStudentFromTask, validateJoiSchema } from '../../service/validationService.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';
import Task from '../../model/taskModel.js';
import Student from '../../model/studentModel.js';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';

export default {
    // Add students to a task (ADMIN only)
    addStudentsToTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateAddStudentsToTask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentIds } = value;

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Validate studentIds exist
            const students = await Student.find({ _id: { $in: studentIds } }).lean();
            if (students.length !== studentIds.length) {
                return httpError(next, new Error('One or more studentIds are invalid'), req, 400);
            }

            // Check for existing assignments to avoid duplicates
            const existingAssignments = await StudentTaskAssignment.find({
                taskId,
                studentId: { $in: studentIds }
            }).lean();

            const existingStudentIds = new Set(existingAssignments.map(assignment => assignment.studentId.toString()));
            const newStudentIds = studentIds.filter(studentId => !existingStudentIds.has(studentId));

            if (newStudentIds.length === 0) {
                return httpError(next, new Error('One Or More students are already assigned to this task'), req, 400);
            }

            // Create new StudentTaskAssignment records
            const studentAssignmentPromises = newStudentIds.map(async (studentId) => {
                const assignment = new StudentTaskAssignment({
                    studentId,
                    taskId,
                    assignedAt: new Date(),
                    status: "PENDING",
                    isLocked: false,
                    dueDate: null
                });
                return assignment.save();
            });

            await Promise.all(studentAssignmentPromises);

            // Fetch existing subtasks for this task
            const taskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId }).lean();
            const existingSubtaskIds = [...new Set(taskSubtaskAssignments.map(assignment => assignment.subtaskId.toString()))];

            // Create TaskSubtaskAssignment records for new students and existing subtasks
            if (existingSubtaskIds.length > 0) {
                const taskSubtaskAssignmentPromises = [];
                newStudentIds.forEach(studentId => {
                    existingSubtaskIds.forEach(subtaskId => {
                        const assignment = new TaskSubtaskAssignment({
                            studentId,
                            taskId,
                            subtaskId,
                            assignedAt: new Date(),
                            status: "PENDING",
                            isLocked: false,
                            dueDate: null
                        });
                        taskSubtaskAssignmentPromises.push(assignment.save());
                    });
                });
                await Promise.all(taskSubtaskAssignmentPromises);
            }

            // Fetch updated task with associations
            const populatedTask = await Task.findById(task._id).lean();
            const updatedStudentAssignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId')
                .lean();
            const updatedTaskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId')
                .populate('subtaskId')
                .lean();

            populatedTask.students = updatedStudentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = updatedTaskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Students added to task successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Remove a student from a task (ADMIN only)
    removeStudentFromTask: async (req, res, next) => {
        try {
            const { taskId } = req.params;
            const { value, error } = validateJoiSchema(ValidateRemoveStudentFromTask, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { studentId } = value;

            // Find task
            const task = await Task.findById(taskId);
            if (!task) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Task')), req, 404);
            }

            // Validate studentId exists
            const student = await Student.findById(studentId).lean();
            if (!student) {
                return httpError(next, new Error('Student not found'), req, 404);
            }

            // Find the StudentTaskAssignment
            const assignment = await StudentTaskAssignment.findOne({ taskId, studentId });
            if (!assignment) {
                return httpError(next, new Error('Student is not assigned to this task'), req, 400);
            }

            // Check if the assignment is locked
            if (assignment.isLocked) {
                return httpError(next, new Error('Cannot remove student: assignment is locked'), req, 403);
            }

            // Delete the StudentTaskAssignment
            await StudentTaskAssignment.deleteOne({ taskId, studentId });

            // Delete associated TaskSubtaskAssignment records
            await TaskSubtaskAssignment.deleteMany({ taskId, studentId });

            // Fetch updated task with associations
            const populatedTask = await Task.findById(task._id).lean();
            const updatedStudentAssignments = await StudentTaskAssignment.find({ taskId: task._id })
                .populate('studentId')
                .lean();
            const updatedTaskSubtaskAssignments = await TaskSubtaskAssignment.find({ taskId: task._id })
                .populate('studentId')
                .populate('subtaskId')
                .lean();

            populatedTask.students = updatedStudentAssignments.map(assignment => assignment.studentId);
            populatedTask.subtasks = updatedTaskSubtaskAssignments.map(assignment => ({
                subtask: assignment.subtaskId,
                student: assignment.studentId,
                status: assignment.status,
                isLocked: assignment.isLocked,
                dueDate: assignment.dueDate
            }));

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Student removed from task successfully',
                task: populatedTask
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update StudentTaskAssignment details (ADMIN only)
    updateStudentTaskAssignment: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateUpdateStudentTaskAssignment, req.body);
            if (error) return httpError(next, error, req, 422);

            // Check role
            if (req.authenticatedMember.role !== 'ADMIN') {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            const { assignmentId, status, isLocked, dueDate } = value;

            // Find the assignment
            const assignment = await StudentTaskAssignment.findById(assignmentId)
                .populate('studentId')
                .populate('taskId');
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('StudentTaskAssignment')), req, 404);
            }

            // Update fields if provided
            if (status) assignment.status = status;
            if (isLocked !== undefined) assignment.isLocked = isLocked;
            if (dueDate !== undefined) assignment.dueDate = dueDate;

            await assignment.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'StudentTaskAssignment updated successfully',
                assignment
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    getTaskByStudentId: async (req, res, next) => {
        try {
            const { studentId } = req.params

            const isStudentExist = await Student.findById(studentId)
            if (!isStudentExist) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Student Not Found")), req, 400)
            }

            const task = await StudentTaskAssignment.find({
                studentId
            }).populate("taskId").sort({ createdAt: -1 })


            httpResponse(req, res, 200, responseMessage.CUSTOM_MESSAGE("Student Assigned Task"), {
                task
            })


        } catch (error) {
            httpError(next, err, req, 500);
        }
    },

    getStudentUpcomingTasks: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id.toString();
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;
            const currentDate = new Date(); // Dynamic current date and time (e.g., 2025-07-10T16:44:00+05:30)

            const taskAssignments = await StudentTaskAssignment.find({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $ne: null } },
                    { dueDate: null }
                ]
            })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',
                    populate: {
                        path: 'category',
                        select: 'name description'
                    }
                })
                .populate({
                    path: 'assignee',
                    select: 'name email role'
                })
                .sort({ dueDate: 1, assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await StudentTaskAssignment.countDocuments({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $ne: null } },
                    { dueDate: null }
                ]
            });

            const upcomingTasks = taskAssignments.map(ta => ({
                ...ta.taskId,
                assignedAt: ta.assignedAt,
                dueDate: ta.dueDate,
                status: ta.status,
                isLocked: ta.isLocked,
                isOverdue: ta.dueDate && ta.dueDate < currentDate,
                createdAt: ta.createdAt,
                updatedAt: ta.updatedAt
            }));

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                upcomingTasks: upcomingTasks
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    getStudentUpcomingTasks: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id.toString();
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;
            const currentDate = new Date();

            const taskAssignments = await StudentTaskAssignment.find({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $ne: null } },
                    { dueDate: null }
                ]
            })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',
                    populate: {
                        path: 'category',
                        select: 'name description'
                    }
                })
                .sort({ dueDate: 1, assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await StudentTaskAssignment.countDocuments({
                studentId,
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $ne: null } },
                    { dueDate: null }
                ]
            });

            const upcomingTasks = taskAssignments.map(ta => ({
                ...ta.taskId,
                assignedAt: ta.assignedAt,
                dueDate: ta.dueDate,
                status: ta.status,
                isLocked: ta.isLocked,
                isOverdue: ta.dueDate && ta.dueDate < currentDate,
                createdAt: ta.createdAt,
                updatedAt: ta.updatedAt
            }));

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                upcomingTasks: upcomingTasks
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Admin side
    getUpcomingDeadlines: async (req, res, next) => {
        try {


            const { page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;
            const currentDate = new Date();

            const taskAssignments = await TaskSubtaskAssignment.find({
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $lt: currentDate } },
                    { dueDate: { $gte: currentDate } },
                    { dueDate: null }
                ]
            })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',
                    populate: {
                        path: 'category',
                        select: 'name description'
                    }
                })
                .populate({
                    path: 'studentId',
                    select: 'name email profilePicture phoneNumber status'
                })
                .sort({ dueDate: 1, assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await TaskSubtaskAssignment.countDocuments({
                status: { $in: ['PENDING', 'IN_PROGRESS'] },
                $or: [
                    { dueDate: { $lt: currentDate } },
                    { dueDate: { $gte: currentDate } },
                    { dueDate: null }
                ]
            });

            const upcomingDeadlines = taskAssignments.map(ta => ({
                ...ta.taskId,
                student: ta.studentId,
                assignedAt: ta.assignedAt,
                dueDate: ta.dueDate,
                status: ta.status,
                isLocked: ta.isLocked,
                isOverdue: ta.dueDate && ta.dueDate < currentDate,
                isUpcoming: ta.dueDate && ta.dueDate >= currentDate,
                createdAt: ta.createdAt,
                updatedAt: ta.updatedAt
            }));

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                upcomingDeadlines: upcomingDeadlines
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    }

};