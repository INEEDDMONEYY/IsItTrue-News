import AdsBenefits from "../components/ads/AdsBenefits";
import AdsCta from "../components/ads/AdsCta";
import AdsFaq from "../components/ads/AdsFaq";
import AdsHero from "../components/ads/AdsHero";
import AdsHowItWorks from "../components/ads/AdsHowItWorks";
import AdsStandards from "../components/ads/AdsStandards";
import AdsWhatYouCanAdvertise from "../components/ads/AdsWhatYouCanAdvertise";
import AdsWhy from "../components/ads/AdsWhy";

export function AdsPage() {
  return (
    <main>
      <AdsHero />
      <AdsWhy />
      <AdsBenefits />
      <AdsHowItWorks />
      <AdsWhatYouCanAdvertise />
      <AdsStandards />
      <AdsFaq />
      <AdsCta />
    </main>
  );
}