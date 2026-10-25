import ContactForm from './ContactForm';
export const metadata = { title: 'Contact us', description: 'Send us a question, feedback or a partnership request.', alternates: { canonical: '/contact' } };
export default function Contact() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-12">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Contact us</h1>
      <p className="mb-8 mt-3 font-body text-xl text-ink/75">Ask a question, suggest a topic or tell us what to fix. We read every message.</p>
      <ContactForm />
    </div>
  );
}
