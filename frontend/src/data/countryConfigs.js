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
  }
};
