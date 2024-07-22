import { Items } from "../../repositories/items.js";
import { ResourceMap } from "../../repositories/resources.js";

export const DefaultBooks = () => [
  {
    name: 'Items',
    icon: ResourceMap.find('i:texture.book-2')?.resource.load,
    id: 'm',
    defaultBook: true,
    isItemsList: true,
    pages: [
      {
        "title": "All Items",
        "children": Items.all().map(item => (
          {
            type: "inventory-item",
            item: item.manifest.id,
            quantity: 0,
            link: item?.book ? item.manifest.id : null
          }
        ))
      }
    ]
  }
];