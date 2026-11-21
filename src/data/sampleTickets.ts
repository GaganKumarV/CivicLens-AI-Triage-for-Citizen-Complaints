import { Ticket } from "../types/civic";

function daysAgoIso(daysAgo: number, hoursBack = 2): string {
  const ms = Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursBack * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

export function createSampleTickets(): Ticket[] {
  return [
    {
      id: "BLR-DEMO-1001",
      citizenName: "Raghavendra Rao",
      description:
        "Deep and dangerous pothole right near Jayanagar 4th Block bus stop. Two-wheelers are skidding at night and traffic backs up heavily during peak hours.",
      summary: "Dangerous pothole causing two-wheeler hazard near Jayanagar 4th Block",
      location: "11th Main Rd, Jayanagar 4th Block, Bengaluru",
      coordinates: { lat: 12.9279, lng: 77.5835 },
      category: "Roads & Potholes",
      severity: "Critical",
      severityReason:
        "Deep pothole on an active arterial bus corridor poses an immediate accident risk to commuters.",
      department: "Road Maintenance Department",
      status: "Pending",
      detectedLanguage: "English",
      reportedLanguage: "en",
      createdAt: daysAgoIso(0, 8),
      updatedAt: daysAgoIso(0, 8),
      analysisMode: "DEMO_MODE",
      isDemo: true,
      city: "Bengaluru, Karnataka, India",
    },
    {
      id: "BLR-DEMO-1002",
      citizenName: "Ananya Deshpande",
      description:
        "Overflowing garbage bin and uncollected wet waste dumped along the corner of 12th Main, Rajajinagar 2nd Block for four days. Foul smell and stray dogs gathering near the school gate.",
      summary: "Overflowing garbage dump near school gate in Rajajinagar 2nd Block",
      location: "12th Main Rd, Rajajinagar 2nd Block, Bengaluru",
      coordinates: { lat: 12.9982, lng: 77.553 },
      category: "Garbage & Waste",
      severity: "High",
      severityReason:
        "Four-day waste accumulation adjacent to a school poses an urgent public sanitation and health hazard.",
      department: "Solid Waste Management Department",
      status: "Pending",
      detectedLanguage: "English",
      reportedLanguage: "en",
      createdAt: daysAgoIso(1, 9),
      updatedAt: daysAgoIso(1, 9),
      analysisMode: "DEMO_MODE",
      isDemo: true,
      city: "Bengaluru, Karnataka, India",
    },
    {
      id: "BLR-DEMO-1003",
      citizenName: "Karthik Nair",
      description:
        "Continuous clean drinking water pipeline leakage flooding ITPL Main Road near Whitefield Hope Farm Junction since morning. Heavy water wastage and slippery asphalt.",
      summary: "Major drinking water pipeline leakage near Whitefield Hope Farm",
      location: "ITPL Main Rd, Hope Farm Junction, Whitefield, Bengaluru",
      coordinates: { lat: 12.9838, lng: 77.7528 },
      category: "Water Supply",
      severity: "High",
      severityReason:
        "Continuous pressurized main leakage wastes municipal drinking water and disrupts a major arterial junction.",
      department: "Water Supply Department",
      status: "In Progress",
      detectedLanguage: "English",
      reportedLanguage: "en",
      createdAt: daysAgoIso(2, 11),
      updatedAt: daysAgoIso(1, 16),
      analysisMode: "DEMO_MODE",
      isDemo: true,
      city: "Bengaluru, Karnataka, India",
    },
    {
      id: "BLR-DEMO-1004",
      citizenName: "Priya Sharma",
      description:
        "Three consecutive LED streetlights are completely dead along 2nd Cross, Electronic City Phase 1 near Infosys Gate 2. Evening pedestrians face total darkness.",
      summary: "Broken streetlight stretch causing dark corridor in Electronic City Phase 1",
      location: "2nd Cross, Electronic City Phase 1, Bengaluru",
      coordinates: { lat: 12.8452, lng: 77.6602 },
      category: "Electricity & Streetlights",
      severity: "Medium",
      severityReason:
        "Outage of multiple streetlights reduces pedestrian visibility and safety after dusk.",
      department: "Electrical Department",
      status: "Pending",
      detectedLanguage: "English",
      reportedLanguage: "en",
      createdAt: daysAgoIso(3, 19),
      updatedAt: daysAgoIso(3, 19),
      analysisMode: "DEMO_MODE",
      isDemo: true,
      city: "Bengaluru, Karnataka, India",
    },
    {
      id: "BLR-DEMO-1005",
      citizenName: "Suresh Gowda",
      description:
        "Stormwater drain completely blocked near 80 Feet Road, Koramangala 4th Block. Sewage water is overflowing onto the footpath and entering ground-floor shops.",
      summary: "Blocked drain causing sewage overflow on 80 Feet Road, Koramangala",
      location: "80 Feet Rd, Koramangala 4th Block, Bengaluru",
      coordinates: { lat: 12.9352, lng: 77.6245 },
      category: "Drainage & Sewage",
      severity: "Critical",
      severityReason:
        "Raw sewage backflow onto pedestrian paths and commercial interiors creates an acute contamination risk.",
      department: "Drainage Department",
      status: "In Progress",
      detectedLanguage: "English",
      reportedLanguage: "en",
      createdAt: daysAgoIso(4, 14),
      updatedAt: daysAgoIso(2, 10),
      analysisMode: "DEMO_MODE",
      isDemo: true,
      city: "Bengaluru, Karnataka, India",
    },
    {
      id: "BLR-DEMO-1006",
      citizenName: "Meera Krishnan",
      description:
        "Large rain tree branch fell across 100 Feet Road near Indiranagar Metro Station after last night's storm, blocking one lane of traffic.",
      summary: "Fallen tree branch obstructing 100 Feet Road near Indiranagar Metro",
      location: "100 Feet Rd, Indiranagar, Bengaluru",
      coordinates: { lat: 12.9784, lng: 77.6408 },
      category: "Trees & Public Greenery",
      severity: "High",
      severityReason:
        "Fallen tree debris obstructing an active metro arterial road requires rapid clearance.",
      department: "Parks & Horticulture Department",
      status: "Resolved",
      detectedLanguage: "English",
      reportedLanguage: "en",
      createdAt: daysAgoIso(5, 7),
      updatedAt: daysAgoIso(4, 15),
      analysisMode: "DEMO_MODE",
      isDemo: true,
      city: "Bengaluru, Karnataka, India",
    },
  ];
}
