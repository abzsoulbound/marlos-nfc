// menu.tsx
// Authoritative static menu definition for Marlo’s Brasserie.
// This file mirrors the physical menu exactly.
// No runtime logic. No derived values. No inferred allergens.
// Any edit here is an intentional menu change.

export type AllergenKey =
  | "celery"
  | "glutens" // plain-language term used instead of regulatory phrasing
  | "crustaceans"
  | "eggs"
  | "fish"
  | "lupin"
  | "milk"
  | "molluscs"
  | "mustard"
  | "nuts"
  | "peanuts"
  | "sesame_seeds"
  | "soya"
  | "sulphur_dioxide";

/**
 * Allergens convention:
 * - null  => unknown / not confirmed
 * - []    => confirmed allergen-free
 * - [...] => contains listed allergens
 */
export interface MenuItem {
  id: string; // stable canonical ID (do not change once live)
  name: string; // display name shown to customers
  price: number; // GBP
  description?: string;

  allergens: AllergenKey[] | null;

  vegetarian?: boolean;
  vegan?: boolean;

  // Reserved for future expansion (variants / availability)
  variantGroupId?: string;
  availableFrom?: string;
  availableUntil?: string;
  daysAvailable?: number[];
}

export interface MenuSection {
  id: string;     // internal section identifier
  title: string;  // UI-facing section title
  order: number;  // explicit ordering (do not rely on array index)
  items: MenuItem[];
}

export type Menu = MenuSection[];

// -----------------------------------------------------------------------------
// MENU DATA
// -----------------------------------------------------------------------------

