import OrganizationBenefits from "../components/organization/OrganizationBenefits";
import OrganizationCta from "../components/organization/OrganizationCta";
import OrganizationFaq from "../components/organization/OrganizationFaq";
import OrganizationHero from "../components/organization/OrganizationHero";
import OrganizationHowItWorks from "../components/organization/OrganizationHowItWorks";
import OrganizationPlans from "../components/organization/OrganizationPlans";
import OrganizationSeats from "../components/organization/OrganizationSeats";
import OrganizationWhy from "../components/organization/OrganizationWhy";

export function OrganizationsPage() {
  return (
    <main>
      <OrganizationHero />
      <OrganizationWhy />
      <OrganizationPlans />
      <OrganizationSeats />
      <OrganizationBenefits />
      <OrganizationHowItWorks />
      <OrganizationFaq />
      <OrganizationCta />
    </main>
  );
}