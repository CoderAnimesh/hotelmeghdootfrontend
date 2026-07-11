import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Loader = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            onComplete();
          }, 600);

          return 100;
        }

        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Separate words
  const titleWords = ["HOTEL", "MEGHDOOT"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const dividerVariants = {
    hidden: { width: "0%" },
    visible: {
      width: "60%",
      transition: {
        delay: 1.2,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-luxury-charcoal overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{
        y: "-100vh",
        transition: {
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1],
          delay: 0.2,
        },
      }}
    >
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-luxury-gold/5 blur-[120px] pointer-events-none" />

      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-luxury-gold/5 blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-lg px-4 text-center select-none">
        {/* Luxury Crest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <svg
            className="w-16 h-16 text-luxury-gold stroke-[0.5] fill-none"
            viewBox="0 0 100 100"
          >
            <path
              d="M50 15 L80 45 L50 75 L20 45 Z"
              stroke="currentColor"
              strokeWidth="1"
            />

            <path
              d="M50 25 L70 45 L50 65 L30 45 Z"
              stroke="currentColor"
              strokeWidth="0.75"
            />

            <circle
              cx="50"
              cy="45"
              r="4"
              className="fill-luxury-gold animate-pulse-slow"
            />
          </svg>
        </motion.div>

        {/* Animated Title */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif"
        >
          {titleWords.map((word, wordIndex) => (
            <div
              key={wordIndex}
              className="flex justify-center text-4xl md:text-6xl font-extrabold tracking-[0.25em]"
            >
              {word.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={dividerVariants}
          initial="hidden"
          animate="visible"
          className="h-[1px] bg-luxury-gold mt-6 mb-4"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="text-xs md:text-sm uppercase tracking-[0.4em] text-luxury-gold/70 font-sans font-light"
        >
          Elegance • Comfort • Peace
        </motion.p>

        {/* Loader */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-luxury-gold font-sans font-extralight tracking-widest text-lg"
        >
          <span className="text-sm">LUXURY ARRIVAL</span>

          <div className="text-3xl font-serif font-light text-luxury-gold-light mt-1">
            {percent}%
          </div>

          <div className="w-48 h-[2px] bg-luxury-dark/60 mt-3 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-luxury-gold via-luxury-gold-bright to-luxury-gold"
              style={{ width: `${percent}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Loader;