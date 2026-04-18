// ============================================================
//  NATIONAL FOOTWEAR — Multi-Angle Product Database
//  Showcasing 360° views and sample details for every item.
// ============================================================

const PRODUCTS_DB = [
  // ━━━━━━━━━━━━━━━━━━━━ MEN'S FOOTWEAR ━━━━━━━━━━━━━━━━━━━━
  {
    id: "NP1337",
    sku: "NP1337",
    brand: "National Comfort",
    name: "Men's Premium Cushion Sandals - NP1337",
    category: "men",
    type: "Sandals",
    price: 649,
    wholesalePrice: 486,
    originalPrice: 899,
    discount: 28,
    moq: 6,
    rating: 4.8,
    reviewCount: 320,
    badge: "bestseller",
    badgeLabel: "Best Seller",
    colors: [
      { 
        name: "Black", 
        hex: "#1A1A1A", 
        images: [
          "images/products/men/NP1337/Black/right.jpg",
          "images/products/men/NP1337/Black/front-back.jpg",
          "images/products/men/NP1337/Black/side.jpg",
          "images/products/men/NP1337/Black/left.jpg",
          "images/products/men/NP1337/Black/detail1.jpg",
          "images/products/men/NP1337/Black/detail2.jpg",
          "images/products/men/NP1337/Black/zoomin.jpg"
        ] 
      },
      { 
        name: "Blue", 
        hex: "#1E3A8A", 
        images: [
          "images/products/men/NP1337/Blue/right.jpg",
          "images/products/men/NP1337/Blue/front-back.jpg",
          "images/products/men/NP1337/Blue/side.jpg",
          "images/products/men/NP1337/Blue/left.jpg",
          "images/products/men/NP1337/Blue/zoomin.jpg"
        ] 
      },
      { 
        name: "Brown", 
        hex: "#5D4037", 
        images: [
          "images/products/men/NP1337/Brown/right.jpg",
          "images/products/men/NP1337/Brown/front-back.jpg",
          "images/products/men/NP1337/Brown/side.jpg",
          "images/products/men/NP1337/Brown/left.jpg",
          "images/products/men/NP1337/Brown/zoomin.jpg"
        ] 
      }
    ],
    sizes: [7,8,9,10,11,12,13],
    unavailableSizes: [],
    description: "Extra cushioning technology targets high-impact areas for incredible shock absorption. Ideal for long-duration wear.",
    features: ["Airo-tech Sole", "Ultra Lightweight", "Dual Strap Support"],
    inStock: true
  },
  {
    id: "NP1347",
    sku: "NP1347",
    brand: "Walkaroo Plus",
    name: "Men's Sporty Comfort Sandals - NP1347",
    category: "men",
    type: "Comfort Sandal",
    price: 599,
    wholesalePrice: 449,
    originalPrice: 799,
    discount: 25,
    moq: 6,
    rating: 4.7,
    reviewCount: 1240,
    badge: "trending",
    badgeLabel: "Trending",
    colors: [
      { 
        name: "Blue", 
        hex: "#2563EB", 
        images: [
          "images/products/men/NP1347/Blue/right.jpg",
          "images/products/men/NP1347/Blue/front-back.jpg",
          "images/products/men/NP1347/Blue/side.jpg",
          "images/products/men/NP1347/Blue/left.jpg",
          "images/products/men/NP1347/Blue/sample1.jpg",
          "images/products/men/NP1347/Blue/sample2.jpg",
          "images/products/men/NP1347/Blue/zoomin.jpg"
        ] 
      },
      { 
        name: "Olive", 
        hex: "#556B2F", 
        images: [
          "images/products/men/NP1347/Olive/right.jpg",
          "images/products/men/NP1347/Olive/front-back.jpg",
          "images/products/men/NP1347/Olive/side.jpg",
          "images/products/men/NP1347/Olive/left.jpg",
          "images/products/men/NP1347/Olive/zoomin.jpg"
        ] 
      }
    ],
    sizes: [7,8,9,10,11,12,13],
    unavailableSizes: [],
    description: "Built for all-day comfort, these premium sandals feature a soft footbed and durable straps from the National specialized series.",
    features: ["Anatomic Footbed", "Water Resistant", "Sturdy Straps"],
    inStock: true
  },

  // ━━━━━━━━━━━━━━━━━━━━ WOMEN'S FOOTWEAR ━━━━━━━━━━━━━━━━━━━━
  {
    id: "NE2349",
    sku: "NE2349",
    brand: "National Soft",
    name: "Women's Daily Comfort Sandals - NE2349",
    category: "women",
    type: "Daily Wear",
    price: 499,
    wholesalePrice: 374,
    originalPrice: 799,
    discount: 37,
    moq: 12,
    rating: 4.9,
    reviewCount: 2100,
    badge: "bestseller",
    badgeLabel: "Top Rated",
    colors: [
      { 
        name: "Fig", 
        hex: "#6D355D", 
        images: [
          "images/products/women/NE2349/Fig/right.jpg",
          "images/products/women/NE2349/Fig/front-back.jpg",
          "images/products/women/NE2349/Fig/side.jpg",
          "images/products/women/NE2349/Fig/left.jpg",
          "images/products/women/NE2349/Fig/zoomin.jpg"
        ] 
      },
      { 
        name: "Olive", 
        hex: "#708090", 
        images: [
          "images/products/women/NE2349/Olive/right.jpg",
          "images/products/women/NE2349/Olive/front-back.jpg",
          "images/products/women/NE2349/Olive/side.jpg",
          "images/products/women/NE2349/Olive/left.jpg",
          "images/products/women/NE2349/Olive/zoomin.jpg"
        ] 
      }
    ],
    sizes: [7,8,9,10,11,12,13],
    unavailableSizes: [],
    description: "Extremely soft and lightweight daily wear sandals. Designed to reduce foot fatigue during household chores or quick outings.",
    features: ["Super Soft EVA", "Anti-Skid Sole", "Breathable Straps"],
    inStock: true
  },
  {
    id: "NL7554",
    sku: "NL7554",
    brand: "National Elegance",
    name: "Women's Designer Comfort Sandals - NL7554",
    category: "women",
    type: "Premium Clog",
    price: 799,
    wholesalePrice: 599,
    originalPrice: 1299,
    discount: 38,
    moq: 6,
    rating: 4.8,
    reviewCount: 450,
    badge: "new",
    badgeLabel: "New Style",
    colors: [
      { 
        name: "Beige", 
        hex: "#F5F5DC", 
        images: [
          "images/products/women/NL7554/Beige/right.jpg",
          "images/products/women/NL7554/Beige/front-back.jpg",
          "images/products/women/NL7554/Beige/side.jpg",
          "images/products/women/NL7554/Beige/left.jpg",
          "images/products/women/NL7554/Beige/zoomin.jpg"
        ] 
      },
      { 
        name: "Olive", 
        hex: "#808000", 
        images: [
          "images/products/women/NL7554/Olive/right.jpg",
          "images/products/women/NL7554/Olive/front-back.jpg",
          "images/products/women/NL7554/Olive/side.jpg",
          "images/products/women/NL7554/Olive/left.jpg",
          "images/products/women/NL7554/Olive/zoomin.jpg"
        ] 
      }
    ],
    sizes: [7,8,9,10,11,12,13],
    unavailableSizes: [],
    description: "Elegant designer clogs that combine fashion with the comfort of medical-grade footbeds.",
    features: ["Arch Support", "Premium Finish", "Wipe Clean"],
    inStock: true
  },

  // ━━━━━━━━━━━━━━━━━━━━ KIDS FOOTWEAR (Split by Gender) ━━━━━━━━━━━━━━━━━━━━
  {
    id: "NK-B-1030",
    sku: "NK-B-1030",
    brand: "National Kids",
    name: "Boy's Sporty Active Sandals - NK-B-1030",
    category: "boys",
    type: "Kids Sandals",
    price: 399,
    wholesalePrice: 299,
    originalPrice: 599,
    discount: 33,
    moq: 12,
    rating: 4.7,
    reviewCount: 180,
    badge: null,
    badgeLabel: null,
    colors: [
      { 
        name: "Black", 
        hex: "#000000", 
        images: [
          "images/products/kids/Boys/NW1030/Black/right.jpg",
          "images/products/kids/Boys/NW1030/Black/front-back.jpg",
          "images/products/kids/Boys/NW1030/Black/side.jpg",
          "images/products/kids/Boys/NW1030/Black/left.jpg",
          "images/products/kids/Boys/NW1030/Black/zoomin.jpg"
        ] 
      }
    ],
    sizes: [1,2,3,4,5,6],
    unavailableSizes: [],
    description: "Rugged sandals built for active boys. Tough enough for the playground, comfortable enough for daily wear.",
    features: ["Reinforced Straps", "Grip Sole", "Easy Wash"],
    inStock: true
  },
  {
    id: "NK-G-77040",
    sku: "NK-G-77040",
    brand: "National Kids",
    name: "Girl's Wedge Heel Sandals - NK-G-77040",
    category: "girls",
    type: "Wedge Sandals",
    price: 549,
    wholesalePrice: 412,
    originalPrice: 899,
    discount: 39,
    moq: 8,
    rating: 4.9,
    reviewCount: 95,
    badge: "trending",
    badgeLabel: "Girl's Choice",
    colors: [
      { 
        name: "Peacock Blue", 
        hex: "#008080", 
        images: [
          "images/products/kids/Girls/NLR77040/Blue/right.jpg",
          "images/products/kids/Girls/NLR77040/Blue/front-back.jpg",
          "images/products/kids/Girls/NLR77040/Blue/side.jpg",
          "images/products/kids/Girls/NLR77040/Blue/left.jpg",
          "images/products/kids/Girls/NLR77040/Blue/zoomin.jpg"
        ] 
      },
      { 
        name: "Plum", 
        hex: "#8E4585", 
        images: [
          "images/products/kids/Girls/NLR77040/Plum/right.jpg"
        ] 
      }
    ],
    sizes: [1,2,3,4,5,6],
    unavailableSizes: [],
    description: "Stylish wedge sandals for young fashionistas. Features a secure fit and lightweight wedge for height and comfort.",
    features: ["Lightweight Wedge", "Adjustable Fit", "Premium Colors"],
    inStock: true
  },
  {
    id: "NK-S-522",
    sku: "NK-S-522",
    brand: "National School",
    name: "Boys Premium School Shoes - NK-S-522",
    category: "school",
    type: "School Shoe",
    price: 499,
    wholesalePrice: 349,
    originalPrice: 699,
    discount: 28,
    moq: 12,
    rating: 4.8,
    reviewCount: 45,
    badge: "new",
    badgeLabel: "School Essential",
    colors: [
      { 
        name: "Black", 
        hex: "#000000", 
        images: [
          "images/products/kids/School Collection/Boys School Shoes - NP522 Black/right.jpg",
          "images/products/kids/School Collection/Boys School Shoes - NP522 Black/front-back.jpg",
          "images/products/kids/School Collection/Boys School Shoes - NP522 Black/side.jpg",
          "images/products/kids/School Collection/Boys School Shoes - NP522 Black/left.jpg",
          "images/products/kids/School Collection/Boys School Shoes - NP522 Black/zoomin.jpg"
        ] 
      }
    ],
    sizes: [1,2,3,4,5,6],
    unavailableSizes: [],
    description: "Durable and breathable school shoes designed for long school hours. Features a non-marking sole and easy-to-clean upper.",
    features: ["Non-Marking Sole", "Comfort Insole", "Scuff Resistant"],
    inStock: true
  },
  {
    id: "NK-S-552",
    sku: "NK-S-552",
    brand: "National School",
    name: "Kids Comfort School Shoe - NK-S-552",
    category: "school",
    type: "School Shoe",
    price: 449,
    wholesalePrice: 315,
    originalPrice: 599,
    discount: 25,
    moq: 12,
    rating: 4.7,
    reviewCount: 38,
    badge: null,
    badgeLabel: null,
    colors: [
      { 
        name: "Black", 
        hex: "#000000", 
        images: [
          "images/products/kids/School Collection/Kids school shoe - NP552 Black/right.jpg",
          "images/products/kids/School Collection/Kids school shoe - NP552 Black/front-back.jpg",
          "images/products/kids/School Collection/Kids school shoe - NP552 Black/side.jpg",
          "images/products/kids/School Collection/Kids school shoe - NP552 Black/left.jpg",
          "images/products/kids/School Collection/Kids school shoe - NP552 Black/zoomin.jpg"
        ] 
      }
    ],
    sizes: [1,2,3,4,5,6],
    unavailableSizes: [],
    description: "Classic school shoe silhouette with enhanced arch support. Built to withstand active playtime and formal school requirements.",
    features: ["Arch Support", "Lightweight", "Durable Material"],
    inStock: true
  },
  {
    id: "NP6255",
    sku: "NP6255",
    brand: "National Men",
    name: "Men's Luxury Formal Loafers - NP6255",
    category: "men",
    type: "Formal Loafers",
    price: 1299,
    wholesalePrice: 975,
    originalPrice: 1999,
    discount: 35,
    moq: 6,
    rating: 4.9,
    reviewCount: 156,
    badge: "trending",
    badgeLabel: "Premium Choice",
    colors: [
      { 
        name: "Black", 
        hex: "#000000", 
        images: [
          "images/products/men/NP6255/Black/right.jpg",
          "images/products/men/NP6255/Black/front-back.jpg",
          "images/products/men/NP6255/Black/side.jpg",
          "images/products/men/NP6255/Black/left.jpg",
          "images/products/men/NP6255/Black/detail.jpg",
          "images/products/men/NP6255/Black/zoomin.jpg"
        ] 
      },
      { 
        name: "Brown", 
        hex: "#5D4037", 
        images: [
          "images/products/men/NP6255/Brown/right.jpg",
          "images/products/men/NP6255/Brown/front-back.jpg",
          "images/products/men/NP6255/Brown/side.jpg",
          "images/products/men/NP6255/Brown/detail.jpg",
          "images/products/men/NP6255/Brown/zoomin.jpg"
        ] 
      },
      { 
        name: "Tan", 
        hex: "#D2B48C", 
        images: [
          "images/products/men/NP6255/Tan/right.jpg",
          "images/products/men/NP6255/Tan/front-back.jpg",
          "images/products/men/NP6255/Tan/side.jpg",
          "images/products/men/NP6255/Tan/left.jpg",
          "images/products/men/NP6255/Tan/detail.jpg",
          "images/products/men/NP6255/Tan/zoomin.jpg"
        ] 
      }
    ],
    sizes: [7,8,9,10,11,12,13],
    unavailableSizes: [],
    description: "Handcrafted formal loafers with a polished finish. Features a cushioned footbed for office-long comfort.",
    features: ["Genuine Finish", "Cushioned Insole", "Anti-Slip Sole"],
    inStock: true
  },
  {
    id: "NP2359",
    sku: "NP2359",
    brand: "National Women",
    name: "Women's Designer Slip-ons - NP2359",
    category: "women",
    type: "Slip-ons",
    price: 899,
    wholesalePrice: 675,
    originalPrice: 1499,
    discount: 40,
    moq: 12,
    rating: 4.8,
    reviewCount: 230,
    badge: "new",
    badgeLabel: "New Style",
    colors: [
      { 
        name: "Blue", 
        hex: "#2563EB", 
        images: [
          "images/products/women/NP2359/Blue/right.jpg",
          "images/products/women/NP2359/Blue/front-back.jpg",
          "images/products/women/NP2359/Blue/side.jpg",
          "images/products/women/NP2359/Blue/left.jpg",
          "images/products/women/NP2359/Blue/sample.jpg",
          "images/products/women/NP2359/Blue/zoomin.jpg"
        ] 
      },
      { 
        name: "Fig", 
        hex: "#6D355D", 
        images: [
          "images/products/women/NP2359/Fig/right.jpg",
          "images/products/women/NP2359/Fig/front-back.jpg",
          "images/products/women/NP2359/Fig/side.jpg",
          "images/products/women/NP2359/Fig/left.jpg",
          "images/products/women/NP2359/Fig/zoomin.jpg"
        ] 
      }
    ],
    sizes: [7,8,9,10,11,12,13],
    unavailableSizes: [],
    description: "Chic and versatile designer slip-ons. Lightweight construction paired with high-fashion aesthetics.",
    features: ["Lightweight", "Memory Foam", "Breathable Material"],
    inStock: true
  }
];
