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

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy Policy | CloutKart';
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
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Last updated: {UPDATED_AT}. This policy explains how CloutKart and its
            internal outreach tool, slid, collect, use, and protect information.
          </p>
        </header>

        <div className="space-y-6">
          <Section title="Overview">
            <p>
              CloutKart provides creative advertising services and internal tools
              for managing client and prospect workflows. slid is a private
              CloutKart outreach workflow tool used by authorized team members to
              track contacts, replies, meetings, notes, and follow-up tasks.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>
              We may collect contact details submitted through our website, account
              information provided during sign-in, creative brief details, campaign
              messages, uploaded assets, payment-related records, and operational
              data needed to provide CloutKart services.
            </p>
            <p>
              In slid, we may store outreach contacts, companies, stages, notes,
              messages that users log, meeting times, tasks, templates, and
              AI-assisted summaries or draft suggestions.
            </p>
          </Section>

          <Section title="Google User Data">
            <p>
              If an authorized user connects Google services to slid, the app may
              request Gmail read-only access and Google Calendar event access. Gmail
              access is used only to detect and log inbound replies related to
              outreach threads on that user&apos;s board. Calendar access is used
              only when the user explicitly confirms a meeting event from within
              the app.
            </p>
            <p>
              slid does not send email, modify Gmail messages, delete messages,
              scrape unrelated mailbox data, or use Google user data for
              advertising. CloutKart does not sell Google user data or share it
              with third parties except as necessary to provide the app, comply
              with law, or protect the service.
            </p>
            <p>
              CloutKart&apos;s use and transfer of information received from Google
              APIs follows the Google API Services User Data Policy, including the
              Limited Use requirements.
            </p>
          </Section>

          <Section title="How We Use Information">
            <p>
              We use information to provide services, respond to inquiries,
              operate dashboards, deliver creatives, communicate with clients,
              manage outreach workflows, detect and log replies, schedule confirmed
              meetings, generate optional AI suggestions, maintain security, and
              troubleshoot the service.
            </p>
          </Section>

          <Section title="Storage and Security">
            <p>
              We use reasonable administrative, technical, and organizational
              safeguards to protect information. slid stores application data in a
              PostgreSQL database with row-level security, and Google OAuth tokens
              are encrypted before storage.
            </p>
          </Section>

          <Section title="Your Choices">
            <p>
              You may contact us to request access, correction, or deletion of
              personal information where legally available. Users may revoke
              CloutKart or slid access to Google services at any time from their
              Google Account permissions page.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For privacy questions, contact us at{' '}
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
