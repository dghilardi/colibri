import { Header } from "@/components/Header";
import { WishlistManager } from "@/components/WishlistManager";

export default function WishlistPage() {
  return (
    <main className="flex-1 flex flex-col p-4 gap-4 pb-20">
      <Header />
      <div className="flex-1">
          <WishlistManager />
      </div>
    </main>
  );
}
