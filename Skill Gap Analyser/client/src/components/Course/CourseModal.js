import React from 'react';
import { X, ExternalLink, Clock, BarChart, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseModal = ({ course, onClose }) => {
    if (!course) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl"
            >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-2">
                        {course.platform}
                    </span>
                    <h2 className="text-2xl font-black text-white">{course.name}</h2>
                </div>

                <div className="p-8">
                    <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-tighter">Duration</span>
                            <div className="flex items-center text-slate-200">
                                <Clock size={16} className="mr-2 text-blue-400" />
                                <span className="font-semibold">{course.duration}</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-tighter">Level</span>
                            <div className="flex items-center text-slate-200">
                                <BarChart size={16} className="mr-2 text-emerald-400" />
                                <span className="font-semibold">{course.level}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="flex items-center text-slate-100 font-bold mb-4">
                            <BookOpen size={18} className="mr-2 text-blue-500" />
                            About this Course
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        <a 
                            href={course.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>Go to Course</span>
                            <ExternalLink size={18} />
                        </a>
                        <button 
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CourseModal;
