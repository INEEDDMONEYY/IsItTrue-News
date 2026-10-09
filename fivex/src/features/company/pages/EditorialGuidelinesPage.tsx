import EditorialGuidelinesConflicts from "../components/editorial/EditorialGuidelinesConflicts";
import EditorialGuidelinesCorrections from "../components/editorial/EditorialGuidelinesCorrections";
import EditorialGuidelinesCta from "../components/editorial/EditorialGuidelinesCta";
import EditorialGuidelinesFaq from "../components/editorial/EditorialGuidelinesFaq";
import EditorialGuidelinesHero from "../components/editorial/EditorialGuidelinesHero";
import EditorialGuidelinesHowItWorks from "../components/editorial/EditorialGuidelinesHowItWorks";
import EditorialGuidelinesPrinciples from "../components/editorial/EditorialGuidelinesPrinciples";
import EditorialGuidelinesSources from "../components/editorial/EditorialGuidelinesSources";
import EditorialGuidelinesVerification from "../components/editorial/EditorialGuidelinesVerification";
import EditorialGuidelinesWhy from "../components/editorial/EditorialGuidelinesWhy";

export function EditorialGuidelinesPage() {
  return (
    <main>
      <EditorialGuidelinesHero />
      <EditorialGuidelinesWhy />
      <EditorialGuidelinesPrinciples />
      <EditorialGuidelinesVerification />
      <EditorialGuidelinesSources />
      <EditorialGuidelinesCorrections />
      <EditorialGuidelinesConflicts />
      <EditorialGuidelinesHowItWorks />
      <EditorialGuidelinesFaq />
      <EditorialGuidelinesCta />
    </main>
  );
}