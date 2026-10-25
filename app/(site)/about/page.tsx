import Link from 'next/link';
export const metadata = { title: 'About us', description: 'Who we are and how we write our weight loss, weight gain and nutrition guides.', alternates: { canonical: '/about' } };
export default function About() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12">
      <h1 className="text-4xl font-extrabold sm:text-5xl">About Fuelwell</h1>
      <div className="article mt-6">
        <p>Fuelwell is a health and fitness blog about two goals people ask us about most: losing weight and gaining weight in a healthy way.</p>
        <h2>What we publish</h2>
        <p>Plain-language guides on food, protein, calories and training, plus tools such as our free <Link href="/protein-calculator">protein calculator</Link>.</p>
        <h2>How we write</h2>
        <p>We focus on habits that people can keep for months. We avoid extreme diets, miracle claims and fear. Replace this section with your own story, team and credentials, since readers and search engines trust real authors.</p>
        <h2>A note on medical advice</h2>
        <p>Our content is for general information and is not a substitute for advice from a doctor or registered dietitian. Please talk to a professional before making big changes, especially if you have a medical condition.</p>
        <p>Questions or ideas? <Link href="/contact">Contact us</Link>.</p>
      </div>
    </div>
  );
}
