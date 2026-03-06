import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { FrontGallery } from '@/components/frontGallery';
import { Courses } from '@/components/courses';
import { CTA } from '@/components/cta';
import { Blog } from '@/components/blog';
import { Testimonials } from '@/components/testimonials';
import { FAQ } from '@/components/faq';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <FrontGallery />
      <Courses />
      <CTA />
      <Blog />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
