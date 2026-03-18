const express = require('express');
const axios = require('axios');
const router = express.Router();
const Analysis = require('../models/Analysis');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Skill duration mapping (in weeks)
const LEVEL_DURATIONS = {
    'Beginner': 4,
    'Intermediate': 6,
    'Advanced': 8
};

// Dependency map example
const SKILL_DEPENDENCIES = {
    'Deep Learning': ['Machine Learning'],
    'TensorFlow': ['Deep Learning'],
    'PyTorch': ['Deep Learning'],
    'Deployment': ['Machine Learning', 'Deep Learning']
};

// Analyze Resume Logic (Stub for AI integration)
router.post('/analyze', auth, async (req, res) => {
    try {
        const { targetRole, resumeText } = req.body;
        
        // This would typically involve calling Gemini API to extract current skills
        // and compare with target role skills from a database.
        
        // MOCK ANALYSIS RESULTS for demonstration
        const skills = [
            { 
                name: 'Machine Learning', 
                level: 'Intermediate', 
                status: 'Missing',
                courses: [
                    {
                        name: "Machine Learning Specialization",
                        platform: "Coursera",
                        duration: "10 weeks",
                        level: "Intermediate",
                        description: "The definitive introduction to machine learning by Andrew Ng. Covers supervised learning, unsupervised learning, and best practices in AI.",
                        link: "https://www.coursera.org/specializations/machine-learning-introduction"
                    }
                ]
            },
            { 
                name: 'Deep Learning', 
                level: 'Advanced', 
                status: 'Missing',
                courses: [
                    {
                        name: "Deep Learning Specialization",
                        platform: "DeepLearning.AI",
                        duration: "16 weeks",
                        level: "Advanced",
                        description: "Build neural networks in Python and TensorFlow. Understand the math behind backpropagation and optimization.",
                        link: "https://www.coursera.org/specializations/deep-learning"
                    }
                ]
            },
            { 
                name: 'TensorFlow', 
                level: 'Beginner', 
                status: 'Missing',
                courses: [
                    {
                        name: "TensorFlow Developer Professional Certificate",
                        platform: "Coursera",
                        duration: "8 weeks",
                        level: "Beginner",
                        description: "Learn how to build and train powerful computer vision, natural language processing, and real-world models in TensorFlow.",
                        link: "https://www.coursera.org/professional-certificates/tensorflow-in-practice"
                    }
                ]
            },
            { name: 'Python', level: 'Advanced', status: 'Matching' },
            { name: 'SQL', level: 'Intermediate', status: 'Matching' }
        ];

        // Enrich with durations and dependencies
        const missingSkills = skills.filter(s => s.status === 'Missing').map(skill => ({
            ...skill,
            duration: LEVEL_DURATIONS[skill.level] || 6,
            dependencies: SKILL_DEPENDENCIES[skill.name] || []
        }));

        // Calculate Time
        const totalDuration = missingSkills.reduce((sum, s) => sum + s.duration, 0);

        // Parallel Optimized Duration Logic
        // Find the longest dependency chain
        const calculateChainDuration = (skillName, visited = new Set()) => {
            if (visited.has(skillName)) return 0;
            visited.add(skillName);
            const skill = missingSkills.find(s => s.name === skillName);
            if (!skill) return 0;

            const deps = skill.dependencies || [];
            let maxDepDuration = 0;
            for (const dep of deps) {
                maxDepDuration = Math.max(maxDepDuration, calculateChainDuration(dep, visited));
            }
            return skill.duration + maxDepDuration;
        };

        let parallelDuration = 0;
        missingSkills.forEach(skill => {
            parallelDuration = Math.max(parallelDuration, calculateChainDuration(skill.name));
        });

        const analysis = new Analysis({
            userId: req.user.userId,
            targetRole,
            skills: missingSkills,
            totalDuration,
            parallelDuration
        });

        await analysis.save();
        res.json(analysis);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
