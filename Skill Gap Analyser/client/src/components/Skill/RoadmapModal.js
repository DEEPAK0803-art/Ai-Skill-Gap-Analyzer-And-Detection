import React from 'react';
import { X, ExternalLink, BookOpen, Layers, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '../Course/CourseCard';

const ROADMAP_DATA = {
    "Machine Learning": {
        steps: ["Python Fundamentals for Data Science", "Exploratory Data Analysis (EDA)", "Mathematical Foundations (Linear Algebra, Calculus)", "Supervised Learning Models", "Unsupervised Learning", "Model Evaluation & Tuning"],
        resources: [
            "Kaggle Introduction to ML",
            "Hands-On Machine Learning (Scikit-Learn) - Book",
            "Mathematics for ML - YouTube"
        ],
        path: ["Beginner: Basic models", "Intermediate: Ensemble methods", "Advanced: Neural networks"]
    },
    // Default fallback
    "Default": {
        steps: ["Introduction to core concepts", "Foundational tools & technologies", "Hands-on projects", "Advanced techniques", "Deployment & Best practices"],
        resources: [
            "Documentation & Technical Docs",
            "Top-rated Online Courses",
            "Community Forum & Support"
        ],
        path: ["Beginner: Syntax & Concepts", "Intermediate: Implementation", "Advanced: Mastery"]
    }
};

const RoadmapModal = ({ skill, onClose, onCourseClick }) => {
    if (!skill) return null;
    const data = ROADMAP_DATA[skill.name] || ROADMAP_DATA["Default"];
    const courses = skill.courses || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-3xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">{skill.name} Roadmap</h2>
                        <p className="text-slate-400 text-sm mt-1 font-medium">Personalized journey for {skill.level} level</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-y-auto">
                    {/* Steps */}
                    <div className="p-8 border-b md:border-b-0 md:border-r border-slate-700 space-y-8">
                        <div>
                            <div className="flex items-center mb-6 text-blue-400 font-black tracking-widest uppercase text-xs">
                                <Layers size={16} className="mr-2" />
                                Step-by-Step Guide
                            </div>
                            <div className="space-y-4">
                                {data.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-start group">
                                        <div className="mr-4 flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-blue-400 transition-colors group-hover:border-blue-500">
                                                {idx + 1}
                                            </div>
                                            {idx !== data.steps.length - 1 && (
                                                <div className="w-0.5 h-10 bg-slate-800 group-hover:bg-blue-500/20 my-1"></div>
                                            )}
                                        </div>
                                        <div className="pt-1.5 text-slate-100 font-medium group-hover:text-blue-400 transition-colors text-sm">
                                            {step}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {courses.length > 0 && (
                            <div className="pt-8 border-t border-slate-800">
                                <div className="flex items-center mb-6 text-emerald-400 font-black tracking-widest uppercase text-xs">
                                    <BookOpen size={16} className="mr-2" />
                                    Recommended Courses
                                </div>
                                <div className="space-y-4">
                                    {courses.map((course, idx) => (
                                        <CourseCard 
                                            key={idx} 
                                            course={course} 
                                            onClick={onCourseClick} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resources & Path */}
                    <div className="p-8 bg-slate-800/20 space-y-10">
                        <section>
                            <div className="flex items-center mb-6 text-emerald-400 font-black tracking-widest uppercase text-xs">
                                <ExternalLink size={16} className="mr-2" />
                                Key Resources
                            </div>
                            <div className="space-y-3">
                                {data.resources.map((res, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4"></div>
                                        <span className="text-sm text-slate-200 font-medium">{res}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center mb-6 text-purple-400 font-black tracking-widest uppercase text-xs">
                                <Terminal size={16} className="mr-2" />
                                Learning Path
                            </div>
                            <div className="space-y-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                                {data.path.map((p, idx) => (
                                    <div key={idx} className="flex items-center text-sm text-slate-300 font-medium">
                                        <ChevronRight size={14} className="text-purple-500 mr-3" />
                                        {p}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="p-8 bg-slate-800/80 border-t border-slate-700 text-center shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                    >
                        Mastered, Close Roadmap
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default RoadmapModal;
