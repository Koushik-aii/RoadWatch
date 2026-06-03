export const COUNTRY_CONFIGS = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    road_type_map: {
      NH: 'National Highway',
      SH: 'State Highway',
      MDR: 'Major District Road',
      ODR: 'Other District Road',
      VR: 'Village Road',
      Urban: 'Urban Road'
    },
    authority_levels: ['NHAI', 'State PWD EE', 'PMGSY PIU', 'Municipal Corp'],
    budget_source: 'PMGSY / MoRTH / State PWD',
    complaint_endpoint: 'Email to EE / online portal',
    currency: '₹',
    currency_code: 'INR',
    national_default_authority: {
      authority_name: 'National Highways Authority of India (NHAI)',
      designation: 'Regional Officer',
      email: 'complaints@nhai.gov.in',
      phone: '1800-11-6062',
      complaint_portal: 'https://pgportal.gov.in/',
      escalation: 'Chief General Manager, NHAI',
    },
    district_centroids: [
      { name: 'Krishna',          state: 'Andhra Pradesh', lat: 16.57, lng: 80.65 },
      { name: 'Guntur',           state: 'Andhra Pradesh', lat: 16.31, lng: 80.44 },
      { name: 'Visakhapatnam',    state: 'Andhra Pradesh', lat: 17.69, lng: 83.22 },
      { name: 'Hyderabad',        state: 'Telangana', lat: 17.38, lng: 78.47 },
      { name: 'Delhi',            state: 'Delhi', lat: 28.70, lng: 77.10 },
      { name: 'Mumbai',           state: 'Maharashtra', lat: 19.07, lng: 72.87 }
    ]
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    road_type_map: {
      Motorway: 'Motorway',
      A_road: 'A-road',
      B_road: 'B-road',
      Unclassified: 'Unclassified road',
      Urban: 'Urban Road'
    },
    authority_levels: ['National Highways', 'Highways England', 'Local Council'],
    budget_source: 'DfT / Highways England capital allocation',
    complaint_endpoint: 'FixMyStreet API / council email',
    currency: '£',
    currency_code: 'GBP',
    national_default_authority: {
      authority_name: 'Highways England',
      designation: 'Customer Contact Centre',
      email: 'info@highwaysengland.co.uk',
      phone: '0300 123 5000',
      complaint_portal: 'https://report.nationalhighways.co.uk/',
      escalation: 'Regional Director, National Highways',
    },
    district_centroids: [
      { name: 'London',           state: 'England', lat: 51.50, lng: -0.12 },
      { name: 'Manchester',       state: 'England', lat: 53.48, lng: -2.24 },
      { name: 'Birmingham',       state: 'England', lat: 52.48, lng: -1.89 }
    ]
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    road_type_map: {
      Interstate: 'Interstate Highway',
      US_Highway: 'US Highway',
      State_Route: 'State Route',
      County_Road: 'County Road',
      Local: 'Local Street'
    },
    authority_levels: ['Federal Highway Administration', 'State DOT', 'County Public Works', 'City Council'],
    budget_source: 'Highway Trust Fund / State DOT',
    complaint_endpoint: 'State DOT / Local 311',
    currency: '$',
    currency_code: 'USD',
    national_default_authority: {
      authority_name: 'Federal Highway Administration (FHWA)',
      designation: 'Division Administrator',
      email: 'ExecSecretariat@dot.gov',
      phone: '202-366-4000',
      complaint_portal: 'https://highways.dot.gov/',
      escalation: 'Secretary of Transportation',
    },
    district_centroids: [
      { name: 'Los Angeles',      state: 'California', lat: 34.05, lng: -118.24 },
      { name: 'New York',         state: 'New York', lat: 40.71, lng: -74.00 },
      { name: 'Chicago',          state: 'Illinois', lat: 41.87, lng: -87.62 },
      { name: 'Houston',          state: 'Texas', lat: 29.76, lng: -95.36 },
      { name: 'Phoenix',          state: 'Arizona', lat: 33.44, lng: -112.07 }
    ]
  }
};
