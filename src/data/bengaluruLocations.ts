export interface LocationSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  source: "osm" | "local";
}

interface CuratedPlace {
  title: string;
  subtitle: string;
  cityKey: string;
  lat: number;
  lng: number;
  keywords?: string[];
}

export const CURATED_INDIAN_LOCATIONS: CuratedPlace[] = [
  // Bengaluru Core & Arterial Localities
  {
    title: "Jayanagar",
    subtitle: "South Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 12.9308,
    lng: 77.5838,
    keywords: ["jaya", "jayanagara", "4th block", "9th block"],
  },
  {
    title: "Jayanagar 4th Block",
    subtitle: "Shopping Complex & Bus Stand, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9279,
    lng: 77.5835,
    keywords: ["jaya", "4th block", "11th main"],
  },
  {
    title: "Jayanagar 9th Block",
    subtitle: "East End Main Rd, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9182,
    lng: 77.5936,
    keywords: ["jaya", "ragigudda"],
  },
  {
    title: "Jayamahal",
    subtitle: "Palace Grounds Corridor, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9994,
    lng: 77.5947,
    keywords: ["jaya", "jayamahal road"],
  },
  {
    title: "Koramangala",
    subtitle: "South-East Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 12.9352,
    lng: 77.6245,
    keywords: ["kora", "koramangala"],
  },
  {
    title: "Koramangala 4th Block",
    subtitle: "80 Feet Road & Sony World Junction, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9344,
    lng: 77.6269,
    keywords: ["kora", "80 feet", "sony world"],
  },
  {
    title: "Koramangala 1st Block",
    subtitle: "Sarjapur Main Rd Junction, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9276,
    lng: 77.6368,
    keywords: ["kora", "wipro park"],
  },
  {
    title: "Koramangala 6th Block",
    subtitle: "Forum Mall / Nexus Koramangala, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9389,
    lng: 77.6209,
    keywords: ["kora", "forum"],
  },
  {
    title: "Indiranagar",
    subtitle: "East Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 12.9784,
    lng: 77.6408,
    keywords: ["indi", "indiranagara"],
  },
  {
    title: "100 Feet Road, Indiranagar",
    subtitle: "Commercial Corridor & CMH Junction, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9719,
    lng: 77.6412,
    keywords: ["indi", "100 feet", "100ft", "cmh"],
  },
  {
    title: "Indiranagar Metro Station",
    subtitle: "CMH Road, Indiranagar, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9783,
    lng: 77.6387,
    keywords: ["indi", "metro", "cmh road"],
  },
  {
    title: "Whitefield",
    subtitle: "East IT Corridor, Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 12.9698,
    lng: 77.75,
    keywords: ["whit", "whitefield"],
  },
  {
    title: "ITPL Main Road, Whitefield",
    subtitle: "Tech Park & Brookefield Corridor, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9855,
    lng: 77.7367,
    keywords: ["whit", "itpl", "tech park"],
  },
  {
    title: "Hope Farm Junction, Whitefield",
    subtitle: "Whitefield Main Rd, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9838,
    lng: 77.7528,
    keywords: ["whit", "hope farm"],
  },
  {
    title: "Rajajinagar",
    subtitle: "West Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 12.9982,
    lng: 77.553,
    keywords: ["raja", "rajaji"],
  },
  {
    title: "Rajajinagar 2nd Block",
    subtitle: "12th Main & Dr Rajkumar Road, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9965,
    lng: 77.5542,
    keywords: ["raja", "12th main"],
  },
  {
    title: "Malleswaram",
    subtitle: "North-West Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 13.0031,
    lng: 77.5643,
    keywords: ["mall", "malleshwaram", "sampige", "margosa"],
  },
  {
    title: "Electronic City Phase 1",
    subtitle: "Hosur Road Tech Corridor, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.8452,
    lng: 77.6602,
    keywords: ["elec", "ecity", "hosur road"],
  },
  {
    title: "Electronic City Phase 2",
    subtitle: "South Bengaluru, Karnataka",
    cityKey: "bengaluru",
    lat: 12.8406,
    lng: 77.6764,
    keywords: ["elec", "ecity"],
  },
  {
    title: "HSR Layout",
    subtitle: "Sector 1–7, South-East Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9121,
    lng: 77.6446,
    keywords: ["hsr", "27th main", "agara"],
  },
  {
    title: "BTM Layout 2nd Stage",
    subtitle: "Outer Ring Road & Udupi Garden, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9166,
    lng: 77.6101,
    keywords: ["btm", "udupi garden"],
  },
  {
    title: "MG Road",
    subtitle: "Central Business District, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9756,
    lng: 77.6066,
    keywords: ["mg", "mahatma gandhi", "metro", "brigade"],
  },
  {
    title: "Brigade Road",
    subtitle: "Shanthala Nagar, Ashok Nagar, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9716,
    lng: 77.607,
    keywords: ["brigade", "church street"],
  },
  {
    title: "Marathahalli",
    subtitle: "Outer Ring Road Junction, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9591,
    lng: 77.6974,
    keywords: ["mara", "marathahalli", "orr"],
  },
  {
    title: "Bellandur",
    subtitle: "Outer Ring Road, South-East Bengaluru",
    cityKey: "bengaluru",
    lat: 12.926,
    lng: 77.6762,
    keywords: ["bella", "ecospace", "orr"],
  },
  {
    title: "Hebbal",
    subtitle: "Hebbal Flyover & Bellary Rd, North Bengaluru",
    cityKey: "bengaluru",
    lat: 13.0358,
    lng: 77.597,
    keywords: ["hebbal", "airport road", "flyover"],
  },
  {
    title: "Yelahanka",
    subtitle: "New Town, North Bengaluru",
    cityKey: "bengaluru",
    lat: 13.1007,
    lng: 77.5963,
    keywords: ["yela", "yelahanka"],
  },
  {
    title: "Banashankari",
    subtitle: "BSK 2nd & 3rd Stage, South Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9255,
    lng: 77.5468,
    keywords: ["bana", "bsk", "banashankari"],
  },
  {
    title: "Basavanagudi",
    subtitle: "Gandhi Bazaar & Bull Temple Rd, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9406,
    lng: 77.5738,
    keywords: ["basa", "gandhi bazaar", "lalbagh"],
  },
  {
    title: "JP Nagar",
    subtitle: "Jaya Prakash Nagar, South Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9063,
    lng: 77.5857,
    keywords: ["jp", "jaya prakash"],
  },
  {
    title: "Vijayanagar",
    subtitle: "Chord Road, West Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9719,
    lng: 77.533,
    keywords: ["vijaya", "chord road"],
  },
  {
    title: "Majestic / Kempegowda Bus Stand",
    subtitle: "Gandhinagar, Central Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9767,
    lng: 77.5713,
    keywords: ["majestic", "kempegowda", "railway"],
  },
  {
    title: "Yeshwanthpur",
    subtitle: "Tumkur Road & Metro Hub, Bengaluru",
    cityKey: "bengaluru",
    lat: 13.025,
    lng: 77.534,
    keywords: ["yesh", "tumkur road"],
  },
  {
    title: "KR Puram",
    subtitle: "Old Madras Road, East Bengaluru",
    cityKey: "bengaluru",
    lat: 13.0012,
    lng: 77.6961,
    keywords: ["kr puram", "tin factory", "old madras"],
  },
  {
    title: "Silk Board Junction",
    subtitle: "Outer Ring Rd & Hosur Rd, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9177,
    lng: 77.6238,
    keywords: ["silk board", "madiwala"],
  },
  {
    title: "Sarjapur Road",
    subtitle: "Bellandur Gate to Dommasandra, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9102,
    lng: 77.6845,
    keywords: ["sarjapur", "kaikondrahalli"],
  },
  {
    title: "Bannerghatta Road",
    subtitle: "Arekere & Bilekahalli, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.8891,
    lng: 77.5973,
    keywords: ["banner", "bg road", "arekere"],
  },
  {
    title: "Domlur",
    subtitle: "Intermediate Ring Road, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9609,
    lng: 77.6387,
    keywords: ["domlur", "egl"],
  },
  {
    title: "Ulsoor (Halasuru)",
    subtitle: "Ulsoor Lake & Cambridge Layout, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9817,
    lng: 77.6286,
    keywords: ["ulsoor", "halasuru"],
  },
  {
    title: "Sadashivanagar",
    subtitle: "Sankey Tank & Mekhri Circle, Bengaluru",
    cityKey: "bengaluru",
    lat: 13.0068,
    lng: 77.5813,
    keywords: ["sadashiva", "sankey", "mekhri"],
  },
  {
    title: "Shivajinagar",
    subtitle: "Russell Market & Commercial Street, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9857,
    lng: 77.6057,
    keywords: ["shivaji", "commercial street"],
  },
  {
    title: "RT Nagar",
    subtitle: "Rabindranath Tagore Nagar, North Bengaluru",
    cityKey: "bengaluru",
    lat: 13.0247,
    lng: 77.5948,
    keywords: ["rt nagar", "ganganagar"],
  },
  {
    title: "Peenya Industrial Area",
    subtitle: "Tumkur Road, West Bengaluru",
    cityKey: "bengaluru",
    lat: 13.0285,
    lng: 77.5197,
    keywords: ["peenya", "dasarahalli"],
  },
  {
    title: "Kundalahalli",
    subtitle: "Brookefield & AECS Layout, Bengaluru",
    cityKey: "bengaluru",
    lat: 12.9667,
    lng: 77.7167,
    keywords: ["kundala", "brookefield", "aecs"],
  },
  // Other major Indian cities for settings support
  {
    title: "Gokulam",
    subtitle: "Mysuru, Karnataka",
    cityKey: "mysuru",
    lat: 12.3264,
    lng: 76.6251,
  },
  {
    title: "Vijayanagar, Mysuru",
    subtitle: "Mysuru, Karnataka",
    cityKey: "mysuru",
    lat: 12.3335,
    lng: 76.6122,
  },
  {
    title: "Bandra West",
    subtitle: "Mumbai, Maharashtra",
    cityKey: "mumbai",
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    title: "Andheri West",
    subtitle: "Mumbai, Maharashtra",
    cityKey: "mumbai",
    lat: 19.1363,
    lng: 72.8277,
  },
  {
    title: "Kothrud",
    subtitle: "Pune, Maharashtra",
    cityKey: "pune",
    lat: 18.5074,
    lng: 73.8077,
  },
  {
    title: "Connaught Place",
    subtitle: "New Delhi, Delhi",
    cityKey: "delhi",
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    title: "Banjara Hills",
    subtitle: "Hyderabad, Telangana",
    cityKey: "hyderabad",
    lat: 17.4156,
    lng: 78.4347,
  },
  {
    title: "T. Nagar",
    subtitle: "Chennai, Tamil Nadu",
    cityKey: "chennai",
    lat: 13.0418,
    lng: 80.2341,
  },
];

