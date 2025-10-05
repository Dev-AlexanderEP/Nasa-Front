import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Input = ({ placeholder = "Search NASA databases...", onSearch, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && value.trim()) {
      onSearch(value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl"
          animate={{
            scale: isFocused ? 1.02 : 1,
            opacity: isFocused ? 0.8 : 0.4,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Main input container */}
        <motion.div
          className={`
            relative backdrop-blur-sm bg-gradient-to-r from-slate-900/90 via-blue-900/80 to-slate-900/90
            border rounded-2xl transition-all duration-300 overflow-hidden
            ${isFocused 
              ? 'border-blue-400/60 shadow-lg shadow-blue-500/25' 
              : 'border-slate-600/40 hover:border-slate-500/60'
            }
          `}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-60"
            animate={{
              background: isFocused 
                ? ['linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)', 
                   'linear-gradient(90deg, #8b5cf6, #06b6d4, #3b82f6)',
                   'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)']
                : 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)'
            }}
            transition={{ duration: 3, repeat: isFocused ? Infinity : 0 }}
            style={{ padding: '1px' }}
          >
            <div className="w-full h-full bg-gradient-to-r from-slate-900/95 via-blue-900/85 to-slate-900/95 rounded-2xl" />
          </motion.div>

          <div className="relative flex items-center p-1">
            {/* Search icon */}
            <motion.div
              className="flex items-center justify-center w-12 h-12 ml-2"
              animate={{
                rotate: isFocused ? [0, -10, 10, 0] : 0,
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              <svg 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isFocused ? 'text-blue-400' : 'text-gray-400'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.div>

            {/* Input field */}
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="
                flex-1 bg-transparent text-white placeholder-gray-400 
                px-4 py-4 text-lg font-medium tracking-wide
                focus:outline-none focus:placeholder-gray-500
                selection:bg-blue-500/30
              "
            />

            {/* Search button */}
            <motion.button
              type="submit"
              disabled={!value.trim()}
              className={`
                mx-2 px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider
                transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
                ${value.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-400'
                }
              `}
              whileHover={value.trim() ? { scale: 1.05 } : {}}
              whileTap={value.trim() ? { scale: 0.95 } : {}}
              animate={{
                boxShadow: isFocused && value.trim() 
                  ? ['0 0 0 rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.5)', '0 0 0 rgba(59, 130, 246, 0)']
                  : '0 0 0 rgba(59, 130, 246, 0)'
              }}
              transition={{ duration: 2, repeat: isFocused && value.trim() ? Infinity : 0 }}
            >
              Search
            </motion.button>
          </div>

          {/* Scan line effect */}
          {isFocused && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              initial={{ width: '0%', x: '0%' }}
              animate={{ width: ['0%', '100%', '0%'], x: ['0%', '0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Floating particles effect */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                style={{
                  left: `${10 + (i * 10)}%`,
                  top: '50%',
                }}
                animate={{
                  y: [-20, -60, -100],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.form>

      {/* Helper text */}
      <motion.p
        className="text-center text-gray-400 text-sm mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        🛰️ Search through NASA's cosmic database • Press Enter or click Search
      </motion.p>
    </div>
  );
};

export default Input;