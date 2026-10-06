import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function PublicLayout() {
  return (
    <div className="public-page relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
