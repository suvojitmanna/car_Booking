import Image from "next/image";
import Nav from "../components/Nav";
import PublicHome from "../components/PublicHome";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="w-full min-h-screen">
      <Nav/>
      <PublicHome/>
      <Footer/>
    </div>
  );
}
