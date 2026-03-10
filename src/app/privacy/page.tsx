"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: '720px', padding: '48px 24px 64px' }}
      >
        <Link
          href="/"
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          style={{ fontSize: '14px', lineHeight: '1.5' }}
        >
          &larr; Back to Home
        </Link>

        <article style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <header>
            <h1 className="font-black text-[var(--text-primary)] tracking-tight" style={{ fontSize: '32px', lineHeight: '1.3' }}>
              Privacy Policy
            </h1>
            <p className="text-[var(--text-muted)]" style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6' }}>
              Last updated: March 2026
            </p>
          </header>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              1. What is SoundClash
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash is a personal, non-commercial music guessing game that
              uses the Deezer API and iTunes Search API to play 30-second audio
              previews. It is developed as a hobby project and is not affiliated
              with, endorsed by, or sponsored by Deezer or Apple.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              2. Information We Collect
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash does not require any login or account creation.
              We do not collect, store, or process any personal information.
              No authentication tokens, email addresses, or profile data are
              accessed or stored.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              3. How the App Works
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash uses the publicly available Deezer Search API to find
              music tracks and play 30-second preview clips. No API keys or user
              credentials are required for this functionality. Track search
              queries are sent to Deezer&apos;s servers to retrieve song data.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              4. Data Storage
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              Game data (teams, scores, song pools) exists only in browser memory
              during your session and is not persisted after you close the page.
              No data is stored on any server.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              5. Data Sharing
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              We do not sell, transfer, or share any data with any third party,
              including ad networks, data brokers, or analytics services.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              6. Cookies
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash does not use cookies or localStorage for tracking
              purposes. No third-party cookies are placed on your browser by
              this application.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              7. Children&apos;s Privacy
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash is not directed at children under 13. We do not knowingly
              collect data from children.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              8. Changes to This Policy
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              We may update this Privacy Policy from time to time. Changes will be
              reflected on this page with an updated date.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              9. Contact
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              If you have questions about this Privacy Policy, you can reach the
              developer via the project&apos;s repository or contact information
              provided in the application.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
