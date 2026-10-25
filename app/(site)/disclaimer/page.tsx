import Link from 'next/link';
export const metadata = { title: 'Medical disclaimer', description: 'Fuelwell provides general nutrition and fitness information, not medical advice. Read this before acting on any guide or calculator result.', alternates: { canonical: '/disclaimer' } };
export default function Disclaimer() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Medical disclaimer</h1>
      <div className="article mt-6">
        <p><strong>Fuelwell is for general information only.</strong> Nothing on this site is medical advice, diagnosis or treatment, and reading it does not create a doctor-patient or dietitian-client relationship.</p>
        <h2>Talk to a professional first</h2>
        <p>Speak to a qualified doctor or registered dietitian before you change your diet, start an exercise programme or use supplements, especially if you have a medical condition (such as diabetes, kidney, heart or thyroid disease), take medication, are pregnant or breastfeeding, have a history of disordered eating, or are under 18.</p>
        <h2>Calculator results are estimates</h2>
        <p>The <Link href="/protein-calculator">protein calculator</Link> gives a rough range for healthy adults. Your real needs may differ.</p>
        <h2>Stop and get help if needed</h2>
        <p>If you feel unwell, dizzy, or have pain while following any plan, stop and seek medical care. In an emergency, call your local emergency number.</p>
        <h2>No guarantees</h2>
        <p>Results vary from person to person. We make no promise about weight, muscle or health outcomes, and we are not responsible for decisions made using this content. Some pages may show advertising; ads are not endorsements.</p>
        <p>See also our <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.</p>
      </div>
    </div>
  );
}
