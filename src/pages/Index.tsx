
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import TopInfluencers from '@/components/TopInfluencers';
import FeaturedInfluencers from '@/components/FeaturedInfluencers';
import ExpressInfluencers from '@/components/ExpressInfluencers';
import BudgetInfluencers from '@/components/BudgetInfluencers';
import LongVideos from '@/components/LongVideos';
import CreatorSpecialties from '@/components/CreatorSpecialties';
import LanguageMarquee from '@/components/LanguageMarquee';
import LanguageBanner from '@/components/LanguageBanner';
import RecentReviews from '@/components/RecentReviews';
import ConnectWithCreator from '@/components/ConnectWithCreator';
import Footer from '@/components/Footer';
import NewlyJoinedCreators from '@/components/NewlyJoinedCreators';
import CountriesRepresented from '@/components/CountriesRepresented';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TopInfluencers />
        <FeaturedInfluencers />
        <ExpressInfluencers />
        <BudgetInfluencers />
        <LongVideos />
        <NewlyJoinedCreators />
        <CreatorSpecialties />
        <CountriesRepresented />
        <LanguageMarquee color="purple" />
        <LanguageBanner />
        <LanguageMarquee color="blue" />
        <RecentReviews />
        <ConnectWithCreator />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