export function searchLocalIndianLocations(
  query: string,
  city: string
): LocationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const cityLower = city.toLowerCase();
  const activeCityKey = cityLower.split(",")[0]?.trim() || "bengaluru";

  const scored: Array<{ place: CuratedPlace; score: number }> = [];

  for (const place of CURATED_INDIAN_LOCATIONS) {
    const titleLower = place.title.toLowerCase();
    const subLower = place.subtitle.toLowerCase();
    const kwText = (place.keywords || []).join(" ").toLowerCase();

    let score = 0;
    if (titleLower.startsWith(q)) score += 100;
    else if (titleLower.includes(q)) score += 65;
    else if (kwText.includes(q)) score += 50;
    else if (subLower.includes(q)) score += 30;

    if (score === 0) continue;

    if (
      place.cityKey === activeCityKey ||
      activeCityKey.includes(place.cityKey)
    ) {
      score += 25;
    }

    scored.push({ place, score });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 6).map(({ place }) => {
    const cityShort = place.subtitle.includes("Bengaluru")
      ? "Bengaluru"
      : place.subtitle.split(",")[0];
    const fullAddress = place.title.toLowerCase().includes(cityShort.toLowerCase())
      ? place.title
      : `${place.title}, ${cityShort}`;

    return {
      id: `local-${place.title.toLowerCase().replace(/\s+/g, "-")}`,
      title: place.title,
      subtitle: place.subtitle,
      fullAddress,
      lat: place.lat,
      lng: place.lng,
      source: "local",
    };
  });
}
