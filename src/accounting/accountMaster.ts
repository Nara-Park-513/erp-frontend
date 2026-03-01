// src/accounting/accountMaster.ts

export type AccountCategory =
  | "SALES"        // 매출
  | "COGS"         // 매출원가
  | "SGNA"         // 판매관리비
  | "NON_OP_IN"    // 영업외수익
  | "NON_OP_OUT"   // 영업외비용
  | "ASSET"        // 자산(현금/예금 등)
  | "LIAB"         // 부채(지급어음 등)
  | "EQUITY"       // 자본
  | "OTHER";

export type DcType = "DEBIT" | "CREDIT";

export type AccountMaster = {
  accountCode: string;         // 예: 1010, 2110, 4100 ...
  accountName: string;         // 예: 현금, 지급어음, 상품매출 ...
  category: AccountCategory;   // 손익/재무 분류
  defaultDcType?: DcType;      // 전표 입력 편의(선택)
};

/**
 * ✅ 임시 마스터 (백엔드 없으니 여기서 시작)
 * - 회사 계정체계에 맞게 여기만 늘리면 됨
 * - 2자리 "41" 같은 걸 쓰는 경우도 있으니, 필요하면 4100/4110 대신 41로도 등록 가능
 */
export const ACCOUNTS: AccountMaster[] = [
  // --- 자산 ---
  { accountCode: "1010", accountName: "현금", category: "ASSET", defaultDcType: "DEBIT" },
  { accountCode: "1020", accountName: "보통예금", category: "ASSET", defaultDcType: "DEBIT" },
  { accountCode: "1030", accountName: "당좌예금", category: "ASSET", defaultDcType: "DEBIT" },

  // --- 부채 ---
  { accountCode: "2110", accountName: "지급어음", category: "LIAB", defaultDcType: "CREDIT" },

  // --- 매출 ---
  { accountCode: "4100", accountName: "상품매출", category: "SALES", defaultDcType: "CREDIT" },

  // --- 매출원가 ---
  { accountCode: "5100", accountName: "매출원가", category: "COGS", defaultDcType: "DEBIT" },

  // --- 판관비 ---
  { accountCode: "5200", accountName: "판매관리비", category: "SGNA", defaultDcType: "DEBIT" },

  // --- 영업외 ---
  { accountCode: "7100", accountName: "영업외수익", category: "NON_OP_IN", defaultDcType: "CREDIT" },
  { accountCode: "7200", accountName: "영업외비용", category: "NON_OP_OUT", defaultDcType: "DEBIT" },
];

// 빠른 조회용 맵
const byCode = new Map(ACCOUNTS.map((a) => [a.accountCode, a]));

/** 코드로 계정 찾기 */
export const findAccount = (code?: string | null) => {
  const c = String(code ?? "").trim();
  return byCode.get(c);
};

/**
 * ✅ fallback 분류: category가 저장 안 돼도 코드로 판별
 * - 너가 "41"처럼 2자리 쓰더라도 startsWith로 잡힘
 */
export const categoryByCode = (code?: string | null): AccountCategory => {
  const c = String(code ?? "").trim();
  if (!c) return "OTHER";

  // 마스터에 정확히 있으면 우선
  const exact = findAccount(c);
  if (exact) return exact.category;

  // 없으면 prefix로 대충 분류 (보편적인 방식)
  if (c.startsWith("41")) return "SALES";
  if (c.startsWith("51")) return "COGS";
  if (c.startsWith("52")) return "SGNA";
  if (c.startsWith("71")) return "NON_OP_IN";
  if (c.startsWith("72")) return "NON_OP_OUT";

  if (c.startsWith("10")) return "ASSET";
  if (c.startsWith("21")) return "LIAB";

  return "OTHER";
};