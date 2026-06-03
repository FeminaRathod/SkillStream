import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { askCourseQuestion } from '../../../services/operations/courseAPI';
import { AiOutlineLoading3Quarters, AiOutlineSend } from 'react-icons/ai';
import { BiBot } from 'react-icons/bi';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const CourseQA = ({ courseId }) => {
  const { token } = useSelector((state) => state.auth);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize messages from localStorage if available
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem(`courseQA_messages_${courseId}`);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [expanded, setExpanded] = useState(false);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`courseQA_messages_${courseId}`, JSON.stringify(messages));
  }, [messages, courseId]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!token) {
      toast.error('Please log in to ask questions');
      return;
    }

    setLoading(true);
    const userQuestion = question;
    setQuestion('');

    // Add user question to messages
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        text: userQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const result = await askCourseQuestion(courseId, userQuestion, token);
      
      if (result) {
        // Add AI response to messages
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            text: result.answer,
            sources: result.sources || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          text: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-richblack-800 rounded-xl border border-richblack-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-richblack-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BiBot className="text-caribbeangreen-300 text-2xl" />
          <div className="text-left">
            <h3 className="text-richblack-5 font-semibold">Course AI Assistant</h3>
            <p className="text-richblack-400 text-sm">Ask questions about the course content</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-richblack-300 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-richblack-700 bg-richblack-900">
          {/* Messages Container */}
          <div className="h-96 overflow-y-auto flex flex-col gap-4 p-6 no-scrollbar">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <BiBot className="text-richblack-500 text-4xl mx-auto mb-3 opacity-50" />
                  <p className="text-richblack-400">Ask me anything about the course content!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] lg:max-w-[80%] px-5 py-4 rounded-xl ${
                      msg.type === 'user'
                        ? 'bg-caribbeangreen-500 text-richblack-900 rounded-br-sm'
                        : 'bg-richblack-700 text-richblack-5 rounded-bl-sm shadow-md'
                    }`}
                  >
                    {msg.type === 'ai' ? (
                      <div className="text-sm">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-caribbeangreen-200" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-richblack-50" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-white" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-white" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2 text-white" {...props} />,
                            code: ({node, inline, ...props}) => inline ? <code className="bg-richblack-800 px-1 py-0.5 rounded text-caribbeangreen-100 font-mono text-xs" {...props} /> : <code className="block bg-richblack-800 p-3 rounded-md overflow-x-auto text-caribbeangreen-100 font-mono text-xs mb-2" {...props} />,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    )}
                    
                    <span className="text-xs opacity-70 mt-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-richblack-700 text-richblack-5 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-richblack-700 p-4 bg-richblack-800">
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the course..."
                disabled={loading}
                className="flex-1 bg-richblack-700 text-richblack-5 border border-richblack-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="bg-caribbeangreen-500 hover:bg-caribbeangreen-600 disabled:opacity-50 disabled:cursor-not-allowed text-richblack-900 p-2 rounded-lg transition-colors"
              >
                <AiOutlineSend className="text-xl" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseQA;
