export type HousingType = "apartment" | "residence-hall";
export type HousingSource = "UTA" | "Off Campus";

export type HousingItem = {
  id: string;
  name: string;
  category: HousingType;
  source: HousingSource;
  address: string;
  shortLocation: string;
  description: string;
  image: string;
  priceLevel: "$" | "$$" | "$$$";
  officialFeatures: string[];
  tags: string[];
  officialUrl: string;
  rating: number;
  reviewCount: number;
  distanceFromUTA: string;
};

export const utaHousing: HousingItem[] = [
  // OFF-CAMPUS / CUSTOM APARTMENTS
  {
    id: "the-arlie",
    name: "The Arlie",
    category: "apartment",
    source: "Off Campus",
    address: "815 W Abram St, Arlington, TX",
    shortLocation: "Near UTA",
    description:
      "Popular student apartment community near UTA with modern amenities, social spaces, and a convenient location for students.",
    image: "/the-arlie1.jpg",
    priceLevel: "$$$",
    officialFeatures: [
      "Pool",
      "Fitness Center",
      "Study Lounge",
      "Student Living",
      "Modern Amenities",
    ],
    tags: ["Apartment", "Pool", "Near UTA", "Student Living", "Modern"],
    officialUrl: "",
    rating: 4.4,
    reviewCount: 32,
    distanceFromUTA: "Near campus",
  },
  {
    id: "campus-edge",
    name: "Campus Edge",
    category: "apartment",
    source: "Off Campus",
    address: "912 W Mitchell St, Arlington, TX",
    shortLocation: "Near UTA",
    description:
      "Student housing option close to campus with shared amenities, comfortable living, and convenient access to UTA.",
    image: "/campus-edge1.jpg",
    priceLevel: "$$",
    officialFeatures: [
      "Pool",
      "Gym",
      "Study Area",
      "Student Living",
      "Near Campus",
    ],
    tags: ["Apartment", "Pool", "Gym", "Near UTA", "Student Living"],
    officialUrl: "",
    rating: 4.1,
    reviewCount: 26,
    distanceFromUTA: "Near campus",
  },
  {
    id: "liv-plus",
    name: "Liv+ Arlington",
    category: "apartment",
    source: "Off Campus",
    address: "1001 S Center St, Arlington, TX",
    shortLocation: "Near UTA",
    description:
      "Modern off-campus student apartment with furnished options, social amenities, and a strong student-focused atmosphere.",
    image: "/liv-plus1.jpg",
    priceLevel: "$$$",
    officialFeatures: [
      "Pool",
      "Fitness Center",
      "Clubhouse",
      "Furnished Options",
      "Modern Design",
    ],
    tags: ["Apartment", "Pool", "Modern", "Furnished", "Near UTA"],
    officialUrl: "",
    rating: 4.3,
    reviewCount: 21,
    distanceFromUTA: "Near campus",
  },

  // UTA APARTMENTS
  {
    id: "arbor-oaks",
    name: "Arbor Oaks",
    category: "apartment",
    source: "UTA",
    address: "1000 - 1008 Greek Row Dr., Arlington, Texas",
    shortLocation: "On UTA campus",
    description:
      "Student apartment community with furnished options, pool access, and in-unit washer and dryer.",
    image: "/Arbor-Oaks1.jpg",
    priceLevel: "$$",
    officialFeatures: [
      "Utilities Included",
      "High-speed Internet",
      "Swimming Pool",
      "Washer and Dryer in Apt",
      "Furnished",
      "12-month lease term",
      "Open Year Round",
    ],
    tags: ["Apartment", "Pool", "Furnished", "Washer/Dryer", "Near UTA"],
    officialUrl: "https://www.uta.edu/campus-ops/housing/apartments/arbor-oaks",
    rating: 4.2,
    reviewCount: 18,
    distanceFromUTA: "On campus",
  },
  {
    id: "heights-on-pecan",
    name: "The Heights on Pecan",
    category: "apartment",
    source: "UTA",
    address: "1225 S. Pecan St, Arlington, Texas 76010",
    shortLocation: "Near campus",
    description:
      "Furnished apartment community with pool, workout facility, and covered parking garage.",
    image: "/Pecan1.jpeg",
    priceLevel: "$$$",
    officialFeatures: [
      "Fully-furnished rooms",
      "Swimming Pool",
      "Workout Facility",
      "Covered Parking Garage",
      "All bills paid",
    ],
    tags: ["Apartment", "Pool", "Furnished", "Gym", "Parking Garage"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/apartments/heights-on-pecan",
    rating: 4.4,
    reviewCount: 25,
    distanceFromUTA: "Near campus",
  },
  {
    id: "the-lofts",
    name: "The Lofts",
    category: "apartment",
    source: "UTA",
    address: "500 S. Center St, Arlington, TX 76010",
    shortLocation: "College Park District",
    description:
      "Modern UTA apartment option with one- and two-bedroom layouts and pool access.",
    image: "/The-Lofts.jpeg",
    priceLevel: "$$$",
    officialFeatures: [
      "Utilities Included",
      "High-speed Internet",
      "Washer and Dryer in Apt",
      "One and Two Bedroom Floor Plans",
      "Access to Swimming Pool",
    ],
    tags: ["Apartment", "College Park", "Pool", "Washer/Dryer", "Modern"],
    officialUrl: "https://www.uta.edu/campus-ops/housing/apartments/the-lofts",
    rating: 4.3,
    reviewCount: 16,
    distanceFromUTA: "Near UTA",
  },
  {
    id: "meadow-run",
    name: "Meadow Run",
    category: "apartment",
    source: "UTA",
    address: "409 - 607 Summit Dr., Arlington, Texas",
    shortLocation: "On UTA campus",
    description:
      "Unfurnished apartment community with one- and two-bedroom units, clubhouse, and pool.",
    image: "/Meadow_Run.png",
    priceLevel: "$$",
    officialFeatures: [
      "One and Two Bedroom Units",
      "Unfurnished",
      "Swimming Pool",
      "Clubhouse",
    ],
    tags: ["Apartment", "Pool", "Unfurnished", "Clubhouse", "Near UTA"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/apartments/meadow-run",
    rating: 4.1,
    reviewCount: 14,
    distanceFromUTA: "On campus",
  },
  {
    id: "timber-brook",
    name: "Timber Brook",
    category: "apartment",
    source: "UTA",
    address: "400 - 410 Kerby St., Arlington, Texas",
    shortLocation: "On UTA campus",
    description:
      "Furnished by-the-bed apartment living with pool and outdoor picnic areas.",
    image: "/Timber Brook.png",
    priceLevel: "$",
    officialFeatures: [
      "Furnished",
      "Leased by the bed",
      "Swimming Pool",
      "Outdoor Picnic Areas",
    ],
    tags: ["Apartment", "Budget Friendly", "Pool", "Furnished", "By-the-Bed"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/apartments/timber-brook",
    rating: 3.9,
    reviewCount: 12,
    distanceFromUTA: "On campus",
  },
  {
    id: "university-village",
    name: "University Village",
    category: "apartment",
    source: "UTA",
    address: "900 - 914 Greek Row Dr., Arlington, Texas",
    shortLocation: "On UTA campus",
    description:
      "Unfurnished one-bedroom apartment with free laundry, internet, and pool access.",
    image: "/University_Village.png",
    priceLevel: "$$",
    officialFeatures: [
      "Utilities Included",
      "Open Year Round",
      "Unfurnished",
      "High-speed Internet",
      "Unlimited Free Laundry",
      "Access to Swimming Pool",
    ],
    tags: ["Apartment", "Unfurnished", "Free Laundry", "Pool", "Near UTA"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/apartments/university-village",
    rating: 4.0,
    reviewCount: 11,
    distanceFromUTA: "On campus",
  },

  // UTA RESIDENCE HALLS
  {
    id: "arlington-hall",
    name: "Arlington Hall",
    category: "residence-hall",
    source: "UTA",
    address: "UTA Campus, Arlington, TX",
    shortLocation: "Near University Center",
    description:
      "Large residence hall near the University Center with suite-style living and strong campus convenience.",
    image: "/Arlington_Hall.png",
    priceLevel: "$$",
    officialFeatures: [
      "Suite Style",
      "All Utilities Paid",
      "High-Speed Internet",
      "Unlimited Laundry",
      "Community Kitchen",
      "Meal Plan Required",
    ],
    tags: ["Residence Hall", "Suite Style", "Laundry", "Meal Plan", "Near UTA"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/reshalls/arlington-hall",
    rating: 4.3,
    reviewCount: 21,
    distanceFromUTA: "On campus",
  },
  {
    id: "kc-hall",
    name: "KC Hall",
    category: "residence-hall",
    source: "UTA",
    address: "UTA Campus, Arlington, TX",
    shortLocation: "Central campus",
    description:
      "Residence hall in a central campus location with suite-style rooms and shared community spaces.",
    image: "/KC_Hall.png",
    priceLevel: "$$",
    officialFeatures: [
      "Suite Style",
      "All Utilities Paid",
      "High-Speed Internet",
      "Unlimited Laundry",
      "Community Kitchen",
      "Meal Plan Required",
    ],
    tags: ["Residence Hall", "Central Campus", "Laundry", "Meal Plan"],
    officialUrl: "https://www.uta.edu/campus-ops/housing/reshalls/kc-hall",
    rating: 4.2,
    reviewCount: 19,
    distanceFromUTA: "On campus",
  },
  {
    id: "maverick-hall",
    name: "Maverick Hall",
    category: "residence-hall",
    source: "UTA",
    address: "UTA Campus, Arlington, TX",
    shortLocation: "Near The Commons",
    description:
      "Newer residence hall with multiple room styles and strong on-campus convenience.",
    image: "/MavHallBlock.png",
    priceLevel: "$$$",
    officialFeatures: [
      "Suite Style",
      "All Utilities Paid",
      "High-Speed Internet",
      "Unlimited Laundry",
      "Community Kitchen",
      "Meal Plan Required",
    ],
    tags: ["Residence Hall", "New Building", "Laundry", "Meal Plan"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/reshalls/maverick-hall",
    rating: 4.5,
    reviewCount: 9,
    distanceFromUTA: "On campus",
  },
  {
    id: "vandergriff-hall",
    name: "Vandergriff Hall",
    category: "residence-hall",
    source: "UTA",
    address: "UTA Campus, Arlington, TX",
    shortLocation: "College Park District",
    description:
      "Residence hall close to dining, events, and campus activity with convenient suite-style living.",
    image: "/vandergriffsite.jpeg",
    priceLevel: "$$",
    officialFeatures: [
      "Suite Style",
      "All Utilities Paid",
      "High-Speed Internet",
      "Unlimited Laundry",
      "Community Kitchen",
      "Meal Plan Required",
    ],
    tags: ["Residence Hall", "College Park", "Laundry", "Meal Plan"],
    officialUrl:
      "https://www.uta.edu/campus-ops/housing/reshalls/vandergriff-hall",
    rating: 4.1,
    reviewCount: 15,
    distanceFromUTA: "On campus",
  },
  {
    id: "west-hall",
    name: "West Hall",
    category: "residence-hall",
    source: "UTA",
    address: "UTA Campus, Arlington, TX",
    shortLocation: "On campus",
    description:
      "Residence hall option with suite-style rooms and the standard UTA residence hall amenities.",
    image: "/West-Hall.jpg",
    priceLevel: "$$",
    officialFeatures: [
      "Suite Style",
      "All Utilities Paid",
      "High-Speed Internet",
      "Unlimited Laundry",
      "Community Kitchen",
      "Meal Plan Required",
    ],
    tags: ["Residence Hall", "Suite Style", "Laundry", "Meal Plan", "Near UTA"],
    officialUrl: "https://www.uta.edu/campus-ops/housing/reshalls/west-hall",
    rating: 4.0,
    reviewCount: 13,
    distanceFromUTA: "On campus",
  },
];