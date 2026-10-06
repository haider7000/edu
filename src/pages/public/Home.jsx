import Hero from "../../components/home/Hero";
import FeaturedCourses from "../../components/home/FeaturedCourses";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import AILearning from "../../components/home/AILearning";
import LearningJourney from "../../components/home/LearningJourney";
import FAQ from "../../components/home/FAQ";
import FinalCTA from "../../components/home/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero */}
      <Hero />

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* AI Learning */}
      <AILearning />

      {/* Learning Journey */}
      <LearningJourney />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />

    </main>
  );
}