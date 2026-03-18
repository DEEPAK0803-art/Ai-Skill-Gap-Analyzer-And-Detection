import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillCard from '../components/Skill/SkillCard';
import RoadmapModal from '../components/Skill/RoadmapModal';
import ChatBox from '../components/Chat/ChatBox';
import CourseModal from '../components/Course/CourseModal';
import axios from 'axios';
import { LayoutDashboard, MessageSquare, TrendingUp, LogOut, Clock, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [analysis, setAnalysis] = useState(null);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('analysis');
    const [loading, setLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch initial analysis
                const analysisRes = await axios.post('http://localhost:5000/api/analysis/analyze', {
                    targetRole: 'AI Engineer',
                    resumeText: 'Experience in Python and SQL'
                });
                setAnalysis(analysisRes.data);
                
                // Fetch chat history
                const chatRes = await axios.get('http://localhost:5000/api/chat/chat-history');
                const history = chatRes.data || [];
                
                if (history.length === 0) {
                    setMessages([{ 
                        role: 'assistant', 
                        type: 'text',
                        content: `Welcome back, ${user?.name}! I've analyzed your current profile. We've identified some key technical areas to focus on for your journey to becoming an **AI Engineer**. How can I help you today?`, 
                        timestamp: new Date() 
                    }]);
                } else {
                    setMessages(history);
                }
            } catch (err) {
                console.error('Error fetching data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSendMessage = async (text) => {
        const userMsg = { 
            role: 'user', 
            type: 'text',
            content: text, 
            timestamp: new Date() 
        };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setChatLoading(true);

        try {
            // Save user message
            await axios.post('http://localhost:5000/api/chat/save-chat', { messages: updatedMessages });

            // Simulate structured AI response for demonstration
            // In production, this would come from the Gemini API formatted as JSON
            setTimeout(async () => {
                let aiResponse;
                
                if (text.toLowerCase().includes('roadmap') || text.toLowerCase().includes('learn')) {
                    const structuredData = {
                        type: "roadmap",
                        title: "Machine Learning Foundations",
                        roadmap: [
                            "Master Mathematics for ML (Calculus, Linear Algebra)",
                            "Python for Data Science (NumPy, Pandas, Matplotlib)",
                            "Classical Machine Learning (Regression, Classification)",
                            "Clustering & Unsupervised Learning",
                            "Ensemble Methods (XGBoost, Random Forest)"
                        ],
                        resources: ["Kaggle Competitions", "Scikit-Learn Docs", "StatQuest YouTube"],
                        courses: [
                            {
                                name: "Machine Learning Specialization",
                                platform: "Coursera",
                                duration: "10 weeks",
                                level: "Intermediate",
                                description: "The definitive introduction to machine learning by Andrew Ng. Covers supervised learning, unsupervised learning, and best practices in AI.",
                                link: "https://www.coursera.org/specializations/machine-learning-introduction"
                            },
                            {
                                name: "Deep Learning Specialization",
                                platform: "DeepLearning.AI",
                                duration: "16 weeks",
                                level: "Advanced",
                                description: "Build neural networks in Python and TensorFlow. Understand the math behind backpropagation and optimization.",
                                link: "https://www.coursera.org/specializations/deep-learning"
                            }
                        ]
                    };
                    
                    aiResponse = { 
                        role: 'assistant', 
                        type: 'roadmap',
                        content: structuredData, 
                        timestamp: new Date() 
                    };
                } else {
                    aiResponse = { 
                        role: 'assistant', 
                        type: 'text',
                        content: `That's an interesting topic. To better help you with **${text}**, would you like me to generate a specific learning roadmap or recommend some specialized courses?`, 
                        timestamp: new Date() 
                    };
                }

                const finalMessages = [...updatedMessages, aiResponse];
                setMessages(finalMessages);
                setChatLoading(false);
                
                // Save complete chat history
                await axios.post('http://localhost:5000/api/chat/save-chat', { messages: finalMessages });
            }, 1500);

        } catch (err) {
            console.error("Error sending message", err);
            setChatLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={32} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
            <AnimatePresence>
                {selectedCourse && (
                    <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
                )}
                {selectedSkill && (
                    <RoadmapModal 
                        skill={selectedSkill} 
                        onClose={() => setSelectedSkill(null)} 
                        onCourseClick={setSelectedCourse}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className="w-72 bg-slate-900/40 backdrop-blur-3xl border-r border-slate-800/50 flex flex-col items-center py-10 px-6 z-20">
                <div className="flex items-center space-x-3 mb-16">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
                        SkillGap.AI
                    </span>
                </div>
                
                <nav className="flex-1 w-full space-y-3">
                    <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'analysis' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'}`}
                    >
                        <LayoutDashboard size={22} />
                        <span className="font-bold">Dashboard</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'}`}
                    >
                        <MessageSquare size={22} />
                        <span className="font-bold">AI Mentor</span>
                    </button>
                    <button className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-300">
                        <TrendingUp size={22} />
                        <span className="font-bold">Progress</span>
                    </button>
                </nav>

                <div className="w-full pt-8 border-t border-slate-800/50">
                    <div className="flex items-center space-x-4 px-4 py-4 mb-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg">
                            {user?.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate text-slate-100">{user?.name}</p>
                            <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">Premium Plan</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all font-bold"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative p-4 md:p-8 lg:p-12">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10"></div>

                {activeTab === 'analysis' ? (
                    <div className="max-w-6xl mx-auto space-y-12">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <h1 className="text-5xl font-black mb-3 tracking-tighter text-white">Career Profile</h1>
                                <p className="text-slate-500 flex items-center text-lg font-medium">
                                    <Target className="mr-3 text-blue-500" size={24} />
                                    Optimizing for: <span className="text-blue-400 font-black ml-2">{analysis?.targetRole}</span>
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-wrap gap-4"
                            >
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-[2.5rem] min-w-[180px] shadow-2xl">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">Est. Time</p>
                                    <div className="flex items-center">
                                        <Clock className="text-blue-500 mr-3" size={28} />
                                        <span className="text-3xl font-black text-white">{analysis?.totalDuration}w</span>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-[2.5rem] min-w-[200px] shadow-2xl">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/60 font-black mb-3">Optimized</p>
                                    <div className="flex items-center">
                                        <TrendingUp className="text-emerald-500 mr-3" size={28} />
                                        <span className="text-3xl font-black text-emerald-400">{analysis?.parallelDuration}w</span>
                                    </div>
                                </div>
                            </motion.div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {analysis?.skills.map((skill, idx) => (
                                <SkillCard 
                                    key={idx} 
                                    skill={skill} 
                                    onClick={() => setSelectedSkill(skill)} 
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-[calc(100vh-80px)] flex flex-col max-w-5xl mx-auto">
                        <header className="mb-10 pl-4">
                            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic">Mentor AI</h1>
                            <p className="text-slate-500 font-medium">Your personalized AI career coach, available 24/7.</p>
                        </header>
                        <div className="flex-1 min-h-0">
                            <ChatBox 
                                messages={messages} 
                                onSendMessage={handleSendMessage}
                                onCourseClick={setSelectedCourse}
                                isLoading={chatLoading} 
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
