import fetch from "node-fetch"
import ThermalPrinter from "node-thermal-printer"
import PrinterTypes from "node-thermal-printer/dist/printer-types.js"

const API_BASE = "https://marloskitchen.co.uk" // change later if local
const POLL_MS = 3000

const PRINTERS = {
  BAR: "BAR_PRINTER",
  KITCHEN_A: "KITCHEN_PRINTER_A",
  KITCHEN_B: "KITCHEN_PRINTER_B",
}

async function poll() {
  const res = await fetch(`${API_BASE}/api/print/queue`)
  const jobs = await res.json()

  for (const job of jobs) {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: PRINTERS[job.target],
    })

    printer.println(`TABLE ${job.payload.table}`)
    printer.println("----------------")
    job.payload.items.forEach(i =>
      printer.println(`${i.qty}x ${i.name}`)
    )
    printer.cut()
    await printer.execute()

    await fetch(`${API_BASE}/api/print/ack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    })
  }
}

setInterval(poll, POLL_MS)
