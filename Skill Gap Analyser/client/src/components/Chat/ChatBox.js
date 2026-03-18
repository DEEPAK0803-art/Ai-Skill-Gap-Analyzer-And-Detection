import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '../Course/CourseCard';

const ChatBox = ({ messages, onSendMessage, onCourseClick, isLoading }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const renderMessage = (msg) => {
        if (msg.type === 'roadmap' || (typeof msg.content === 'object' && msg.content !== null)) {
            const data = typeof msg.content === 'object' ? msg.content : JSON.parse(msg.content);
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-white mb-2">{data.title} Learning Path</h3>
                        <p className="text-slate-400 text-sm">Follow these steps carefully to master the skill.</p>
                    </div>
                    
                    <div className="space-y-3">
                        {data.roadmap?.map((step, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                <span className="text-sm text-slate-200">{step}</span>
                            </div>
                        ))}
                    </div>

                    {data.courses?.length > 0 && (
                        <div>
                            <h4 className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                                <BookOpen size={16} className="mr-2" />
                                Recommended Courses
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {data.courses.map((course, i) => (
                                    <CourseCard key={i} course={course} onClick={onCourseClick} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {data.resources?.length > 0 && (
                        <div className="pt-4 border-t border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Additional Resources</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.resources.map((res, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700">
                                        {res}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Default text rendering
        return <div className="text-sm prose prose-invert max-w-full leading-relaxed">{msg.content}</div>;
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/50 shadow-2xl overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] items-start space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`mt-1 p-2.5 rounded-2xl shrink-0 shadow-lg ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-slate-700'
                                }`}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className={`relative p-6 rounded-3xl shadow-xl ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-slate-800/80 text-slate-100 rounded-tl-none border border-slate-700/50'
                                }`}>
                                    {renderMessage(msg)}
                                    <div className={`text-[10px] opacity-40 mt-4 flex items-center ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-slate-800/80 p-6 rounded-3xl rounded-tl-none border border-slate-700/50 flex items-center space-x-3">
                                <Loader2 className="animate-spin text-blue-500" size={20} />
                                <span className="text-sm text-slate-400 font-medium">Assistant is thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Input Area */}
            <div className="p-6 bg-slate-900/80 border-t border-slate-800/50">
                <div className="relative flex items-center max-w-3xl mx-auto gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message here..."
                            className="w-full bg-slate-950/80 border border-slate-700/50 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-light placeholder:text-slate-600"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold tracking-widest uppercase hidden sm:block">
                            Enter to send
                        </div>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 p-4 rounded-2xl transition-all shadow-lg shadow-blue-500/10 active:scale-95 group"
                    >
                        <Send size={22} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
