"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, LayoutDashboard, Heart, Library } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center bg-secondary text-white p-4 rounded-2xl shadow-lg">
       <Link href="/" className="flex items-center gap-2">
           <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
               CO
           </div>
           <div>
               <h1 className="font-bold text-lg">CO-LIBRÌ</h1>
               <p className="text-xs text-neutral">With You Always</p>
           </div>
       </Link>

       <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="icon" variant="ghost" className="text-white hover:text-primary">
                <Library className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/wishlist">
            <Button size="icon" variant="ghost" className="text-white hover:text-primary">
                <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {session?.user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button size="icon" variant="ghost" className="text-white hover:text-primary">
                    <LayoutDashboard className="h-5 w-5" />
                </Button>
              </Link>
          )}

          <Button size="icon" variant="ghost" onClick={() => signOut()} className="text-white hover:text-red-400">
               <LogOut className="h-5 w-5" />
          </Button>

          {session?.user && (
              <div className="h-8 w-8 rounded-full bg-neutral text-secondary flex items-center justify-center font-bold text-xs">
                  {session.user.name?.slice(0, 2).toUpperCase() || "U"}
              </div>
          )}
       </div>
    </header>
  );
}
