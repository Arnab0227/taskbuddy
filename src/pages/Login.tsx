import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";
import { FcGoogle } from "react-icons/fc";
import { LuClipboardList } from "react-icons/lu";
import View from "../../public/view.png";
import "../index.css";

const Login: React.FC = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FFF9F9] flex flex-col md:flex-row">
      <div className="flex items-center justify-center min-h-screen md:w-1/2">
        <div className="w-full max-w-md md:ml-10">
          <div className="flex items-center space-x-2 justify-center md:justify-start text-[#7B1984] mb-5">
            <div className="text-3xl font-semibold">
              <LuClipboardList />
            </div>
            <h1 className="text-3xl font-semibold">TaskBuddy</h1>
          </div>
          <p className="text-sm text-center md:text-left mx-auto md:mx-0 mb-10">
            Streamline your workflow and track progress effortlessly
            <br /> with our all-in-one task management app.
          </p>
          <div className="flex justify-center md:justify-start ">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-72 h-12 md:w-96 md:h-16 space-x-3 rounded-2xl bg-black text-white"
            >
              <FcGoogle className="text-2xl md:text-4xl" />
              <span className="text-lg font-medium md:text-xl">
                Continue with Google
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 relative bg-no-repeat bg-cover circle">
        <div className="absolute inset-0 flex justify-end items-center">
          <img
            src={View}
            alt="TaskBuddy App"
            className="md:w-[480px] lg:w-[600px] h-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
