const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    skills: [{
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
        status: { type: String, enum: ['Missing', 'Matching'], required: true },
        duration: { type: Number }, // in weeks
        dependencies: [String]
    }],
    totalDuration: { type: Number },
    parallelDuration: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
