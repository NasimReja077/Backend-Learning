import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { authAPI } from "../../services/api";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await authAPI.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      toast.success("Registration successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white">
        <div className="w-full md:w-1/2 hidden md:block order-last">
          <img
            src="https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&auto=format&fit=crop&q=60"
            alt="Sign Up"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-700 text-center">Create an Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                {...register("fullName")}
                type="text"
                placeholder="Full Name"
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-3 rounded-lg font-semibold shadow-md hover:shadow-xl transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
            <p className="text-center text-gray-600 mt-4">
              Already have an account? <Link to="/login" className="text-blue-500 hover:underline font-semibold">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;