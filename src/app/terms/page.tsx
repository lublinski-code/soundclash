"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-[var(--text-muted)]" style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6' }}>
              Last updated: March 2026
            </p>
          </header>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              1. Acceptance of Terms
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              By using SoundClash, you agree to these Terms of Service. If you do
              not agree, do not use the application.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              2. Description of Service
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash is a personal, non-commercial music guessing game that
              uses the Deezer API and iTunes Search API to play 30-second audio
              previews. No account or login is required. SoundClash is not
              affiliated with, endorsed by, or sponsored by Deezer or Apple.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              3. Music Content
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash uses publicly available APIs to access music previews
              and metadata. By using SoundClash, you agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              <li>
                All music, album art, and metadata accessed through the
                application remains the property of their respective rights
                holders. You may not copy, download, or redistribute any
                content.
              </li>
              <li>
                Audio previews are provided by third-party services (Deezer,
                iTunes) and are subject to their respective terms of service.
              </li>
            </ul>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              4. Developer Responsibility
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash is developed and maintained by an independent developer.
              The developer is solely responsible for this application, including
              its functionality, content, and any issues arising from its use.
              Third-party music providers bear no responsibility or liability
              for SoundClash.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              5. Disclaimer of Warranties
            </h2>
            <p className="uppercase text-xs leading-relaxed text-[var(--text-muted)]">
              SoundClash is provided &quot;as is&quot; and &quot;as available&quot;
              without warranties of any kind, either express or implied. The
              developer does not warrant that the application will be
              uninterrupted, error-free, or free of harmful components. Music
              availability depends on third-party APIs and may change without
              notice.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              6. Limitation of Liability
            </h2>
            <p className="uppercase text-xs leading-relaxed text-[var(--text-muted)]">
              To the maximum extent permitted by applicable law, the developer
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of data, use, or
              profits, arising out of or related to your use of SoundClash,
              regardless of the cause of action or the basis of the claim.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              7. Changes to These Terms
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              We may update these Terms of Service from time to time. Continued
              use of SoundClash after changes constitutes acceptance of the
              revised terms.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              8. Contact
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              For questions about these Terms of Service, contact the developer
              via the project&apos;s repository or contact information provided in
              the application.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
