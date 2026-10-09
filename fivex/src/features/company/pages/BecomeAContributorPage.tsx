import ContributorBenefits from "../components/contributor/ContributorBenefits";
import ContributorCta from "../components/contributor/ContributorCta";
import ContributorFaq from "../components/contributor/ContributorFaq";
import ContributorHero from "../components/contributor/ContributorHero";
import ContributorHowItWorks from "../components/contributor/ContributorHowItWorks";
import ContributorStandards from "../components/contributor/ContributorStandards";
import ContributorWhatYouCanContribute from "../components/contributor/ContributorWhatYouCanContribute";
import ContributorWhy from "../components/contributor/ContributorWhy";

export function BecomeAContributorPage() {
  return (
    <main>
      <ContributorHero />
      <ContributorWhy />
      <ContributorBenefits />
      <ContributorHowItWorks />
      <ContributorWhatYouCanContribute />
      <ContributorStandards />
      <ContributorFaq />
      <ContributorCta />
    </main>
  );
}