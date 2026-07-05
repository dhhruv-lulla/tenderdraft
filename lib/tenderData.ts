// Every "unknown" field is represented as an empty string ("") or empty array,
// never `null`. This isn't just a style choice: Claude's structured-output
// schema compiler caps the number of union-typed (e.g. nullable) parameters
// per schema at 16, and this schema has far more optional fields than that.
// Using a single required type per field (with "" as the "not found" sentinel)
// keeps the schema union-free while preserving the same never-invent behavior
// - downstream code already treats an empty/whitespace string as "missing".

export interface TenderItem {
  itemName: string;
  description: string;
  make: string;
  model: string;
  quantity: string;
  unit: string;
  specifications: string[];
}

export interface SpecialConditionFlag {
  present: boolean;
  sourceQuote: string;
}

export interface BuyerAddedTerm {
  term: string;
  category: string;
}

export interface TenderData {
  buyerOrganisation: string;
  department: string;
  ministry: string;
  buyerAddress: string;
  consignee: string;
  bidNumber: string;
  bidTitle: string;
  bidPublishDate: string;
  bidOpeningDate: string;
  bidEndDate: string;
  deliveryPeriod: string;
  category: string;
  totalQuantity: string;
  emd: { required: boolean; amount: string; exemptionNote: string };
  epbg: { required: boolean; percentage: string; durationMonths: string };
  msePreference: { applicable: boolean; note: string };
  miiPreference: { applicable: boolean; note: string };
  evaluationMethod: string;
  paymentTerms: string;
  scopeOfSupply: string;
  items: TenderItem[];
  documentsRequired: string[];
  buyerAddedTerms: BuyerAddedTerm[];
  specialConditions: {
    oemDealershipRequired: SpecialConditionFlag;
    brandRegistrationRequired: SpecialConditionFlag;
    oneBidderOneBid: SpecialConditionFlag;
    manufacturerOnlyMsePreference: SpecialConditionFlag;
  };
}

const str = (description?: string) =>
  ({ type: "string", ...(description ? { description } : {}) }) as const;

const flagSchema = {
  type: "object",
  additionalProperties: false,
  required: ["present", "sourceQuote"],
  properties: {
    present: { type: "boolean" },
    sourceQuote: str(
      "Verbatim tender text that establishes this condition. Empty string if the condition is not present. Do not paraphrase or invent."
    ),
  },
} as const;

export const TENDER_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "buyerOrganisation",
    "department",
    "ministry",
    "buyerAddress",
    "consignee",
    "bidNumber",
    "bidTitle",
    "bidPublishDate",
    "bidOpeningDate",
    "bidEndDate",
    "deliveryPeriod",
    "category",
    "totalQuantity",
    "emd",
    "epbg",
    "msePreference",
    "miiPreference",
    "evaluationMethod",
    "paymentTerms",
    "scopeOfSupply",
    "items",
    "documentsRequired",
    "buyerAddedTerms",
    "specialConditions",
  ],
  properties: {
    buyerOrganisation: str("Empty string if not stated in the tender - never guess."),
    department: str("Empty string if not stated in the tender - never guess."),
    ministry: str("Empty string if not stated in the tender - never guess."),
    buyerAddress: str("Empty string if not stated in the tender - never guess."),
    consignee: str("Empty string if not stated in the tender - never guess."),
    bidNumber: str("Empty string if not stated in the tender - never guess."),
    bidTitle: str("Empty string if not stated in the tender - never guess."),
    bidPublishDate: str("Empty string if not stated in the tender - never guess."),
    bidOpeningDate: str("Empty string if not stated in the tender - never guess."),
    bidEndDate: str(
      "Bid submission deadline. Use ISO 8601 (YYYY-MM-DD) if a concrete date is present in the tender, otherwise the verbatim string. Empty string if not stated - never guess."
    ),
    deliveryPeriod: str("Empty string if not stated in the tender - never guess."),
    category: str("Empty string if not stated in the tender - never guess."),
    totalQuantity: str("Empty string if not stated in the tender - never guess."),
    emd: {
      type: "object",
      additionalProperties: false,
      required: ["required", "amount", "exemptionNote"],
      properties: {
        required: { type: "boolean" },
        amount: str("Empty string if not stated."),
        exemptionNote: str("Empty string if not stated."),
      },
    },
    epbg: {
      type: "object",
      additionalProperties: false,
      required: ["required", "percentage", "durationMonths"],
      properties: {
        required: { type: "boolean" },
        percentage: str("Empty string if not stated."),
        durationMonths: str("Empty string if not stated."),
      },
    },
    msePreference: {
      type: "object",
      additionalProperties: false,
      required: ["applicable", "note"],
      properties: {
        applicable: { type: "boolean" },
        note: str("Empty string if not stated."),
      },
    },
    miiPreference: {
      type: "object",
      additionalProperties: false,
      required: ["applicable", "note"],
      properties: {
        applicable: { type: "boolean" },
        note: str("Empty string if not stated."),
      },
    },
    evaluationMethod: str("Empty string if not stated in the tender - never guess."),
    paymentTerms: str("Empty string if not stated in the tender - never guess."),
    scopeOfSupply: str("Empty string if not stated in the tender - never guess."),
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["itemName", "description", "make", "model", "quantity", "unit", "specifications"],
        properties: {
          itemName: str(),
          description: str(),
          make: str("Empty string if not stated."),
          model: str("Empty string if not stated."),
          quantity: str("Empty string if not stated."),
          unit: str("Empty string if not stated."),
          specifications: { type: "array", items: { type: "string" } },
        },
      },
    },
    documentsRequired: { type: "array", items: { type: "string" } },
    buyerAddedTerms: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "category"],
        properties: {
          term: str(),
          category: str("Empty string if not stated."),
        },
      },
    },
    specialConditions: {
      type: "object",
      additionalProperties: false,
      required: [
        "oemDealershipRequired",
        "brandRegistrationRequired",
        "oneBidderOneBid",
        "manufacturerOnlyMsePreference",
      ],
      properties: {
        oemDealershipRequired: flagSchema,
        brandRegistrationRequired: flagSchema,
        oneBidderOneBid: flagSchema,
        manufacturerOnlyMsePreference: flagSchema,
      },
    },
  },
} as const;

export const emptyTenderData: TenderData = {
  buyerOrganisation: "",
  department: "",
  ministry: "",
  buyerAddress: "",
  consignee: "",
  bidNumber: "",
  bidTitle: "",
  bidPublishDate: "",
  bidOpeningDate: "",
  bidEndDate: "",
  deliveryPeriod: "",
  category: "",
  totalQuantity: "",
  emd: { required: false, amount: "", exemptionNote: "" },
  epbg: { required: false, percentage: "", durationMonths: "" },
  msePreference: { applicable: false, note: "" },
  miiPreference: { applicable: false, note: "" },
  evaluationMethod: "",
  paymentTerms: "",
  scopeOfSupply: "",
  items: [],
  documentsRequired: [],
  buyerAddedTerms: [],
  specialConditions: {
    oemDealershipRequired: { present: false, sourceQuote: "" },
    brandRegistrationRequired: { present: false, sourceQuote: "" },
    oneBidderOneBid: { present: false, sourceQuote: "" },
    manufacturerOnlyMsePreference: { present: false, sourceQuote: "" },
  },
};
