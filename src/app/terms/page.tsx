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
              Last updated: February 2026
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
          <p>
            SoundClash is a personal, non-commercial music guessing game that
            uses the Spotify Platform to enable music playback. The application
            requires a Spotify Premium account to function. SoundClash is not
            affiliated with, endorsed by, or sponsored by Spotify AB.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            3. Spotify Content and Platform
          </h2>
          <p>
            SoundClash uses the Spotify Platform (APIs and SDKs) to access music
            content. By using SoundClash, you agree that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You will not modify, create derivative works based on, or reverse
              engineer the Spotify Platform, Spotify Service, or any Spotify
              Content accessed through this application.
            </li>
            <li>
              You will not decompile, reverse-engineer, disassemble, or
              otherwise reduce the Spotify Platform, Spotify Service, or Spotify
              Content to source code or other human-perceivable form, to the
              full extent allowed by law.
            </li>
            <li>
              All music, album art, metadata, and other content accessed through
              Spotify remains the property of Spotify and its licensors. You may
              not copy, download, or redistribute any Spotify Content.
            </li>
          </ul>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            4. Developer Responsibility
          </h2>
          <p>
            SoundClash is developed and maintained by an independent developer.
            The developer is solely responsible for this application, including
            its functionality, content, and any issues arising from its use.
            Third parties (including Spotify) bear no responsibility or liability
            for SoundClash.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            5. Spotify as Third-Party Beneficiary
          </h2>
          <p>
            Spotify AB is a third-party beneficiary of these Terms of Service
            and the{" "}
            <Link href="/privacy" className="text-[var(--accent)] hover:underline">
              Privacy Policy
            </Link>
            , and is entitled to directly enforce these terms.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            6. Disclaimer of Warranties
          </h2>
          <p className="uppercase text-xs leading-relaxed text-[var(--text-muted)]">
            SoundClash is provided &quot;as is&quot; and &quot;as available&quot;
            without warranties of any kind, either express or implied. No
            warranties or representations are made on behalf of Spotify. All
            implied warranties with respect to the Spotify Platform, Spotify
            Service, and Spotify Content are expressly disclaimed, including the
            implied warranties of merchantability, fitness for a particular
            purpose, and non-infringement. The developer does not warrant that
            the application will be uninterrupted, error-free, or free of
            harmful components.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            7. Limitation of Liability
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
            8. Your Spotify Account
          </h2>
          <p>
            You are responsible for maintaining the security of your Spotify
            account. SoundClash accesses Spotify through your authenticated
            session and requires a valid Spotify Premium subscription. Your use
            of Spotify through this application remains subject to{" "}
            <a
              href="https://www.spotify.com/legal/end-user-agreement/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Spotify&apos;s Terms and Conditions of Use
            </a>
            .
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            9. Changes to These Terms
          </h2>
          <p>
            We may update these Terms of Service from time to time. Continued
            use of SoundClash after changes constitutes acceptance of the
            revised terms.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            10. Contact
          </h2>
          <p>
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
