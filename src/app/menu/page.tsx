import { menu } from "@/lib/menu";
import { MenuView } from "@/lib/MenuView";

export default function MenuPage() {
  return (
    <main>
      <MenuView
        sections={[...menu].sort((a, b) => a.order - b.order)}
        quantities={{}}
        onAdd={() => {}}
        onRemove={() => {}}
      />
    </main>
  );
}
