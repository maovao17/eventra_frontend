"use client";

import { motion } from "framer-motion";
import TemplateCard from "@/components/customer/TemplateCard";

const templates = [
  { title: "Wedding", image: "/wedding.jpg", budget: "₹15L - ₹80L+" },
  { title: "Birthday", image: "/birthday.jpg", budget: "₹15k - ₹3L+" },
  { title: "Anniversary", image: "/anniversary.jpg", budget: "₹75k - ₹5L+" },
  { title: "Corporate", image: "/corporate.jpg", budget: "₹2L - ₹20L+" },
  { title: "Baby Shower", image: "/baby.jpg", budget: "₹40k - ₹2L+" },
  { title: "Gala Dinner", image: "/gala.jpg", budget: "₹15L - ₹80L+" }
];

export default function TemplatesPage() {
  return (
    <div className="max-w-7xl mx-auto px-10 py-16">

      <motion.h1
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        className="text-4xl font-bold text-center mb-10"
      >
        Your Event, Your Template
      </motion.h1>

      <div className="grid md:grid-cols-3 gap-8">
        {templates.map((t, i) => (
          <TemplateCard key={i} {...t}/>
        ))}
      </div>

    </div>
  );
}