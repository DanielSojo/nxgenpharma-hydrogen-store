'use client';

/**
 * Last-resort boundary: catches errors thrown by the root layout itself, where
 * no app chrome (or CSS) is guaranteed to be available. Styles stay inline for
 * that reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f7fcfc',
          color: '#173252',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1d6d', marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(23,50,82,0.7)', marginBottom: 28 }}>
            We hit an unexpected error. Please try again, or email support@nxgenpharma.com if it
            keeps happening.
          </p>
          <button
            onClick={reset}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(120deg, #1a1d6d 0%, #3e97da 55%, #49c3c8 100%)',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: 28, fontSize: 11, color: 'rgba(23,50,82,0.35)' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
