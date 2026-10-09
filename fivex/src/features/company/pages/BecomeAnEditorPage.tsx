import EditorBenefits from "../components/editor/EditorBenefits";
import EditorCta from "../components/editor/EditorCta";
import EditorFaq from "../components/editor/EditorFaq";
import EditorHero from "../components/editor/EditorHero";
import EditorHowItWorks from "../components/editor/EditorHowItWorks";
import EditorStandards from "../components/editor/EditorStandards";
import EditorWhatYouCanDo from "../components/editor/EditorWhatYouCanDo";
import EditorWhy from "../components/editor/EditorWhy";

export function BecomeAnEditorPage() {
  return (
    <main>
      <EditorHero />
      <EditorWhy />
      <EditorBenefits />
      <EditorHowItWorks />
      <EditorWhatYouCanDo />
      <EditorStandards />
      <EditorFaq />
      <EditorCta />
    </main>
  );
}