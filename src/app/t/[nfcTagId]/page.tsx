import { redirect } from "next/navigation"

type PageProps = {
  params: {
    nfcTagId: string
  }
}

export default async function NFCTablePage({ params }: PageProps) {
  const tableId = params.nfcTagId

  if (!tableId) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Invalid table</h1>
      </main>
    )
  }

  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/orders/deliver`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableId }),
      cache: "no-store",
    }
  )

  redirect(`/menu/${tableId}`)
}
