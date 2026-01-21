import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import getellLogo from '../assets/GETELL.webp';
import tkLogo from '../assets/TK_Connection.webp';
import jinlanniuLogo from '../assets/Asset 28.svg';
import jamesWang from '../assets/Ảnh sếp/James_Wang.webp';
import GouHuaDe from '../assets/Ảnh sếp/Gou_HuaDe.webp';

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const leaders = [
        {
            name: 'James Wang',
            image: jamesWang,
            messageEN: 'Thank you for your dedication and hard work!',
            messageCN: '感谢您的奉献和辛勤工作！',
        },
        {
            name: 'Gou HuaDe',
            image: GouHuaDe, // Placeholder cho sếp thứ 2
            messageEN: 'Your efforts make our company stronger!',
            messageCN: '您的努力使我们的公司更强大！',
        },
    ];

    // Auto-play slider mỗi 10 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % leaders.length);
        }, 20000);

        return () => clearInterval(interval);
    }, [leaders.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % leaders.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + leaders.length) % leaders.length);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
            {/* Header với 3 Logo */}
            <header className="pt-8 pb-6">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
                        {/* Logo TK_connection - Trái */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center p-4 hover:scale-105 transition-transform"
                        >
                            <img src={tkLogo} alt="TK Connection" className="w-full h-full object-contain" />
                        </motion.div>

                        {/* Logo GETELL - Giữa */}
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl shadow-2xl flex items-center justify-center p-4 transform scale-110 hover:scale-125 transition-transform"
                        >
                            <img src={getellLogo} alt="GETELL" className="w-full h-full object-contain" />
                        </motion.div>

                        {/* Logo Jinlanniu - Phải */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center p-4 hover:scale-105 transition-transform"
                        >
                            <img src={jinlanniuLogo} alt="Jinlanniu Blue Bull" className="w-full h-full object-contain" />
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        GETELL YEP GAMES
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 drop-shadow">
                        Welcome to the Company Game Center 🎮
                    </p>
                </motion.div>

                {/* Game Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {/* Vòng Quay May Mắn */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/lucky-wheel">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 h-full cursor-pointer hover:shadow-3xl transition-all">
                                <div className="text-6xl mb-4 text-center">🎡</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                                    Lucky Wheel
                                </h2>
                                <p className="text-gray-600 text-center">
                                    Spin the wheel and find the lucky winner!
                                </p>
                                <div className="mt-6 text-center">
                                    <span className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-semibold">
                                        Play Now →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Lô Tô */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/bingo">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 h-full cursor-pointer hover:shadow-3xl transition-all">
                                <div className="text-6xl mb-4 text-center">🎲</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                                    Bingo Game
                                </h2>
                                <p className="text-gray-600 text-center">
                                    Traditional Vietnamese bingo game!
                                </p>
                                <div className="mt-6 text-center">
                                    <span className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold">
                                        Play Now →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Chấm Điểm */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/scoring">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 h-full cursor-pointer hover:shadow-3xl transition-all">
                                <div className="text-6xl mb-4 text-center">🎭</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                                    Performance Scoring
                                </h2>
                                <p className="text-gray-600 text-center">
                                    Score performances and see rankings!
                                </p>
                                <div className="mt-6 text-center">
                                    <span className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-semibold">
                                        Score Now →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Dresscode Vote */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/dresscode/create">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 h-full cursor-pointer hover:shadow-3xl transition-all">
                                <div className="text-6xl mb-4 text-center">👗</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                                    Dresscode Vote
                                </h2>
                                <p className="text-gray-600 text-center">
                                    Vote for the best dresscode today!
                                </p>
                                <div className="mt-6 text-center">
                                    <span className="inline-block px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold">
                                        Vote Now →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Coming Soon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <p className="text-white/80 text-lg">
                        More exciting games coming soon...
                    </p>
                </motion.div>
            </main>

            {/* Leaders Slider */}
            <section className="container mx-auto px-4 py-12 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto"
                >

                    <div className="relative">
                        {/* Slider Content */}
                        <div className="overflow-hidden">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col md:flex-row items-center gap-8"
                            >
                                {/* Image */}
                                <div className="w-48 h-48 flex-shrink-0">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-2xl">
                                        <img
                                            src={leaders[currentSlide].image}
                                            alt={leaders[currentSlide].name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 text-center">
                                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                                        Messages from Bosses and Leaders
                                    </h2>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {leaders[currentSlide].name}
                                    </h3>
                                    <div className="space-y-3">
                                        <p className="text-white/90 text-lg italic">
                                            "{leaders[currentSlide].messageEN}"
                                        </p>
                                        <p className="text-white/90 text-lg italic">
                                            "{leaders[currentSlide].messageCN}"
                                        </p>
                                    </div>
                                    {/* Navigation Buttons */}
                                    <div className="flex justify-center items-center gap-4 mt-8">
                                        <button
                                            onClick={prevSlide}
                                            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                                        >
                                            ←
                                        </button>

                                        {/* Dots */}
                                        <div className="flex gap-2">
                                            {leaders.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentSlide(index)}
                                                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                                                        ? 'bg-white w-8'
                                                        : 'bg-white/40 hover:bg-white/60'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={nextSlide}
                                            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                        </div>


                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 text-white/70">
                <p>Game made by TON TRAN © 2026</p>
            </footer>
        </div>
    );
};

export default HomePage;
