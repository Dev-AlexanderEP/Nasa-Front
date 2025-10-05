import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import fondoImg from '../assets/Fondo.jpg';
import Input from '../components/Input';
import SimpleGraph from '../components/SimpleGraph';
import { searchAPI } from '../services/api';

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchTerm(searchTerm);
    
    try {
      console.log('Searching for:', searchTerm);
      const results = await searchAPI(searchTerm, 20);
      setSearchResults(results);
      setIsSearchMode(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToHome = () => {
    setIsSearchMode(false);
    setSearchTerm('');
    setSearchResults(null);
    setSearchError(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    animate: {
      boxShadow: [
        '0 0 20px rgba(59, 130, 246, 0.3)',
        '0 0 40px rgba(147, 51, 234, 0.5)',
        '0 0 20px rgba(59, 130, 246, 0.3)'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Overlay - Full Screen */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${fondoImg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 via-transparent to-purple-900/15" />
      </div>

      {/* Animated Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isSearchMode ? (
          // HOME MODE - Pantalla inicial
          <motion.div
            key="home"
            className="relative z-10 w-full h-full flex flex-col items-center justify-start px-6 py-8"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            {/* NASA Logo & Title */}
            <motion.div
              className="text-center mb-12"
              variants={itemVariants}
            >
              <motion.div
                className="mb-6"
                variants={floatingVariants}
                animate="animate"
              >
                <div className="relative">
                  <h1 
                    className="text-6xl md:text-8xl font-bold mb-4 relative z-10"
                    style={{
                      background: 'linear-gradient(45deg, #60a5fa, #a855f7, #22d3ee)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    NASA
                  </h1>
                  {/* Fallback visible text */}
                  <h1 
                    className="text-6xl md:text-8xl font-bold mb-4 absolute inset-0 text-blue-400 opacity-90"
                    style={{
                      textShadow: '0 0 20px rgba(96, 165, 250, 0.8), 0 0 40px rgba(168, 85, 247, 0.5)',
                      zIndex: 5
                    }}
                  >
                    NASA
                  </h1>
                </div>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-6 shadow-lg" 
                     style={{ boxShadow: '0 0 15px rgba(96, 165, 250, 0.6)' }}></div>
              </motion.div>
              
              <motion.h2
                className="text-2xl md:text-4xl text-white font-light tracking-widest mb-4"
                variants={itemVariants}
              >
                SPACE EXPLORATION NETWORK
              </motion.h2>
              
              <motion.p
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                variants={itemVariants}
              >
                Discover the infinite cosmos through cutting-edge research and groundbreaking missions 
                that push the boundaries of human knowledge and exploration.
              </motion.p>
            </motion.div>

            {/* Search Component */}
            <motion.div
              className="w-full max-w-3xl mb-16"
              variants={itemVariants}
            >
              <Input
                placeholder="Search NASA missions, discoveries, and cosmic data..."
                onSearch={handleSearch}
              />
            </motion.div>

            {/* Mission Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full max-w-4xl"
              variants={itemVariants}
            >
              {[
                { number: "60+", label: "YEARS OF EXPLORATION", icon: "🚀" },
                { number: "500+", label: "SUCCESSFUL MISSIONS", icon: "🛰️" },
                { number: "∞", label: "POSSIBILITIES AHEAD", icon: "🌌" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-sm border border-blue-500/20"
                  variants={glowVariants}
                  animate="animate"
                  whileHover={{ scale: 1.05 }}
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-300 tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 mb-12"
              variants={itemVariants}
            >
              <Link to="/graph">
                <motion.div
                  className="px-8 py-4 rounded-xl font-semibold text-lg tracking-wide
                           bg-gradient-to-r from-blue-600 to-purple-600 text-white
                           transition-all duration-300 backdrop-blur-sm shadow-lg
                           hover:from-blue-700 hover:to-purple-700 text-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">🌐</span>
                  RESEARCH NETWORK
                </motion.div>
              </Link>
              
              <Link to="/cytoscape">
                <motion.div
                  className="px-8 py-4 rounded-xl font-semibold text-lg tracking-wide
                           bg-slate-900/50 text-gray-300 border border-gray-600
                           transition-all duration-300 backdrop-blur-sm
                           hover:border-purple-500 hover:text-white text-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">📊</span>
                  DATA VISUALIZATION
                </motion.div>
              </Link>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="mt-auto pb-8"
              variants={itemVariants}
            >
              <p className="text-gray-400 text-sm tracking-wider text-center">
                © 2025 NASA • NATIONAL AERONAUTICS AND SPACE ADMINISTRATION
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // SEARCH MODE - Pantalla de búsqueda
          <motion.div
            key="search"
            className="relative z-10 w-full h-full flex flex-col"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Top Search Bar */}
            <motion.div
              className="w-full bg-gradient-to-r from-slate-900/90 to-blue-900/90 backdrop-blur-sm border-b border-blue-500/20 py-4 px-6"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Back Button */}
                <motion.button
                  onClick={handleBackToHome}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/50 text-gray-300 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>←</span>
                  <span>Back to Home</span>
                </motion.button>

                {/* Search Input Minimized */}
                <div className="flex-1 max-w-2xl mx-6">
                  <Input
                    placeholder="Search NASA missions, discoveries, and cosmic data..."
                    onSearch={handleSearch}
                    initialValue={searchTerm}
                  />
                </div>

                {/* NASA Title Small */}
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  NASA
                </div>
              </div>
            </motion.div>

            {/* Search Results Area */}
            <motion.div
              className="flex-1 overflow-y-auto px-6 py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="max-w-6xl mx-auto">
                {/* Search Results Header */}
                <motion.div
                  className="mb-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex justify-center items-center mb-6 border border-white">
                    
                    
                    <div className="text-center flex border border-white">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Search Results for: <span className="text-blue-400">"{searchTerm}"</span>
                      </h2>
                      <p className="text-gray-300">
                        Exploring NASA's research network based on your query
                      </p>
                    </div>
                    
                    <div className="w-24" /> {/* Spacer for balance */}
                  </div>
                </motion.div>

                {/* Search Results Area */}
                <motion.div
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 min-h-[600px]"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center h-96">
                      <motion.div
                        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-blue-400 mt-4 text-lg">Searching NASA Database...</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Query: "{searchTerm}"
                      </p>
                    </div>
                  ) : searchError ? (
                    <div className="flex flex-col items-center justify-center h-96">
                      <div className="text-6xl mb-4">❌</div>
                      <h3 className="text-red-400 text-xl mb-2">Search Error</h3>
                      <p className="text-gray-400 text-center mb-4">{searchError}</p>
                      <button
                        onClick={() => handleSearch(searchTerm)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <SimpleGraph 
                      searchResults={searchResults}
                      searchTerm={searchTerm}
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 2, duration: 0.6, type: "spring" }}
      >
        <motion.button
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0.4)',
              '0 0 0 20px rgba(59, 130, 246, 0)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={isSearchMode ? handleBackToHome : () => {}}
        >
          {isSearchMode ? '🏠' : '🌟'}
        </motion.button>
      </motion.div>

      {/* Orbital Ring Animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative w-full h-full">
          <div className="absolute top-1/2 left-1/2 w-96 h-96 -mt-48 -ml-48 border border-blue-500/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 -mt-40 -ml-40 border border-purple-500/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 -mt-32 -ml-32 border border-cyan-500/15 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;