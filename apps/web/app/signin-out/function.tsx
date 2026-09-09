

"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Link from 'next/link';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export this so ANY other file can read/change the state
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default function SignInOut() {
 

const { isLoggedIn, setIsLoggedIn } = useAuth();
const handleLogOut = () => setIsLoggedIn(false);
return (
    

      <div className="flex justify-end">
        {/* Use the ternary operator to switch buttons */}
        {isLoggedIn ? (
          <button onClick={handleLogOut} style={btnStyle}>
            Sign Out
          </button>
        ) : (
          <Link
             href="/login"
             className="rounded-full bg-blue-600 px-6 py-2 text-white font-medium hover:bg-orange-400 transition duration-200"
          >
             Login
          </Link>
        )}
          
      </div>
    
  );
}


const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: '#f3f4f6',
  borderBottom: '1px solid #e5e7eb'
};

const btnStyle = {
  padding: '0.5rem 1rem',
  cursor: 'pointer',
};
