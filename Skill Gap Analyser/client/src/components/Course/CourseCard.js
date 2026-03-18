import React from 'react';
import { ExternalLink, Clock, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseCard = ({ course, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onClick(course)}
            className="cursor-pointer bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-5 shadow-lg transition-all group"
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                    {course.platform}
                </span>
                <ExternalLink size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            
            <h4 className="text-md font-bold text-slate-100 mb-4 line-clamp-2 min-h-[3rem]">
                {course.name}
            </h4>
            
            <div className="flex items-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {course.duration}
                </div>
                <div className="flex items-center">
                    <BarChart size={12} className="mr-1" />
                    {course.level}
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-center text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                View Details
            </div>
        </motion.div>
    );
};

export default CourseCard;
