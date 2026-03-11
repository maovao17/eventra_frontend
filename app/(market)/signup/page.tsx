"use client";

import Image from "next/image";
import { useState } from "react";
import { validateSignup } from "@/lib/validation/authValidation";

export default function SignupPage() {
  const [role, setRole] = useState<"individual" | "business">("individual");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: Record<string, any> = {
      name,
      phone,
    };
    if (role === "business") formData.businessName = businessName;

    const validationErrors = validateSignup(formData);
    // Only keep errors that actually correspond to fields in the form
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // proceed with signup (e.g. call backend)
    console.log("signup data is valid", formData);
  };

  return (
    <div className="min-h-scree`n bg-[#F6EFEA] flex items-center justify-center relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-[#E87D5F] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-[#3C7D7B] rounded-full opacity-20 blur-3xl"></div>

      {/* Signup Card */}
      <div className="bg-white w-[420px] p-8 rounded-3xl shadow-xl relative z-10">

        <div className="flex flex-col items-center">
          <Image
            src="/logo.jpeg"
            alt="Eventra"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <h1 className="mt-3 text-center text-[#E87D5F] font-semibold text-lg">
            Eventra
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-center mt-2">
          Create Your Account
        </h2>

        <p className="text-center text-gray-500 text-sm mt-1">
          Join Eventra and start planning smarter.
        </p>

        {/* Role Switch */}
        <div className="flex bg-gray-100 rounded-full p-1 mt-6">
          <button
            onClick={() => setRole("individual")}
            className={`flex-1 py-2 rounded-full text-sm transition ${
              role === "individual"
                ? "bg-white shadow text-[#E87D5F]"
                : "text-gray-500"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setRole("business")}
            className={`flex-1 py-2 rounded-full text-sm transition ${
              role === "business"
                ? "bg-white shadow text-[#E87D5F]"
                : "text-gray-500"
            }`}
          >
            Business
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F] ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F] ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Business Name (Only if Business selected) */}
          {role === "business" && (
            <div>
              <label className="text-sm text-gray-600">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                className={`w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F] ${
                  errors.businessName ? "border-red-500" : ""
                }`}
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">{errors.businessName}</p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#E87D5F] text-white py-3 rounded-xl mt-2 hover:opacity-90 transition"
          >
            Continue →
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#E87D5F] font-medium">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}
