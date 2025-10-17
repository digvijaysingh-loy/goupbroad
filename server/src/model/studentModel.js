import mongoose from "mongoose";
import { EAuthProvider } from "../constant/application.js";
const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
        default: null,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    programDetails: {
        program: {
            type: String,
            default: null
        },
        validity: {
            type: Date,
            default: null
        }
    },
    phoneNumber: {
        type: String,
        default: null
    },
    personalDetails: {
        dob: {
            type: Date,
            default: null
        },
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER'],
            default: null
        },
        address: {
            type: String,
            default: null
        },
        profession: {
            type: String,
            default: null
        }
    },
    collegeDetails: {
        branch: {
            type: String,
            default: null
        },
        highestDegree: {
            type: String,
            default: null
        },
        university: {
            type: String,
            default: null
        },
        college: {
            type: String,
            default: null
        },
        gpa: {
            type: Number,
            default: null
        },
        toppersGPA: {
            type: Number,
            default: null
        },
        noOfBacklogs: {
            type: Number,
            default: null
        },
        admissionTerm: {
            type: String,
            default: null
        },
        coursesApplying: {
            type: [String],
            default: null
        }
    },
    greDetails: {
        grePlane: {
            type: Date,
            default: null
        },
        greDate: {
            type: Date,
            default: null
        },
        greScoreCard: {
            type: String,
            default: null
        },
        greScore: {
            verbal: {
                type: Number,
                default: null
            },
            quant: {
                type: Number,
                default: null
            },
            awa: {
                type: Number,
                default: null
            }
        },
        retakingGRE: {
            type: String,
            default: null
        }
    },
    ieltsDetails: {
        ieltsPlan: {
            type: Date,
            default: null
        },
        ieltsDate: {
            type: Date,
            default: null
        },
        ieltsScore: {
            reading: {
                type: Number,
                default: null
            },
            writing: {
                type: Number,
                default: null
            },
            speaking: {
                type: Number,
                default: null
            },
            listening: {
                type: Number,
                default: null
            }
        },
        retakingIELTS: {
            type: String,
            default: null
        }
    },
    toeflDetails: {
        toeflPlan: {
            type: Date,
            default: null
        },
        toeflDate: {
            type: Date,
            default: null
        },
        toeflScore: {
            reading: {
                type: Number,
                default: null
            },
            writing: {
                type: Number,
                default: null
            },
            speaking: {
                type: Number,
                default: null
            }
        },
        retakingTOEFL: {
            type: String,
            default: null
        }
    },
    visa: {
        countriesPlanningToApply: {
            type: [String],
            default: null
        },
        visaInterviewDate: {
            type: Date,
            default: null
        },
        visaInterviewLocation: {
            type: String,
            default: null
        }
    },
    status: {
        type: String,
        enum: ["PENDING", "ACTIVE", "COMPLETE", "REJECTED"],
        default: "PENDING"
    },
    isFeePaid: {
        type: Boolean,
        default: false
    },
    planDetails: {
        course: {
            type: String,
            default: null
        },
        planId: {
            type: String,
            default: null
        },
        planName: {
            type: String,
            default: null
        },
        planPrice: {
            type: Number,
            default: null
        },
        planBuyDate: {
            type: Date,
            default: Date.now()
        },
        receiptLink: {
            type: String,

        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null
    },
    facebookId: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: [...Object.values(EAuthProvider)],
        default: 'LOCAL'
    },
    role: {
        type: String,
        default: "STUDENT"
    },

    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

studentSchema.statics.findByEmail = function (email) {
    return this.findOne({ email });
};

studentSchema.statics.findByGoogleId = function (googleId) {
    return this.findOne({ googleId });
};

studentSchema.statics.findByFacebookId = function (facebookId) {
    return this.findOne({ facebookId });
};

studentSchema.methods.comparePassword = async function (password) {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, this.password);
};

studentSchema.methods.isAccountConfirmed = function () {
    return this.isVerified;
};

const Student = mongoose.model('Student', studentSchema);
export default Student