import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export default function Page() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero />
        <Features />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