export const menu: Menu = [
  {
    id: "brunch",
    title: "Brunch",
    order: 1,
    items: [
      {
        id: "las-vegas-breakfast",
        name: "Las Vegas Breakfast",
        price: 13.95,
        description:
          "Two slices of bacon, hash browns, fried egg, Cumberland sausage, served with homemade pancakes dressed with berries and maple syrup on the side. Scrambled egg (Extra +£1)",
        allergens: ["glutens", "eggs", "milk", "sulphur_dioxide"],
      },
      {
        id: "smashed-avocado-special",
        name: "Smashed Avocado Special",
        price: 11.95,
        vegetarian: true,
        description:
          "Two free-range poached eggs with smashed avocado, sun-dried tomatoes and crumbled feta served on toasted sourdough bread",
        allergens: ["glutens", "eggs"],
      },
      {
        id: "smashed-avocado-salmon-bacon",
        name: "Smashed Avocado (Salmon/Bacon)",
        price: 12.95,
        description:
          "Two free-range poached eggs on toasted sourdough bread with smashed avocado and a choice of bacon or smoked salmon",
        allergens: ["glutens", "eggs", "fish"],
      },
      {
        id: "full-english-breakfast",
        name: "Full English Breakfast",
        price: 13.95,
        description:
          "Free-range fried eggs, beans, two slices of bacon, Cumberland sausage, hash browns, grilled mushrooms and roasted cherry tomatoes served with brown toast",
        allergens: ["glutens", "eggs", "nuts", "sulphur_dioxide"],
      },
      {
        id: "steak-eggs",
        name: "Steak & Eggs",
        price: 18.95,
        description:
          "8oz Scotch sirloin steak served with two fried eggs, two hash browns and brown toast",
        allergens: ["glutens", "eggs", "nuts"],
      },
      {
        id: "greek-breakfast",
        name: "Greek Breakfast",
        price: 13.45,
        description:
          "Free-range fried eggs, loukanika, slices of grilled halloumi, two slices of louza, roasted cherry tomatoes and baked beans served with Greek toast",
        allergens: ["glutens", "eggs", "soya"],
      },
      {
        id: "vegan-breakfast",
        name: "Vegan Breakfast",
        price: 13.95,
        vegan: true,
        description:
          "Vegan sausage, hash browns, grilled mushrooms, roasted cherry tomatoes, baked beans and either sliced or smashed avocado on the side served with toasted sourdough bread",
        allergens: ["glutens"],
      },
      {
        id: "vegetarian-breakfast",
        name: "Vegetarian Breakfast",
        price: 13.45,
        vegetarian: true,
        description:
          "Vegetarian sausage, one fried egg, hash browns, grilled mushrooms, roasted cherry tomatoes, baked beans and either sliced or smashed avocado on the side served with toasted sourdough bread. Scrambled egg (Extra +£1)",
        allergens: ["glutens", "eggs"],
      },
      {
        id: "eggs-benedict-salmon-bacon",
        name: "Eggs Benedict (Salmon/Bacon)",
        price: 10.95,
        description:
          "Two free-range poached eggs served on toasted brioche with hollandaise on the side",
        allergens: ["glutens", "eggs", "fish"],
      },
      {
        id: "halal-breakfast",
        name: "Halal Breakfast",
        price: 12.95,
        description:
          "Two fried eggs, three turkey rashers, one beef sausage, roasted cherry tomatoes, baked beans, hash browns and mushrooms served with brown toast",
        allergens: ["glutens", "eggs"],
      },
      {
        id: "omelette-of-your-choice",
        name: "Omelette of Your Choice",
        price: 10.95,
        description:
          "Choice of 1 filling, for each additional filling add £1, served with salad and chips",
        allergens: null, // varies entirely based on fillings
      },
      {
        id: "jacket-potato-baked-beans",
        name: "Jacket Potato (Baked Beans)",
        price: 10.95,
        description:
          "Choice of 1 filling, for each additional filling add £1, served with salad and coleslaw",
        allergens: null,
      },
      {
        id: "jacket-potato-cheese",
        name: "Jacket Potato (Cheese)",
        price: 10.95,
        description:
          "Choice of 1 filling, for each additional filling add £1, served with salad and coleslaw",
        allergens: null,
      },
      {
        id: "jacket-potato-tuna-mayo-sweetcorn",
        name: "Jacket Potato (Tuna Mayo & Sweetcorn)",
        price: 11.95,
        description:
          "Choice of 1 filling, for each additional filling add £1, served with salad and coleslaw",
        allergens: null,
      },
    ],
  },

  {
    id: "lunch",
    title: "Lunch",
    order: 2,
    items: [
      { id: "marlos-baby-chicken", name: "Marlo’s Baby Chicken", price: 17.95, description: "Boneless grilled baby chicken in Marlo’s special sauce (spicy) served with homemade coleslaw and seasoned fries", allergens: null },
      { id: "chicken-breast", name: "Chicken Breast", price: 14.95, description: "Grilled Norfolk chicken breast marinated in our special homemade sauce served with rice and roasted vegetables", allergens: null },
      { id: "teriyaki-salmon", name: "Teriyaki Salmon", price: 20.95, description: "Grilled teriyaki salmon sprinkled with sesame seeds served with pak choi and basmati rice", allergens: null },
      { id: "tuna-steak", name: "Tuna Steak", price: 22.95, description: "Grilled tuna steak served with mash potato and vegetables", allergens: null },
      { id: "lamb-chops", name: "Lamb Chops", price: 24.95, description: "Lamb chops served with your choice of fries or rice or salad", allergens: null },
      { id: "ribeye-steak", name: "Ribeye Steak", price: 24.95, description: "Grilled ribeye steak served with peppercorn sauce (on the side), French fries and salad", allergens: null },
      { id: "chicken-wings-8", name: "Chicken Wings (8 pcs)", price: 14.95, description: "Grilled chicken wings served with your choice of fries or rice or salad", allergens: null },
    ],
  },

  {
    id: "burgers",
    title: "Burgers",
    order: 3,
    items: [
      { id: "marlos-burger", name: "Marlo’s Burger", price: 14.95, description: "Home made patty with avocado, bacon, American cheese, pickles, tomato, fried onions, lettuce and mustard mayo", allergens: null },
      { id: "classic-burger", name: "Classic Burger", price: 12.95, description: "Home made patty with American cheese, pickles, tomato, fried onions, lettuce and mustard mayo", allergens: null },
      { id: "buttermilk-chicken-burger", name: "Buttermilk Chicken Burger", price: 13.95, description: "Chicken thigh marinated in buttermilk and spices, gherkins, lettuce, cheese, tomato and harissa mayonnaise", allergens: ["glutens", "eggs", "milk", "soya"] },
      { id: "chicken-burger", name: "Chicken Burger", price: 11.95, description: "Grilled chicken marinated in our special home made sauce, lettuce, tomato and mayonnaise", allergens: ["glutens", "eggs", "soya"] },
      { id: "vegan-burger", name: "Vegan Burger", price: 12.95, vegan: true, description: "Moving Mountains plant based patty, smoked vegan cheese, grilled onions, pickles, lettuce and vegan aioli served with salad", allergens: ["glutens", "soya"] },
      { id: "halloumi-burger", name: "Halloumi Burger", price: 13.95, vegetarian: true, description: "Grilled halloumi, smashed avocado, houmous, chargrilled peppers, red onion, lettuce with a sweet chilli sauce served with a garlic & basil aioli dip on the side", allergens: ["glutens", "soya"] },
    ],
  },

  {
    id: "salads",
    title: "Salads",
    order: 4,
    items: [
      { id: "grilled-tuna-salad", name: "Grilled Tuna Salad", price: 20.95, description: "Tuna steak with green beans, red onions, olives, tomatoes, boiled eggs, new potatoes drizzled with olive oil and lemon dressing", allergens: null },
      { id: "marlos-salad", name: "Marlo’s Salad", price: 14.95, description: "Grilled Norfolk chicken breast, bacon, lettuce, avocado, spring onions, sweet corn served with our homemade ranch dressing", allergens: null },
      { id: "caesar-salad", name: "Caesar Salad", price: 13.95, description: "Grilled Norfolk chicken breast, lettuce, shaved parmesan and croutons served with our homemade caesar dressing", allergens: null },
      { id: "goats-cheese-salad", name: "Goats Cheese Salad", price: 13.95, vegetarian: true, description: "Grilled goats cheese served on a bed of mix leaf salad, roasted peppers, sun-dried tomatoes and grilled mushrooms with our home made pesto dressing", allergens: null },
      { id: "avocado-prawn-salad", name: "Avocado & Prawn Salad", price: 15.95, description: "Sliced avocado and peeled prawns, cucumber, cherry tomatoes and pomegranates on a wild leaf bed served with our homemade honey and mustard dressing", allergens: null },
      { id: "scottish-salmon-salad", name: "Scottish Salmon Salad", price: 17.95, description: "Grilled salmon fillet, roasted peppers, olives, cucumber and grilled mushrooms served on a mixed leaf bed and our homemade french dressing", allergens: null },
    ],
  },

  {
    id: "sandwiches",
    title: "Sandwiches",
    order: 5,
    items: [
      { id: "tuna-melt-ciabatta", name: "Tuna Melt Ciabatta", price: 11.95, description: "Toasted ciabatta with tuna mayo, cheddar cheese and spring onions", allergens: null },
      { id: "steak-ciabatta", name: "Steak Ciabatta", price: 17.95, description: "Toasted ciabatta with grilled sirloin steak, melted cheddar cheese and sautéed onions", allergens: null },
      { id: "smashed-avocado-sandwich", name: "Smashed Avocado", price: 12.95, vegetarian: true, description: "Smashed avocado, tomato, smoked vegan cheese with pickles, lettuce and vegan mayo served on brown toast", allergens: null },
      { id: "classic-blt", name: "Classic BLT", price: 12.95, description: "Bacon, lettuce, tomatoes and mayonnaise served in your choice of white or brown toast", allergens: null },
      { id: "escalope-baguette", name: "Escalope Baguette", price: 12.95, description: "Breaded chicken escalope, cheddar cheese, tomato and basil mayo", allergens: null },
    ],
  },

  {
    id: "sweet-sticky",
    title: "Sweet & Sticky",
    order: 6,
    items: [
      { id: "buttermilk-pancakes-lemon-sugar", name: "Buttermilk Pancakes (Lemon & Sugar)", price: 8.95, allergens: null },
      { id: "buttermilk-pancakes-nutella-banana", name: "Buttermilk Pancakes (Nutella & Banana)", price: 10.95, allergens: null },
      { id: "buttermilk-pancakes-berries-almonds-maple", name: "Buttermilk Pancakes (Fresh berries, almonds & maple syrup)", price: 12.95, allergens: null },
      { id: "buttermilk-pancakes-bacon-scrambled-maple", name: "Buttermilk Pancakes (Crispy bacon, scrambled egg & maple syrup)", price: 11.95, allergens: null },
      { id: "lemon-drizzle-cake", name: "Lemon Drizzle Cake", price: 4.45, allergens: null },
      { id: "chocolate-biscuit-cake", name: "Chocolate Biscuit Cake", price: 4.45, allergens: null },
      { id: "carrot-cake", name: "Carrot Cake", price: 4.45, allergens: null },
      { id: "french-toast", name: "French Toast", price: 11.95, allergens: null },
      { id: "porridge", name: "Porridge", price: 10.95, allergens: null },
      { id: "granola", name: "Granola", price: 10.95, allergens: null },
      { id: "acai-bowl", name: "Açaí Bowl", price: 11.95, allergens: null },
      { id: "fruit-bowl", name: "Fruit Bowl", price: 8.45, allergens: null },
    ],
  },

  {
    id: "pastas",
    title: "Pastas",
    order: 7,
    items: [
      { id: "arrabiatta-prawns", name: "Arrabiatta Prawns", price: 14.95, description: "Spicy tomato sauce and prawns", allergens: ["glutens", "crustaceans"] },
      { id: "ravioli", name: "Ravioli", price: 11.95, description: "Spinach and ricotta ravioli served with a choice of tomato or creamy sauce", allergens: ["glutens", "eggs", "milk"] },
      { id: "smoked-salmon-and-prawn", name: "Smoked Salmon and Prawn", price: 16.95, description: "Scottish smoked salmon and prawns served in an infused garlic and chilli oil sauce", allergens: ["glutens", "fish", "crustaceans"] },
      { id: "milanese", name: "Milanese", price: 13.95, description: "Breaded Norfolk chicken breast served with our homemade arrabiatta pasta", allergens: ["glutens", "soya"] },
      { id: "alfredo-chicken", name: "Alfredo Chicken", price: 13.95, description: "Chicken, mushrooms in a garlic butter cream sauce topped with parmesan cheese", allergens: ["glutens", "milk"] },
    ],
  },

  {
    id: "wraps",
    title: "Wraps",
    order: 8,
    items: [
      { id: "steak-wrap", name: "Steak Wrap", price: 17.95, description: "Toasted tortilla wrap with grilled sirloin steak, tomatoes, onions, mustard mayo & lettuce", allergens: null },
      { id: "chicken-wrap", name: "Chicken Wrap", price: 13.95, description: "Toasted tortilla wrap with grilled Norfolk chicken breast, lettuce and garlic basil mayonnaise", allergens: null },
      { id: "halloumi-wrap", name: "Halloumi Wrap", price: 12.95, vegetarian: true, description: "Grilled halloumi sliced with rocket, spinach, red onions, roasted pepper drizzled with sweet chilli sauce", allergens: null },
      { id: "falafel-wrap", name: "Falafel Wrap", price: 12.45, vegetarian: true, description: "Toasted tortilla wrap with homemade falafels, lettuce, tomato, sliced gherkins, jalapeños and houmous dressing", allergens: null },
    ],
  },

  {
    id: "kids",
    title: "Kids Menu",
    order: 9,
    items: [
      { id: "kids-fish-fingers", name: "Fish Fingers", price: 7.95, description: "Served with chips & cucumber", allergens: null },
      { id: "kids-chicken-nuggets", name: "Chicken Nuggets", price: 7.95, description: "Served with chips & cucumber", allergens: null },
      { id: "kids-mini-burger", name: "Mini Burger", price: 7.95, description: "Served with chips & cucumber", allergens: null },
      { id: "kids-pasta", name: "Pasta", price: 7.95, description: "Served in tomato or plain sauce. Choice of penne or spaghetti", allergens: null },
      { id: "kids-omelette", name: "Omelette", price: 7.95, description: "Served with chips & cucumber", allergens: null },
      { id: "kids-breakfast", name: "Breakfast", price: 7.95, description: "Egg, bacon, sausage & beans", allergens: null },
    ],
  },

  {
    id: "sides",
    title: "Sides",
    order: 10,
    items: [
      { id: "calamari", name: "Calamari", price: 6.95, description: "Served with sweet chilli sauce", allergens: ["glutens", "fish", "milk", "soya"] },
      { id: "halloumi-fries", name: "Halloumi Fries", price: 6.95, description: "Served with sweet chilli sauce", allergens: ["glutens", "eggs", "milk"] },
      { id: "rice", name: "Rice", price: 3.5, allergens: ["celery", "milk"] },
      { id: "pan-fried-vegetables", name: "Pan Fried Vegetables", price: 4.95, allergens: [] },
      { id: "coleslaw", name: "Coleslaw", price: 3.95, allergens: ["eggs", "nuts", "soya"] },
      { id: "curly-fries", name: "Curly Fries", price: 4.0, allergens: ["glutens", "soya"] },
      { id: "sweet-potato-fries", name: "Sweet Potato Fries", price: 4.95, allergens: ["glutens", "soya"] },
      { id: "french-fries", name: "French Fries", price: 4.0, allergens: ["glutens", "soya"] },
      { id: "side-salad", name: "Side Salad", price: 5.95, allergens: ["nuts"] },
      { id: "olives", name: "Olives", price: 5.95, allergens: [] },
      { id: "parmesan", name: "Parmesan", price: 1.5, allergens: ["milk"] },
    ],
  },

  {
    id: "milkshakes",
    title: "Milkshakes",
    order: 11,
    items: [
      { id: "oreo-kinder-ferrero", name: "Oreo, Kinder Bueno, or Ferrero Rocher", price: 5.95, allergens: ["milk", "nuts", "soya"] },
      { id: "iced-frappe", name: "Iced Frappe", price: 5.95, allergens: ["milk"] },
      { id: "classic-milkshakes", name: "Vanilla, Banana, Strawberry, or Chocolate", price: 5.95, allergens: ["milk"] },
    ],
  },

  {
    id: "teas-coffees",
    title: "Teas & Coffees",
    order: 12,
    items: [
      { id: "earl-grey-tea", name: "Earl Grey Tea", price: 2.95, allergens: null },
      { id: "breakfast-tea", name: "Breakfast Tea", price: 2.95, allergens: null },
      { id: "fresh-mint-tea", name: "Fresh Mint Tea", price: 2.95, allergens: null },
      { id: "decaf-tea", name: "Decaf Tea", price: 2.95, allergens: null },
      { id: "jasmine-tea", name: "Jasmine Tea", price: 2.95, allergens: null },
      { id: "lemon-ginger-tea", name: "Lemon & Ginger Tea", price: 2.95, allergens: null },
      { id: "fruit-tea", name: "Fruit Tea", price: 2.95, allergens: null },
      { id: "green-tea", name: "Green Tea", price: 2.95, allergens: null },
      { id: "peppermint-tea", name: "Peppermint Tea", price: 2.95, allergens: null },
      { id: "chamomile-tea", name: "Chamomile Tea", price: 3.25, allergens: null },
      { id: "greek-tea", name: "Greek Tea", price: 3.5, allergens: null },

      { id: "espresso-single", name: "Espresso (Single)", price: 2.5, allergens: null },
      { id: "espresso-double", name: "Espresso (Double)", price: 3.1, allergens: null },
      { id: "macchiato-single", name: "Macchiato (Single)", price: 2.6, allergens: null },
      { id: "macchiato-double", name: "Macchiato (Double)", price: 3.1, allergens: null },
      { id: "greek-coffee", name: "Greek Coffee", price: 2.7, allergens: null },

      { id: "flat-white", name: "Flat White", price: 3.05, allergens: null },
      { id: "cappuccino", name: "Cappuccino", price: 3.45, allergens: null },
      { id: "americano", name: "Americano", price: 3.05, allergens: null },
      { id: "mochaccino", name: "Mochaccino", price: 3.7, allergens: null },
      { id: "latte", name: "Latte", price: 3.45, allergens: null },
      { id: "matcha-latte", name: "Matcha Latte", price: 4.15, allergens: null },
      { id: "chai-latte", name: "Chai Latte", price: 3.7, allergens: null },
      { id: "iced-latte", name: "Iced Latte", price: 3.45, allergens: null },
      { id: "babyccino", name: "Babyccino", price: 1.7, allergens: null },
      { id: "hot-chocolate", name: "Hot Choc", price: 3.7, allergens: null },

      { id: "alt-milk-extra", name: "Alternative milks (soya/oat/coconut/almond) +30p", price: 0.3, allergens: null },
      { id: "marshmallows-or-whipped-cream", name: "Add marshmallows or whipped cream +50p", price: 0.5, allergens: null },
      { id: "pot-of-honey", name: "Pot of Honey", price: 1.0, allergens: null },
    ],
  },

  {
    id: "soft-drinks",
    title: "Soft Drinks",
    order: 13,
    items: [
      { id: "still-water-330", name: "Still Water (330ml)", price: 2.45, allergens: null },
      { id: "sparkling-water-330", name: "Sparkling Water (330ml)", price: 2.95, allergens: null },
      { id: "still-water-750", name: "Still Water (750ml)", price: 4.5, allergens: null },
      { id: "sparkling-water-750", name: "Sparkling Water (750ml)", price: 4.95, allergens: null },
      { id: "coke", name: "Coke", price: 3.3, allergens: null },
      { id: "diet-coke", name: "Diet Coke", price: 3.3, allergens: null },
      { id: "coke-zero", name: "Coke Zero", price: 3.3, allergens: null },
      { id: "fanta", name: "Fanta", price: 3.3, allergens: null },
      { id: "sprite", name: "Sprite", price: 3.3, allergens: null },
      { id: "red-bull", name: "Red Bull", price: 3.45, allergens: null },
    ],
  },

  {
    id: "fresh-juices",
    title: "Fresh Juices",
    order: 14,
    items: [
      { id: "juice-orange-apple-pear-pink-grapefruit", name: "Orange / Apple / Pear / Pink Grapefruit", price: 4.95, allergens: null },
      { id: "juice-carrot", name: "Carrot", price: 4.95, allergens: null },
      { id: "juice-pineapple", name: "Pineapple", price: 5.25, allergens: null },
      { id: "juice-mixed", name: "Mixed Juice (Choose up to three fruits)", price: 5.45, allergens: null },
      { id: "juice-ginger-extra", name: "Ginger (Extra +50p)", price: 0.5, allergens: null },
    ],
  },

  {
    id: "smoothies",
    title: "Smoothies",
    order: 15,
    items: [
      { id: "strawberry-sunshine", name: "Strawberry Sunshine (Strawberry, mango, banana)", price: 5.95, allergens: null },
      { id: "merry-berry", name: "Merry Berry (Banana, strawberry, blackberry)", price: 5.95, allergens: null },
      { id: "pineapple-surprise", name: "Pineapple Surprise (Pineapple, mango, pear)", price: 5.95, allergens: null },
      { id: "peachy-green", name: "Peachy Green (Kale, broccoli, peach, mango, kiwi)", price: 5.95, allergens: null },
      { id: "tropical-crush", name: "Tropical Crush (Passion fruit, mango, papaya, pineapple)", price: 5.95, allergens: null },
    ],
  },

  {
    id: "carton-juices",
    title: "Carton Juices",
    order: 16,
    items: [
      { id: "carton-juice", name: "Orange, Apple, Pineapple, Cranberry", price: 3.25, allergens: null },
    ],
  },

  {
    id: "sparkling-wines",
    title: "Sparkling Wines",
    order: 17,
    items: [
      { id: "bellini-glass", name: "Bellini (Glass)", price: 7.5, allergens: null },
      { id: "mimosa-glass", name: "Mimosa (Glass)", price: 7.5, allergens: null },
      { id: "kir-royale-glass", name: "Kir Royale (Glass)", price: 7.5, allergens: null },
      { id: "prosecco-glass", name: "Prosecco (Glass)", price: 7.5, allergens: null },
      { id: "prosecco-bottle", name: "Prosecco (Bottle)", price: 29.99, allergens: null },
    ],
  },

  {
    id: "beers",
    title: "Beers",
    order: 18,
    items: [
      { id: "peroni", name: "Peroni", price: 5.5, allergens: null },
      { id: "corona", name: "Corona", price: 5.5, allergens: null },
      { id: "efes-draft", name: "Efes Draft", price: 5.95, allergens: null },
      { id: "magners-cider", name: "Magners Cider", price: 5.5, allergens: null },
    ],
  },

  {
    id: "wines",
    title: "Wines",
    order: 19,
    items: [
      { id: "pinot-grigio-small", name: "Pinot Grigio (Small)", price: 6.95, allergens: null },
      { id: "pinot-grigio-large", name: "Pinot Grigio (Large)", price: 7.95, allergens: null },
      { id: "pinot-grigio-bottle", name: "Pinot Grigio (Bottle)", price: 22.95, allergens: null },

      { id: "sauvignon-blanc-small", name: "Sauvignon Blanc (Small)", price: 7.5, allergens: null },
      { id: "sauvignon-blanc-large", name: "Sauvignon Blanc (Large)", price: 8.5, allergens: null },
      { id: "sauvignon-blanc-bottle", name: "Sauvignon Blanc (Bottle)", price: 24.95, allergens: null },

      { id: "merlot-small", name: "Merlot (Small)", price: 6.95, allergens: null },
      { id: "merlot-large", name: "Merlot (Large)", price: 7.95, allergens: null },
      { id: "merlot-bottle", name: "Merlot (Bottle)", price: 22.95, allergens: null },

      { id: "malbec-small", name: "Malbec (Small)", price: 7.5, allergens: null },
      { id: "malbec-large", name: "Malbec (Large)", price: 8.5, allergens: null },
      { id: "malbec-bottle", name: "Malbec (Bottle)", price: 24.95, allergens: null },

      { id: "pinot-blush-small", name: "Pinot Blush (Small)", price: 6.95, allergens: null },
      { id: "pinot-blush-large", name: "Pinot Blush (Large)", price: 7.95, allergens: null },
      { id: "pinot-blush-bottle", name: "Pinot Blush (Bottle)", price: 22.95, allergens: null },
    ],
  },
];
