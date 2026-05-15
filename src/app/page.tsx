import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ClientsMarquee } from "@/components/sections/ClientsMarquee";
import { Proposition } from "@/components/sections/Proposition";
import { SolutionsCarousel } from "@/components/sections/SolutionsCarousel";
import { VideoSection } from "@/components/sections/VideoSection";
import { Sectors } from "@/components/sections/Sectors";
import { Realisations } from "@/components/sections/Realisations";
import { Methodology } from "@/components/sections/Methodology";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <ClientsMarquee />
        <Proposition />
        <SolutionsCarousel />
        <VideoSection />
        <Sectors />
        <Realisations />
        <Methodology />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
