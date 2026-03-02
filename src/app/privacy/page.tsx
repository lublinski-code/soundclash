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
              Last updated: February 2026
            </p>
          </header>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
              1. What is SoundClash
            </h2>
            <p className="text-[var(--text-secondary)]" style={{ fontSize: '14px', lineHeight: '1.7' }}>
              SoundClash is a personal, non-commercial music guessing game that
            uses the Spotify Platform to play audio snippets. It is developed as
            a hobby project and is not affiliated with, endorsed by, or
            sponsored by Spotify.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            2. Information We Access
          </h2>
          <p>
            When you connect your Spotify account, SoundClash requests access to
            the following data through the Spotify Platform:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong className="text-[var(--text-primary)]">Your profile information</strong>{" "}
              (display name, account type) &mdash; to show your name in the game
              and verify you have a Spotify Premium subscription.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Playback control</strong>{" "}
              &mdash; to play song snippets through the Spotify Web Playback
              SDK during gameplay.
            </li>
          </ul>
          <p>
            We do <strong className="text-[var(--text-primary)]">not</strong>{" "}
            access your playlists, listening history, saved tracks, followers,
            or email address.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            3. How We Use Your Information
          </h2>
          <p>The data accessed from Spotify is used solely to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Display your name in the game interface</li>
            <li>Verify your Spotify Premium subscription status</li>
            <li>Play music through the Spotify Web Playback SDK</li>
            <li>Search for tracks as part of the guessing mechanic</li>
          </ul>
          <p>
            We do not use your data for advertising, analytics, profiling, or
            any purpose other than operating the game.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            4. Data Storage
          </h2>
          <p>
            SoundClash runs entirely in your browser. There is no backend
            server. Your Spotify access token and refresh token are stored
            locally in your browser&apos;s localStorage and are never sent to
            any third-party server.
          </p>
          <p>
            Game data (teams, scores, song pools) exists only in browser memory
            during your session and is not persisted after you close the page.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            5. Data Sharing
          </h2>
          <p>
            We do not sell, transfer, or share any data obtained from Spotify
            with any third party, including ad networks, data brokers, or
            analytics services.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            6. Cookies
          </h2>
          <p>
            SoundClash does not use cookies. We use browser localStorage solely
            to store your Spotify authentication tokens. No third-party cookies
            are placed on your browser by this application.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            7. Disconnecting Your Account
          </h2>
          <p>
            You can disconnect your Spotify account from SoundClash at any time
            by clicking the &quot;Disconnect&quot; button on the home page. This
            immediately removes all Spotify tokens and data from your browser.
          </p>
          <p>
            You can also revoke SoundClash&apos;s access from your{" "}
            <a
              href="https://www.spotify.com/account/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Spotify account settings
            </a>
            .
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            8. Children&apos;s Privacy
          </h2>
          <p>
            SoundClash is not directed at children under 13. We do not knowingly
            collect data from children.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            reflected on this page with an updated date.
          </p>
        </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 className="font-bold text-[var(--text-primary)]" style={{ fontSize: '18px', lineHeight: '1.4' }}>
            10. Contact
          </h2>
          <p>
            If you have questions about this Privacy Policy or how your data is
            handled, you can reach the developer via the project&apos;s
            repository or contact information provided in the application.
          </p>
          </section>
        </article>
      </div>
    </main>
  );
}
