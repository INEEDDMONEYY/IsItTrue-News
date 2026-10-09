import AuthorBenefits from "../components/author/AuthorBenefits";
import AuthorCta from "../components/author/AuthorCta";
import AuthorFaq from "../components/author/AuthorFaq";
import AuthorHero from "../components/author/AuthorHero";
import AuthorHowItWorks from "../components/author/AuthorHowItWorks";
import AuthorStandards from "../components/author/AuthorStandards";
import AuthorWhatYouCanPublish from "../components/author/AuthorWhatYouCanPublish";
import AuthorWhy from "../components/author/AuthorWhy";

export function BecomeAnAuthorPage() {
  return (
    <main>
      <AuthorHero />
      <AuthorWhy />
      <AuthorBenefits />
      <AuthorHowItWorks />
      <AuthorWhatYouCanPublish />
      <AuthorStandards />
      <AuthorFaq />
      <AuthorCta />
    </main>
  );
}