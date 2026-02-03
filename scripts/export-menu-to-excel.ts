import ExcelJS from "exceljs";
import { menu } from "../src/lib/menu";

type MenuItem = {
  id?: string;
  name: string;
  description?: string;
  price?: number | string;
};

type MenuSection = {
  id?: string;
  title: string;
  items: MenuItem[];
};

function toNumberPrice(p: unknown): number | null {
  if (p === null || p === undefined) return null;
  if (typeof p === "number") return Number.isFinite(p) ? p : null;
  const s = String(p).trim();
  if (!s) return null;
  // accept "£12.50", "12.50", "12"
  const cleaned = s.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const data = menu as unknown as MenuSection[];

  const wb = new ExcelJS.Workbook();
  wb.creator = "Marlo's Export Script";
  wb.created = new Date();

  const ws = wb.addWorksheet("Menu", {
    properties: { defaultRowHeight: 18 },
    views: [{ state: "frozen", ySplit: 3 }],
  });

  ws.columns = [
    { header: "Section", key: "section", width: 22 },
    { header: "Item", key: "item", width: 28 },
    { header: "Description", key: "description", width: 60 },
    { header: "Price (£)", key: "price", width: 12 },
  ];

  // Title
  ws.mergeCells("A1:D1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "Marlo’s Brasserie — Menu";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(1).height = 28;

  // Subheader (date/time)
  ws.mergeCells("A2:D2");
  const sub = ws.getCell("A2");
  sub.value = `Exported: ${new Date().toLocaleString()}`;
  sub.font = { italic: true, color: { argb: "FF666666" } };
  sub.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(2).height = 18;

  // Column headers
  const headerRow = ws.getRow(3);
  headerRow.values = ["Section", "Item", "Description", "Price (£)"];
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" }, // dark slate
  };
  headerRow.height = 20;

  // Borders for header
  ["A3", "B3", "C3", "D3"].forEach((addr) => {
    ws.getCell(addr).border = {
      top: { style: "thin", color: { argb: "FF111827" } },
      left: { style: "thin", color: { argb: "FF111827" } },
      bottom: { style: "thin", color: { argb: "FF111827" } },
      right: { style: "thin", color: { argb: "FF111827" } },
    };
  });

  let r = 4;

  for (const section of data) {
    // Section banner row
    ws.mergeCells(`A${r}:D${r}`);
    const secCell = ws.getCell(`A${r}`);
    secCell.value = section.title;
    secCell.font = { bold: true, size: 12, color: { argb: "FF111827" } };
    secCell.alignment = { vertical: "middle", horizontal: "left" };
    secCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" }, // light gray
    };
    ws.getRow(r).height = 20;

    // bottom border for section row
    ws.getCell(`A${r}`).border = {
      bottom: { style: "thin", color: { argb: "FF9CA3AF" } },
    };

    r++;

    // Items
    for (const item of section.items || []) {
      const desc = (item.description || "").trim();
      const priceNum = toNumberPrice(item.price);

      ws.getCell(`A${r}`).value = section.title;
      ws.getCell(`B${r}`).value = item.name;
      ws.getCell(`C${r}`).value = desc ? desc : "";

      const priceCell = ws.getCell(`D${r}`);
      if (priceNum === null) {
        priceCell.value = "";
      } else {
        priceCell.value = priceNum;
        priceCell.numFmt = '£#,##0.00';
      }

      // alignment + wrap
      ws.getCell(`A${r}`).alignment = { vertical: "top", horizontal: "left" };
      ws.getCell(`B${r}`).alignment = { vertical: "top", horizontal: "left" };
      ws.getCell(`C${r}`).alignment = { vertical: "top", horizontal: "left", wrapText: true };
      ws.getCell(`D${r}`).alignment = { vertical: "top", horizontal: "right" };

      // light row borders
      ["A", "B", "C", "D"].forEach((col) => {
        ws.getCell(`${col}${r}`).border = {
          bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
        };
      });

      // row height based on description length
      const approxLines = desc ? Math.min(6, Math.ceil(desc.length / 55)) : 1;
      ws.getRow(r).height = 16 * approxLines;

      r++;
    }

    // spacer row
    ws.getRow(r).height = 8;
    r++;
  }

  // Auto-filter on headers
  ws.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: 4 },
  };

  // Output file
  const out = "Marlos-Menu.xlsx";
  await wb.xlsx.writeFile(out);
  console.log(`Saved: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
