import httpResponse from '../../util/httpResponse.js';
import responseMessage from '../../constant/responseMessage.js';
import httpError from '../../util/httpError.js';
import quicker from '../../util/quicker.js';
import { validateJoiSchema, ValidateLogin, ValidateSignup } from '../../service/validationService.js';
import config from '../../config/config.js';
import Student from '../../model/studentModel.js';
import StudentActivity from '../../model/studentActivitySchema.js';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../constant/application.js';

export default {
    login: async (req, res, next) => {
        try {
            const { body } = req;

            const { value, error } = validateJoiSchema(ValidateLogin, { ...body });


            if (error) {
                return httpError(next, error, req, 422);
            }

            const { email, password } = value;

            const student = await Student.findOne({ email });
            if (!student || !await quicker.comparePassword(password, student.password)) {
                return httpResponse(req, res, 401, responseMessage.CUSTOM_MESSAGE("Invalid Credentials"));
            }

            // if (!student.isFeePaid) {
            //     return httpResponse(req, res, 403, responseMessage.SOMETHING_WENT_WRONG + ' - Fee payment pending');
            // }

            const accessToken = quicker.generateToken(
                { email: student.email, studentId: student._id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );


            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                path: '/',
                sameSite: 'strict'
            });

            const userData = { ...student.toObject(), password: undefined };
            const activity = new StudentActivity({
                studentId: student._id,
                activityType: ACTIVITY_TYPES.LOGIN,
                message: `Student ${student.email} logged in`,
                status: ACTIVITY_STATUSES.COMPLETED
            });
            await activity.save();
            httpResponse(req, res, 200, responseMessage.SUCCESS, { accessToken, user: userData });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

    signup: async (req, res, next) => {
        try {
            const { body } = req;
            console.log(body);

            const { value, error } = validateJoiSchema(ValidateSignup, { ...body });

            if (error) {
                return httpError(next, error, req, 422);
            }

            const { email, password } = value;

            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                return httpResponse(req, res, 409, responseMessage.SOMETHING_WENT_WRONG + ' - Email already in use');
            }



            const hashedPassword = await quicker.hashPassword(password);
            console.log(hashedPassword);

            const student = new Student({
                email,
                password: hashedPassword
            });

            await student.save();



            const userData = { ...student.toObject(), password: undefined };
            httpResponse(req, res, 201, responseMessage.SUCCESS, { user: userData });
        } catch (err) {
            console.log(err);
            httpError(next, err, req, 500);
        }
    },

    oauthSuccess: async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return httpError(next, new Error('OAuth authentication failed'), req, 401);
            }

            const accessToken = quicker.generateToken(
                { email: user.email, studentId: user._id },
                config.ACCESS_TOKEN.SECRET,
                config.ACCESS_TOKEN.EXPIRY
            );

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                path: '/',
                sameSite: 'strict'
            });

            const userData = { ...user.toObject(), password: undefined };

            // Log activity
            const activity = new StudentActivity({
                studentId: user._id,
                activityType: ACTIVITY_TYPES.LOGIN,
                message: `Student ${user.email} logged in via ${user.provider}`,
                status: ACTIVITY_STATUSES.COMPLETED
            });
            await activity.save();

            const userObject = user.toObject();
            delete userObject.password;

            const isNewUser = !user.isFeePaid;
            const redirectUrl = isNewUser
                ? `${config.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accesstoken=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObject))}&redirectTo=/pricing`
                : `${config.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accesstoken=${accessToken}&user=${encodeURIComponent(JSON.stringify(userObject))}&redirectTo=/dashboard`;



            return res.redirect(redirectUrl)

            // httpResponse(req, res, 200, responseMessage.SUCCESS, {
            //     accessToken,
            //     user: userData,
            //     requiresPayment: !user.isFeePaid,
            //     message: isNewUser ? 'Registration successful. Payment required to access dashboard.' : 'Login successful',
            //     redirectUrl,
            // });

        } catch (err) {
            const errorRedirectUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/signin?error${encodeURIComponent(err?.message || err)}`
            return res.redirect(errorRedirectUrl)

        }
    },

    oauthFailure: (req, res, next) => {
        try {
            if (req.accepts('html')) {
                const errorMessage = req.flash('error') || 'Authentication failed';
                const redirectUrl = `${config.FRONTEND_URL || 'http://localhost:3000'}/signin?error=${encodeURIComponent(errorMessage)}`;
                return res.redirect(redirectUrl);
            }

            httpResponse(req, res, 400, 'Authentication failed', {
                status: false,
                message: "Failed Authentication"
            });
        } catch (err) {
            httpError(next, err, req, 500);
        }
    },

};