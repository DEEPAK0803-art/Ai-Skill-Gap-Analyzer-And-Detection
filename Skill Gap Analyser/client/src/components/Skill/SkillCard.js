import React from 'react';
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SkillCard = ({ skill, onClick }) => {
    const isMatching = skill.status === 'Matching';
    
    return (
        <motion.div
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 shadow-xl ${
                isMatching 
                ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50' 
                : 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50'
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${isMatching ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                    {isMatching ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Circle className="text-blue-500" size={24} />}
                </div>
                <div className="px-3 py-1 bg-slate-900/50 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-400 border border-slate-700">
                    {skill.level}
                </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-100 mb-2">{skill.name}</h3>
            
            {!isMatching && (
                <div className="flex items-center text-slate-400 text-sm space-x-4">
                    <div className="flex items-center">
                        <Clock size={14} className="mr-1.5" />
                        <span>{skill.duration} weeks</span>
                    </div>
                    {skill.dependencies?.length > 0 && (
                        <div className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
                            Prerequisites: {skill.dependencies.join(', ')}
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-4 flex items-center text-xs font-medium text-blue-400 group">
                View Roadmap
                <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
        </motion.div>
    );
};

export default SkillCard;
