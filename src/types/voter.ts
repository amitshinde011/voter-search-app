export interface Voter {
  id: number;
  ward: string;
  booth_no: string;
  sr_no: string;
  name: string;
  voter_card_no: string;
  address: string;
  voting_center: string;
  house_no: string;
  age_gender: string;
  color_code: string;
  mobile1: string;
  mobile2: string;
  new_address: string;
  village: string;
  voted: string;
  community: string;
  extra_info2: string;
  area: string;
  resident_type: string;
  extra_info5: string;
  email: string;
  complaint: string;
  society: string;
  extra_check1: string;
  extra_check2: string;
  printed: string;
  family_id: string;
  assembly_no: string;
}

export interface SearchFilters {
  query: string;
  ward: string;
  booth_no: string;
  gender: string;
  voted: string;
}

export interface BluetoothDevice {
  name: string;
  address: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors: string[];
}

/** Maps CSV header (Marathi) to database column name */
export const CSV_HEADER_MAP: Record<string, keyof Omit<Voter, 'id'>> = {
  'प्रभाग': 'ward',
  'बूथ नं': 'booth_no',
  'अक्र': 'sr_no',
  'नाव': 'name',
  'मतदान कार्ड': 'voter_card_no',
  'पत्ता': 'address',
  'मतदान केंद्र': 'voting_center',
  'घर क्र': 'house_no',
  'वय/लिंग': 'age_gender',
  'रंग': 'color_code',
  'मोबाइल - 1': 'mobile1',
  'मोबाइल - 2': 'mobile2',
  'नवीन पत्ता': 'new_address',
  'गाव': 'village',
  'वोटेड': 'voted',
  'समुदाय (Community) गट': 'community',
  'अधिक माहिती-2': 'extra_info2',
  'क्षेत्र (Area)': 'area',
  'निवासी प्रकार': 'resident_type',
  'अधिक माहिती-5': 'extra_info5',
  'ई मेल': 'email',
  'तक्रार': 'complaint',
  'सोसायटी': 'society',
  'अधिक चेक-1': 'extra_check1',
  'अधिक चेक-2': 'extra_check2',
  'printed': 'printed',
  'कुटुंब': 'family_id',
  'विधानसभा क्र': 'assembly_no',
};

export const DB_COLUMNS = [
  'ward', 'booth_no', 'sr_no', 'name', 'voter_card_no', 'address',
  'voting_center', 'house_no', 'age_gender', 'color_code', 'mobile1',
  'mobile2', 'new_address', 'village', 'voted', 'community', 'extra_info2',
  'area', 'resident_type', 'extra_info5', 'email', 'complaint', 'society',
  'extra_check1', 'extra_check2', 'printed', 'family_id', 'assembly_no',
] as const;
