"use client"

import { useEffect, useState } from "react"
import type { Order } from "./domain"

export function useKitchenQueue() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    let timer: number | null = null

    async function load() {
      try {
        const res = await fetch("/api/orders/kitchen", {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("HTTP " + res.status)
        }

        const data = await res.json()

        if (alive) {
          setOrders(data)
          setError(null)
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? "fetch failed")
        }
      }
    }

    load()
    timer = window.setInterval(load, 3000)

    return () => {
      alive = false
      if (timer !== null) {
        clearInterval(timer)
      }
    }
  }, [])

  return { orders, error }
}
