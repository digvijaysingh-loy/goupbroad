import mongoose from "mongoose";

const UniversityItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g., "ambitious-mit"
  name: { type: String, required: true }, // University name
  university: { type: String, required: true },
  program: { type: String, required: true },
  tier: {
    type: String,
    enum: ["ambitious", "target", "safe", "backup"],
    required: true,
  },
  length: { type: String },
  probability: { type: Number }, // e.g., 75 (for percentage)
  ranking: {
    national: { type: Number },
  },
  location: { type: String },
  tuition: { type: String }, // keep as string since it has "$50,000 - $70,000"
  description: { type: String },
  acceptanceRate: { type: Number },
  stemDesignated: { type: Boolean, default: false },
  f1Eligible: { type: Boolean, default: true },
  accepts3Year: { type: Boolean, default: true },
  features: [{ type: String }], // e.g., ["Research Opportunities"]
}, { _id: false });

const BucketsSchema = new mongoose.Schema({
  ambitious: [UniversityItemSchema],
  target: [UniversityItemSchema],
  safe: [UniversityItemSchema],
  backup: [UniversityItemSchema],
  total: { type: Number, required: true },
}, { _id: false });

const UniversityRecommendationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true, // for fast lookup by student
  },

  mode: {
    type: String,
    enum: ["FAST", "ACCURATE"],
    required: true,
  },

  degreeKind: {
    type: String,
    default: "Masters",
    enum: ["Bachelors", "Masters", "MBA", "PhD", "Other"],
  },

  results: {
    type: BucketsSchema,
    required: true,
  },

  // Metadata
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true, // for sorting latest first
  },

  // Optional: store raw LLM output for debugging
  rawLlmOutput: {
    type: String,
    select: false, // hidden by default in queries
  },

  // If you want to expire old ones automatically
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    index: { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Compound index for efficient queries
UniversityRecommendationSchema.index({ student: 1, mode: 1, generatedAt: -1 });

const UniversityRecommendation = mongoose.model("UniversityRecommendation", UniversityRecommendationSchema);

export default UniversityRecommendation;