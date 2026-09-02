import Image from "next/image";
import Nav from "../components/Nav";
import PublicHome from "../components/PublicHome";
import Footer from "../components/Footer";
import { auth } from "../auth";
import PartnerDashboard from "../components/PartnerDashboard";
import AdminDashboard from "../components/AdminDashboard";

export default async function Home() {
  const session = await auth();
  return (
    <div className="w-full min-h-screen">
      {session?.user?.role == "partner" ? (
        <>
          <Nav />
          <PartnerDashboard />
        </>
      ) : session?.user?.role == "admin" ? (
        <>
          <AdminDashboard />
        </>
      ) : (
        <>
          <Nav />
          <PublicHome />
        </>
      )}

      <Footer />
    </div>
  );
}
