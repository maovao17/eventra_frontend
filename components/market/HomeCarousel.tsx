"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/21st.jpg",
    title: "21st Birthday Celebration",
    description: "Plan unforgettable milestone celebrations with top vendors."
  },
  {
    image: "/roce.jpg",
    title: "Roce ceremony",
    description: "Plan a beautiful Goan Roce ceremony with experienced event vendors."
  },
  {
    image: "/baby.jpeg",
    title: "Baby Shower Events",
    description: "Find decorators, planners and photographers in one place."
  }
];

export default function HomeCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -400 : 400,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-[420px] rounded-3xl overflow-hidden shadow-2xl">

      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6 }}
          className="absolute w-full h-full"
        >
          <img
            src={slides[index].image}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Text content */}
          <div className="absolute bottom-10 left-10 text-white max-w-md">
            <h3 className="text-3xl font-bold mb-2">
              {slides[index].title}
            </h3>

            <p className="text-white/80">
              {slides[index].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur p-3 rounded-full hover:bg-white transition"
      >
        ‹
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur p-3 rounded-full hover:bg-white transition"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 w-full flex justify-center gap-3">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full cursor-pointer transition-all ${
              i === index
                ? "w-8 bg-white"
                : "w-3 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}