import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import ProjectsSection from '../components/home/ProjectsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import TeamSection from '../components/home/TeamSection';

export default function Index() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProjectsSection />
        <FeaturesSection />
        <TeamSection />
      </main>
      <Footer />
    </>
  );
}
