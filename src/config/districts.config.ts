export interface District {
  code: string;
  name: string;
  regulated: boolean; // 규제지역 여부
  landTransactionPermit: boolean; // 토지거래허가구역 여부
}

export const DISTRICTS: District[] = [
  { code: 'gangnam', name: '강남구', regulated: true, landTransactionPermit: true },
  { code: 'seocho', name: '서초구', regulated: true, landTransactionPermit: true },
  { code: 'songpa', name: '송파구', regulated: true, landTransactionPermit: true },
  { code: 'yongsan', name: '용산구', regulated: true, landTransactionPermit: true },
  { code: 'mapo', name: '마포구', regulated: false, landTransactionPermit: false },
  { code: 'seongdong', name: '성동구', regulated: false, landTransactionPermit: false },
  { code: 'nowon', name: '노원구', regulated: false, landTransactionPermit: false },
  { code: 'etc', name: '기타(비규제)', regulated: false, landTransactionPermit: false },
];

export function getDistrict(code: string): District {
  return DISTRICTS.find((d) => d.code === code) ?? DISTRICTS[DISTRICTS.length - 1];
}
