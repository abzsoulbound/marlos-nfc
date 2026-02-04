"use client";

type PageProps = {
  params: {
    nfcTagId: string;
  };
};

export default function ReviewPage({ params }: PageProps) {
  const { nfcTagId } = params;

  return (
    <main style={{ padding: 24 }}>
      <h1>Review order</h1>
      <p>Tag: {nfcTagId}</p>
      <p>Your basket is empty.</p>
    </main>
  );
}
