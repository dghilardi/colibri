import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AddBookForm } from "@/components/admin/AddBookForm";

export default function AdminDashboard() {
  return (
    <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <section className="bg-white/5 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <AddBookForm />
        </section>
    </div>
  );
}
