import { Header } from "@/components/Header";
import { BookList } from "@/components/BookList";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col p-4 gap-4 pb-20">
      <Header />
      <div className="flex-1">
          <BookList />
      </div>
    </main>
  );
}
