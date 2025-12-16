"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignIn() {
  const [email, setEmail] = useState("");

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

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-secondary"
                required
              />
           </div>
           <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl">
             Sign In
           </Button>
        </form>
        <p className="text-xs text-gray-500">
            Internal Use Only. Access restricted to Comelit employees.
        </p>
      </div>
    </div>
  );
}
