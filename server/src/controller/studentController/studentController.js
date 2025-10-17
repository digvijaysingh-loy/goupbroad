import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import { ValidateFilterAssignedUniversities, ValidateGetQuestionnaireQuestions, ValidateGetStudentTasks, ValidateGetSubtaskQuestionnaires, ValidateProfileUpdate, ValidateSubmitQuestionnaireResponse, ValidateUpdateAssignedUniversityStatus, validateJoiSchema } from '../../service/validationService.js';
import Student from '../../model/studentModel.js';
import StudentUniversityAssignment from '../../model/studentUniversityAssignmentModel.js';
import mongoose from 'mongoose';
import TaskSubtaskAssignment from '../../model/taskSubtaskAssignmentModel.js';
import SubtaskQuestionnaireAssignment from '../../model/subtaskQuestionnaireAssignmentModel.js';
import Questionnaire from '../../model/questionnaireModel.js';
import Response from '../../model/responseModel.js';
import StudentActivity from '../../model/studentActivitySchema.js';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../constant/application.js';
import StudentTaskAssignment from '../../model/studentTaskAssignmentModel.js';

export default {
    getSelfData: async (req, res, next) => {
        try {
            const student = await Student.findById(req.authenticatedStudent._id).select('-password');
            if (!student) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, student);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id;
            const updateData = req.body;

            // Validate update data
            const validationResult = validateJoiSchema(ValidateProfileUpdate, updateData);
            if (validationResult.error) {
                return httpError(next, validationResult.error, req, 422);
            }

            // Prevent changes to isFeePaid, isVerified, and role
            const restrictedFields = ['isFeePaid', 'isVerified', 'role', "password"];
            restrictedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE(`Cannot update ${field}`)), req, 403);
                }
            });

            // Update only the provided fields
            const updatedStudent = await Student.findByIdAndUpdate(
                studentId,
                { $set: updateData },
                { new: true, runValidators: true, select: '-password' }
            );

            if (!updatedStudent) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student')), req, 404);
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, updatedStudent);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get all universities assigned to the authenticated student with pagination and filtering
    getAssignedUniversities: async (req, res, next) => {
        try {
            // Validate filter query
            const { value, error } = validateJoiSchema(ValidateFilterAssignedUniversities, { ...req.query });
            if (error) return httpError(next, error, req, 422);

            const { universityId, admissionStatus, universityStatus, page, limit, sortOrder } = value;
            const skip = (page - 1) * limit;

            const query = { studentId: req.authenticatedStudent._id };
            if (universityId) query.universityId = universityId;
            if (admissionStatus) query.admissionStatus = admissionStatus;
            if (universityStatus) query.universityStatus = universityStatus;

            const totalAssignments = await StudentUniversityAssignment.countDocuments(query);

            const assignments = await StudentUniversityAssignment.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ assignedAt: sortOrder === 'asc' ? 1 : -1 })
                .populate('studentId', 'name email')
                .populate('universityId')
                .populate('assignedBy', 'name email')
                .lean();

            // Pagination metadata
            const pagination = {
                total: totalAssignments,
                page,
                limit,
                totalPages: Math.ceil(totalAssignments / limit),
                hasNextPage: page < Math.ceil(totalAssignments / limit),
                hasPrevPage: page > 1
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                assignments,
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Update admissionStatus and universityStatus of an assigned university (student only)
    updateAssignedUniversityStatus: async (req, res, next) => {
        try {
            const { assignmentId } = req.params
            const { value, error } = validateJoiSchema(ValidateUpdateAssignedUniversityStatus, req.body);
            if (error) return httpError(next, error, req, 422);
            if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
                return httpError(next, new Error(responseMessage.CUSTOM_MESSAGE("Assignent ID Required")), req, 404)
            }
            const { admissionStatus, universityStatus } = value;

            const assignment = await StudentUniversityAssignment.findById(assignmentId);
            if (!assignment) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('Student-university assignment')), req, 404);
            }


            if (assignment.studentId.toString() !== req.authenticatedStudent._id.toString()) {
                return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403);
            }

            if (admissionStatus !== undefined) assignment.admissionStatus = admissionStatus;
            if (universityStatus !== undefined) assignment.universityStatus = universityStatus;

            await assignment.save();

            const populatedAssignment = await StudentUniversityAssignment.findById(assignment._id)
                .populate('studentId', 'name email')
                .populate('universityId')
                .populate('assignedBy', 'name email')
                .lean();


            const activity = new StudentActivity({
                studentId: assignment.studentId,
                activityType: ACTIVITY_TYPES.UNIVERSITY_STATUS_UPDATED,
                message: `Student updated university status for assignment ${populatedAssignment?.universityId?.name}`,
                status: ACTIVITY_STATUSES.UPDATED,
                details: { assignmentId, admissionStatus, universityStatus }
            });
            await activity.save();

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                message: 'Assigned university status updated successfully',
                assignment: populatedAssignment
            });
        } catch (err) {
            console.log(err);

            httpError(next, err, req, 500);
        }
    },


    // Task Controller 

    getStudentTasks: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetStudentTasks, { ...req.query });
            if (error) return httpError(next, error, req, 422);

            const { page, limit, sortOrder } = value;
            const skip = (page - 1) * limit;

            const tasks = await TaskSubtaskAssignment.aggregate([
                {
                    $match: {
                        studentId: req.authenticatedStudent._id,
                    }
                },
                {
                    $lookup: {
                        from: 'tasks',
                        localField: 'taskId',
                        foreignField: '_id',
                        as: 'taskDetails'
                    }
                },
                {
                    $unwind: '$taskDetails'
                },
                {
                    $lookup: {
                        from: 'subtasks',
                        localField: 'subtaskId',
                        foreignField: '_id',
                        as: 'subtaskDetails'
                    }
                },
                {
                    $unwind: '$subtaskDetails'
                },
                {
                    $project: {
                        _id: 0,
                        taskId: '$taskDetails._id',
                        taskTitle: '$taskDetails.title',
                        taskDescription: '$taskDetails.description',
                        taskPriority: '$taskDetails.priority',
                        taskAssignedAt: '$taskDetails.createdDate',
                        subtaskId: '$subtaskDetails._id',
                        subtaskTitle: '$subtaskDetails.title',
                        subtaskDescription: '$subtaskDetails.description',
                        subtaskPriority: '$subtaskDetails.priority',
                        subtaskLogo: '$subtaskDetails.logo',
                        assignedAt: 1,
                        status: 1,
                        isLocked: 1,
                        dueDate: 1
                    }
                },
                {
                    $sort: { assignedAt: sortOrder === 'asc' ? 1 : -1 }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);

            const totalTasks = await TaskSubtaskAssignment.countDocuments({
                studentId: req.authenticatedStudent._id,
            });

            const pagination = {
                total: totalTasks,
                page,
                limit,
                totalPages: Math.ceil(totalTasks / limit),
                hasNextPage: page < Math.ceil(totalTasks / limit),
                hasPrevPage: page > 1
            };


            const structuredTasks = tasks.reduce((acc, item) => {
                const taskId = item.taskId.toString();
                if (!acc[taskId]) {
                    acc[taskId] = {
                        _id: item.taskId,
                        title: item.taskTitle,
                        description: item.taskDescription,
                        priority: item.taskPriority,
                        assignedAt: item.taskAssignedAt,
                        subtasks: []
                    };
                }
                acc[taskId].subtasks.push({
                    _id: item.subtaskId,
                    title: item.subtaskTitle,
                    description: item.subtaskDescription,
                    priority: item.subtaskPriority,
                    logo: item.subtaskLogo,
                    assignedAt: item.assignedAt,
                    status: item.status,
                    isLocked: item.isLocked,
                    dueDate: item.dueDate
                });
                return acc;
            }, {});

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                tasks: Object.values(structuredTasks),
                pagination
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Get questionnaires for a specific task and subtask
    getSubtaskQuestionnaires: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetSubtaskQuestionnaires, { ...req.params });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId } = value;


            const assignment = await TaskSubtaskAssignment.findOne({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,

            }).lean();

            if (!assignment) {
                return httpError(next, new Error('Task or subtask not assigned to the student or not accessible'), req, 404);
            }

            const questionnaires = await SubtaskQuestionnaireAssignment.aggregate([
                {
                    $match: { subtaskId: assignment.subtaskId }
                },
                {
                    $lookup: {
                        from: 'questionnaires',
                        localField: 'questionnaireId',
                        foreignField: '_id',
                        as: 'questionnaireDetails'
                    }
                },
                {
                    $unwind: '$questionnaireDetails'
                },
                {
                    $project: {
                        _id: 1,
                        questionnaireId: '$questionnaireDetails._id',
                        title: '$questionnaireDetails.title',
                        description: '$questionnaireDetails.description',
                        status: '$questionnaireDetails.status',
                        // questions: '$questionnaireDetails.questions',
                        assignedAt: 1
                    }
                }
            ]);

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                questionnaires
            });
        } catch (err) {
            console.log(err);

            httpError(next, err, req, 500);
        }
    },


    // Get questions of a questionnaire with existing responses
    getQuestionnaireQuestionsWithResponses: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateGetQuestionnaireQuestions, { ...req.params });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId, questionnaireId } = value;

            // Verify assignment
            const assignment = await TaskSubtaskAssignment.findOne({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
                // status: { $in: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] }
            }).lean();

            if (!assignment) {
                return httpError(next, new Error('Task or subtask not assigned to the student or not accessible'), req, 404);
            }



            // Verify questionnaire assignment
            const questionnaireAssignment = await SubtaskQuestionnaireAssignment.findOne({
                subtaskId: assignment.subtaskId,
                questionnaireId
            }).lean();

            if (!questionnaireAssignment) {
                return httpError(next, new Error('Questionnaire not assigned to the subtask'), req, 404);
            }

            // Fetch questionnaire with questions
            const questionnaire = await Questionnaire.findById(questionnaireId).lean();
            if (!questionnaire) {
                return httpError(next, new Error('Questionnaire not found'), req, 404);
            }

            // Fetch existing responses
            const responses = await Response.find({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
                questionnaireId
            }).lean();

            // Merge questions with responses
            const questionsWithResponses = questionnaire.questions.map(question => {
                const response = responses.find(r => r.questionId.toString() === question._id.toString());
                return {
                    _id: question._id,
                    question: question.question,
                    ansType: question.ansType,
                    options: question.options || [],
                    answer: response ? response.answer : null,
                    status: response ? response.status : 'PENDING',
                    feedback: response ? response.feedback : null
                };
            });

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                questionnaire: {
                    _id: questionnaire._id,
                    title: questionnaire.title,
                    description: questionnaire.description,
                    status: questionnaire.status,
                    questions: questionsWithResponses
                }
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    // Submit or update responses for a questionnaire
    submitQuestionnaireResponses: async (req, res, next) => {
        try {
            const { value, error } = validateJoiSchema(ValidateSubmitQuestionnaireResponse, { ...req.params, ...req.body });
            if (error) return httpError(next, error, req, 422);

            const { taskId, subtaskId, questionnaireId, responses } = value;

            const assignment = await TaskSubtaskAssignment.findOne({
                studentId: req.authenticatedStudent._id,
                taskId,
                subtaskId,
                status: { $in: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] }
            }).lean();

            if (!assignment) {
                return httpError(next, new Error('Task or subtask not assigned to the student or not accessible'), req, 404);
            }

            const questionnaireAssignment = await SubtaskQuestionnaireAssignment.findOne({
                subtaskId: assignment.subtaskId,
                questionnaireId
            }).lean();

            if (!questionnaireAssignment) {
                return httpError(next, new Error('Questionnaire not assigned to the subtask'), req, 404);
            }

            const questionnaire = await Questionnaire.findById(questionnaireId).lean();
            if (!questionnaire) {
                return httpError(next, new Error('Questionnaire not found'), req, 404);
            }

            const questionIds = questionnaire.questions.map(q => q._id.toString());
            const responseMap = new Map(responses.map(r => [r.questionId, r.answer]));

            const operations = responses.map(async response => {
                if (!questionIds.includes(response.questionId)) {
                    throw new Error(`Invalid question ID: ${response.questionId}`);
                }

                const question = questionnaire.questions.find(q => q._id.toString() === response.questionId);
                const ansType = question.ansType;

                let validatedAnswer = response.answer;
                switch (ansType) {
                    case 'TEXT':
                    case 'PARAGRAPH':
                        if (typeof validatedAnswer !== 'string') throw new Error(`Answer for ${question.question} must be a string`);
                        break;
                    case 'MULTIPLE_CHOICE':
                    case 'CHECKBOX':
                        if (!Array.isArray(validatedAnswer) || !validatedAnswer.every(a => typeof a === 'string')) {
                            throw new Error(`Answer for ${question.question} must be an array of strings`);
                        }
                        if (ansType === 'MULTIPLE_CHOICE' && validatedAnswer.length > 1) {
                            throw new Error(`Only one option allowed for ${question.question}`);
                        }
                        break;
                    case 'FILE':
                        if (typeof validatedAnswer !== 'string' || !validatedAnswer.match(/^https?:\/\//)) {
                            throw new Error(`Answer for ${question.question} must be a valid URL`);
                        }
                        break;
                    case 'DATE':
                        // if (!(validatedAnswer instanceof Date) || isNaN(validatedAnswer)) {
                        //     throw new Error(`Answer for ${question.question} must be a valid date`);
                        // }
                        break;
                }

                const existingResponse = await Response.findOne({
                    studentId: req.authenticatedStudent._id,
                    taskId,
                    subtaskId,
                    questionnaireId,
                    questionId: response.questionId
                });

                if (existingResponse) {
                    existingResponse.answer = validatedAnswer;
                    existingResponse.status = 'SUBMITTED';
                    existingResponse.submittedAt = new Date();
                    existingResponse.version += 1;
                    return existingResponse.save();
                } else {
                    return new Response({
                        studentId: req.authenticatedStudent._id,
                        taskId,
                        subtaskId,
                        questionnaireId,
                        questionId: response.questionId,
                        answer: validatedAnswer,
                        status: 'SUBMITTED',
                        submittedAt: new Date()
                    }).save();
                }

            });

            await Promise.all(operations);

            const activity = new StudentActivity({
                studentId: req.authenticatedStudent._id,
                activityType: ACTIVITY_TYPES.QUESTIONNAIRE_SUBMITTED,
                message: `Student submitted responses for questionnaire ${questionnaire?.title}`,
                status: ACTIVITY_STATUSES.SUBMITTED,
                details: { taskId, subtaskId, questionnaireId }
            });
            await activity.save();

            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                message: 'Responses submitted successfully'
            });
        } catch (err) {
            httpError(next, err, req, 400);
        }
    },


    getStudentTimeline: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id.toString();
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;

            const taskAssignments = await StudentTaskAssignment.find({ studentId })
                .populate({
                    path: 'taskId',
                    select: 'title description logo priority assignee createdDate category',

                })
                .sort({ assignedAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await StudentTaskAssignment.countDocuments({ studentId });

            const taskIds = taskAssignments.map(ta => ta.taskId._id);
            const subtaskAssignments = await TaskSubtaskAssignment.find({ studentId, taskId: { $in: taskIds } })
                .populate({
                    path: 'subtaskId',
                    select: 'title description logo priority',
                })

                .sort({ assignedAt: 1 })
                .lean();

            const timeline = taskAssignments.map(ta => ({
                task: {
                    ...ta.taskId,
                    assignedAt: ta.assignedAt,
                    status: ta.status,
                    isLocked: ta.isLocked,
                    dueDate: ta.dueDate,
                    createdAt: ta.createdAt,
                    updatedAt: ta.updatedAt
                },
                subtasks: subtaskAssignments
                    .filter(sa => sa.taskId.toString() === ta.taskId._id.toString())
                    .map(sa => ({
                        ...sa.subtaskId,
                        assignedAt: sa.assignedAt,
                        status: sa.status,
                        isLocked: sa.isLocked,
                        dueDate: sa.dueDate,
                        createdAt: sa.createdAt,
                        updatedAt: sa.updatedAt
                    }))
            }));

            const responseData = {
                total: total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit),
                timeline: timeline
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },
    // Get student dashboard stats
    getStudentDashboardStats: async (req, res, next) => {
        try {
            const studentId = req.authenticatedStudent._id

            const taskStats = await StudentTaskAssignment.aggregate([
                { $match: { studentId: studentId } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const universityStats = await StudentUniversityAssignment.countDocuments({
                studentId: studentId
            });

            const statsMap = taskStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {});

            const totalAssignedTasks = taskStats.reduce((sum, curr) => sum + curr.count, 0);
            const totalCompleted = statsMap['COMPLETED'] || 0;
            const totalPending = (statsMap['PENDING'] || 0) + (statsMap['IN_PROGRESS'] || 0);
            const totalUniversityAssigned = universityStats;

            const responseData = {
                totalAssignedTasks: totalAssignedTasks,
                totalCompletedTasks: totalCompleted,
                totalPendingTasks: totalPending,
                totalUniversityAssigned: totalUniversityAssigned
            };

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData);
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },


}