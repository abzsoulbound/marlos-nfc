export default function MenuLayout({
  children,
  label,
  interactive,
  reviewHref,
}: {
  children?: React.ReactNode;
  label: string;
  interactive?: boolean;
  reviewHref?: string;
}) {
  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1>{label}</h1>
        {interactive && reviewHref && (
          <a href={reviewHref}>Review order</a>
        )}
      </header>
      {children}
    </main>
  );
}
