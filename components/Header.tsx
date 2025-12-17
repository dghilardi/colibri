"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, LayoutDashboard, Heart, Library } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center bg-secondary text-white p-3 sm:p-4 rounded-2xl shadow-lg sticky top-0 z-50">
       <Link href="/" className="flex items-center gap-2">
           <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-xs sm:text-base">
               CO
           </div>
           <div>
               <h1 className="font-bold text-base sm:text-lg leading-tight">CO-LIBRÌ</h1>
               <p className="text-[10px] sm:text-xs text-neutral hidden sm:block">With You Always</p>
           </div>
       </Link>

       <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/">
            <Button size="icon" variant="ghost" className="text-white hover:text-primary h-8 w-8 sm:h-10 sm:w-10">
                <Library className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>

          <Link href="/wishlist">
            <Button size="icon" variant="ghost" className="text-white hover:text-primary h-8 w-8 sm:h-10 sm:w-10">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>

          {session?.user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button size="icon" variant="ghost" className="text-white hover:text-primary h-8 w-8 sm:h-10 sm:w-10">
                    <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
          )}

          <Button size="icon" variant="ghost" onClick={() => signOut()} className="text-white hover:text-red-400 h-8 w-8 sm:h-10 sm:w-10">
               <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {session?.user && (
              <div className="h-8 w-8 rounded-full bg-neutral text-secondary flex items-center justify-center font-bold text-xs ml-1">
                  {session.user.name?.slice(0, 2).toUpperCase() || "U"}
              </div>
          )}
       </div>
    </header>
  );
}
