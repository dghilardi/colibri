"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Using credentials provider for dev.
    await signIn("credentials", {
      email,
      callbackUrl: "/",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 text-white">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex justify-center">
             <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white">
                 CO
             </div>
        </div>
        <h1 className="text-3xl font-bold">CO-LIBRÌ</h1>
        <p className="text-gray-400">With You Always</p>

        {mounted ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white text-secondary"
                    required
                    suppressHydrationWarning
                  />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl">
                Sign In
              </Button>
            </form>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-secondary px-2 text-gray-400">Or continue with</span>
                </div>
            </div>

            <Button 
                type="button" 
                variant="outline" 
                className="w-full text-black bg-white hover:bg-gray-100 rounded-2xl"
                onClick={() => signIn("comelit", { callbackUrl: "/" })}
            >
                Login with Comelit
            </Button>

            <Button 
                type="button" 
                variant="outline" 
                className="w-full text-black bg-white hover:bg-gray-100 rounded-2xl mt-2"
                onClick={() => signIn("google", { callbackUrl: "/" })}
            >
                Login with Google
            </Button>
          </>
        ) : (
          <div className="space-y-4 h-[200px] flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        <p className="text-xs text-gray-500">
            Internal Use Only. Access restricted to Comelit employees.
        </p>
      </div>
    </div>
  );
}
