import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ClientsMarquee } from "@/components/sections/ClientsMarquee";
import { SolutionsCarousel } from "@/components/sections/SolutionsCarousel";
import { VideoSection } from "@/components/sections/VideoSection";
import { Sectors } from "@/components/sections/Sectors";
import { Realisations } from "@/components/sections/Realisations";
import { Methodology } from "@/components/sections/Methodology";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <ClientsMarquee />
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
