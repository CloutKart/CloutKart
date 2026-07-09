import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeFX from '../components/ThemeFX';
import CursorGlow from '../components/CursorGlow';

const UPDATED_AT = 'July 9, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-3xl p-6 sm:p-8">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink mb-4">{title}</h2>
      <div className="space-y-4 text-sm sm:text-base leading-relaxed text-ink-body">{children}</div>
    </section>
  );
}

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms of Service | CloutKart';
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <CursorGlow />
      <div className="noise-overlay" />
      <ThemeFX />
      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-strong)' }}
        >
          <ArrowLeft size={14} />
          Back to CloutKart
        </Link>

        <header className="mb-10">
          <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-ink-dim">
            CloutKart legal
          </p>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-6xl">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Last updated: {UPDATED_AT}. These terms govern use of CloutKart
            services and internal tools, including slid.
          </p>
        </header>

        <div className="space-y-6">
          <Section title="Agreement">
            <p>
              By using CloutKart services, websites, dashboards, or internal tools,
              you agree to use them only for lawful, authorized purposes and in
              accordance with these Terms.
            </p>
          </Section>

          <Section title="Services">
            <p>
              CloutKart provides creative advertising services, campaign assets,
              client dashboards, communication tools, and related business
              workflows. slid is an internal outreach workflow tool used by
              authorized CloutKart team members.
            </p>
          </Section>

          <Section title="Accounts and Access">
            <p>
              You are responsible for keeping your account credentials secure and
              for all activity performed through your account. CloutKart may
              restrict, suspend, or revoke access to protect users, clients, data,
              or the service.
            </p>
          </Section>

          <Section title="Acceptable Use">
            <p>
              You may not use CloutKart services to send spam, violate third-party
              platform terms, access data you are not authorized to view, disrupt
              the service, reverse engineer protected systems, upload unlawful
              content, or use the service for illegal activity.
            </p>
          </Section>

          <Section title="Google Services">
            <p>
              If an authorized user connects Google services to slid, the approved
              permissions are used only for the features described in the app and
              Privacy Policy. Gmail access is read-only and used to detect or log
              relevant inbound replies. Calendar access is used only to create
              meeting events that the user confirms. slid does not send email on
              a user&apos;s behalf.
            </p>
          </Section>

          <Section title="AI Suggestions">
            <p>
              CloutKart products may provide AI-assisted summaries, draft replies,
              classifications, creative directions, or task suggestions. These
              outputs are suggestions only and should be reviewed before use.
            </p>
          </Section>

          <Section title="Availability and Changes">
            <p>
              We may update, suspend, or discontinue parts of the service. We may
              also update these Terms as our services, security requirements, or
              legal obligations evolve.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For questions about these Terms, contact us at{' '}
              <a className="text-accent-ink underline underline-offset-4" href="mailto:shivam@clout-kart.com">
                shivam@clout-kart.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
