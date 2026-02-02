// src/app/menu/page.tsx
import { menu } from "@/lib/menu";
import Link from "next/link";

export default function MenuPage() {
  return (
    <main>
      {menu
        .sort((a, b) => a.order - b.order)
        .map(section => (
          <section key={section.id}>
            <h2>{section.title}</h2>

            {section.items.map(item => (
              <div key={item.id}>
                <strong>{item.name}</strong> — £{item.price.toFixed(2)}
                {item.description && <p>{item.description}</p>}

                <Link href={`/basket?add=${item.id}`}>
                  Add
                </Link>
              </div>
            ))}
          </section>
        ))}
    </main>
  );
}
