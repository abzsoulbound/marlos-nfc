import MenuItem from "./MenuItem";

export default function ItemList({ sections }: any) {
  return (
    <div>
      {sections.map((section: any) => (
        <div key={section.id} id={`section-${section.id}`}>
          {section.items.map((item: any) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}
