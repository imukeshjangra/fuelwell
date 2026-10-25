export const metadata = { title: 'Terms and medical disclaimer', description: 'Terms of use and medical disclaimer for Fuelwell.', alternates: { canonical: '/terms' } };
export default function Terms() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12">
      <h1 className="text-4xl font-extrabold">Terms and medical disclaimer</h1>
      <div className="article mt-6">
        <h2>Medical disclaimer</h2>
        <p>Fuelwell provides general information about nutrition, weight management and exercise. It is not medical advice and does not create a doctor-patient relationship. Always consult a qualified doctor or registered dietitian before changing your diet or exercise routine, especially if you have a medical condition, are pregnant or are under 18.</p>
        <h2>Calculator estimates</h2>
        <p>The protein calculator gives estimates for healthy adults. Your real needs may differ.</p>
        <h2>Use of content</h2>
        <p>Articles and tools on this site are for personal use. Please do not copy or republish them without permission.</p>
        <h2>Changes</h2>
        <p>We may update these terms and the content of the site at any time.</p>
      </div>
    </div>
  );
}
