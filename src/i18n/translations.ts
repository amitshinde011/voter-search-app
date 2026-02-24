export type Language = 'mr' | 'en';

export interface TranslationStrings {
  // App
  appName: string;
  // Tabs
  tabSearch: string;
  tabImport: string;
  tabSettings: string;
  // Search screen
  searchPlaceholder: string;
  searchTitle: string;
  advancedFilters: string;
  allWards: string;
  allBooths: string;
  allGenders: string;
  male: string;
  female: string;
  allVotedStatus: string;
  votedYes: string;
  votedNo: string;
  resultsCount: string;
  noResults: string;
  noResultsHint: string;
  noData: string;
  noDataHint: string;
  clearFilters: string;
  // Voter fields
  fieldWard: string;
  fieldBoothNo: string;
  fieldSrNo: string;
  fieldName: string;
  fieldVoterCard: string;
  fieldAddress: string;
  fieldVotingCenter: string;
  fieldHouseNo: string;
  fieldAgeGender: string;
  fieldColor: string;
  fieldMobile1: string;
  fieldMobile2: string;
  fieldNewAddress: string;
  fieldVillage: string;
  fieldVoted: string;
  fieldCommunity: string;
  fieldExtraInfo2: string;
  fieldArea: string;
  fieldResidentType: string;
  fieldExtraInfo5: string;
  fieldEmail: string;
  fieldComplaint: string;
  fieldSociety: string;
  fieldExtraCheck1: string;
  fieldExtraCheck2: string;
  fieldPrinted: string;
  fieldFamilyId: string;
  fieldAssemblyNo: string;
  // Import screen
  importTitle: string;
  importDescription: string;
  selectFile: string;
  importing: string;
  importSuccess: string;
  importError: string;
  importedRows: string;
  totalRecords: string;
  clearDatabase: string;
  clearDatabaseConfirm: string;
  clearDatabaseSuccess: string;
  cancel: string;
  confirm: string;
  fileSelected: string;
  replaceData: string;
  appendData: string;
  importMode: string;
  // Settings screen
  settingsTitle: string;
  language: string;
  printerSetup: string;
  scanPrinters: string;
  connectedPrinter: string;
  noPrinter: string;
  scanning: string;
  connecting: string;
  connected: string;
  disconnected: string;
  printMethod: string;
  systemPrint: string;
  bluetoothDirect: string;
  databaseInfo: string;
  about: string;
  version: string;
  // Print
  print: string;
  printing: string;
  printSuccess: string;
  printError: string;
  voterSlip: string;
  // Common
  close: string;
  ok: string;
  error: string;
  success: string;
  loading: string;
  ward: string;
  booth: string;
}

const mr: TranslationStrings = {
  appName: 'मतदार शोध',
  tabSearch: 'शोधा',
  tabImport: 'आयात',
  tabSettings: 'सेटिंग्ज',
  searchPlaceholder: 'नाव, मतदान कार्ड, पत्ता शोधा...',
  searchTitle: 'मतदार शोध',
  advancedFilters: 'अधिक फिल्टर',
  allWards: 'सर्व प्रभाग',
  allBooths: 'सर्व बूथ',
  allGenders: 'सर्व',
  male: 'पुरुष',
  female: 'स्त्री',
  allVotedStatus: 'सर्व',
  votedYes: 'होय',
  votedNo: 'नाही',
  resultsCount: 'एकूण निकाल',
  noResults: 'कोणतेही निकाल सापडले नाहीत',
  noResultsHint: 'शोध बदलून पहा',
  noData: 'डेटा उपलब्ध नाही',
  noDataHint: 'कृपया CSV फाइल आयात करा',
  clearFilters: 'फिल्टर साफ करा',
  fieldWard: 'प्रभाग',
  fieldBoothNo: 'बूथ नं',
  fieldSrNo: 'अक्र',
  fieldName: 'नाव',
  fieldVoterCard: 'मतदान कार्ड',
  fieldAddress: 'पत्ता',
  fieldVotingCenter: 'मतदान केंद्र',
  fieldHouseNo: 'घर क्र',
  fieldAgeGender: 'वय/लिंग',
  fieldColor: 'रंग',
  fieldMobile1: 'मोबाइल - 1',
  fieldMobile2: 'मोबाइल - 2',
  fieldNewAddress: 'नवीन पत्ता',
  fieldVillage: 'गाव',
  fieldVoted: 'वोटेड',
  fieldCommunity: 'समुदाय',
  fieldExtraInfo2: 'अधिक माहिती-2',
  fieldArea: 'क्षेत्र',
  fieldResidentType: 'निवासी प्रकार',
  fieldExtraInfo5: 'अधिक माहिती-5',
  fieldEmail: 'ई मेल',
  fieldComplaint: 'तक्रार',
  fieldSociety: 'सोसायटी',
  fieldExtraCheck1: 'अधिक चेक-1',
  fieldExtraCheck2: 'अधिक चेक-2',
  fieldPrinted: 'प्रिंटेड',
  fieldFamilyId: 'कुटुंब',
  fieldAssemblyNo: 'विधानसभा क्र',
  importTitle: 'CSV आयात',
  importDescription: 'मतदार यादी CSV फाइल निवडा आणि डेटा आयात करा',
  selectFile: 'CSV फाइल निवडा',
  importing: 'आयात करत आहे...',
  importSuccess: 'आयात यशस्वी!',
  importError: 'आयात अयशस्वी',
  importedRows: 'आयात केलेल्या नोंदी',
  totalRecords: 'एकूण नोंदी',
  clearDatabase: 'डेटा हटवा',
  clearDatabaseConfirm: 'तुम्हाला सर्व मतदार डेटा हटवायचा आहे का?',
  clearDatabaseSuccess: 'सर्व डेटा हटवला',
  cancel: 'रद्द करा',
  confirm: 'पुष्टी करा',
  fileSelected: 'फाइल निवडली',
  replaceData: 'बदला (जुना डेटा हटवा)',
  appendData: 'जोडा (विद्यमान डेटात)',
  importMode: 'आयात पद्धत',
  settingsTitle: 'सेटिंग्ज',
  language: 'भाषा',
  printerSetup: 'प्रिंटर सेटअप',
  scanPrinters: 'प्रिंटर शोधा',
  connectedPrinter: 'कनेक्ट प्रिंटर',
  noPrinter: 'कोणताही प्रिंटर कनेक्ट नाही',
  scanning: 'शोधत आहे...',
  connecting: 'कनेक्ट करत आहे...',
  connected: 'कनेक्ट',
  disconnected: 'डिस्कनेक्ट',
  printMethod: 'प्रिंट पद्धत',
  systemPrint: 'सिस्टम प्रिंट',
  bluetoothDirect: 'ब्लूटूथ डायरेक्ट',
  databaseInfo: 'डेटाबेस माहिती',
  about: 'बद्दल',
  version: 'आवृत्ती',
  print: 'प्रिंट',
  printing: 'प्रिंट करत आहे...',
  printSuccess: 'प्रिंट यशस्वी!',
  printError: 'प्रिंट अयशस्वी',
  voterSlip: 'मतदार स्लिप',
  close: 'बंद',
  ok: 'ठीक',
  error: 'त्रुटी',
  success: 'यशस्वी',
  loading: 'लोड करत आहे...',
  ward: 'प्रभाग',
  booth: 'बूथ',
};

const en: TranslationStrings = {
  appName: 'Voter Search',
  tabSearch: 'Search',
  tabImport: 'Import',
  tabSettings: 'Settings',
  searchPlaceholder: 'Search name, voter card, address...',
  searchTitle: 'Voter Search',
  advancedFilters: 'Advanced Filters',
  allWards: 'All Wards',
  allBooths: 'All Booths',
  allGenders: 'All',
  male: 'Male',
  female: 'Female',
  allVotedStatus: 'All',
  votedYes: 'Yes',
  votedNo: 'No',
  resultsCount: 'Total Results',
  noResults: 'No results found',
  noResultsHint: 'Try changing your search',
  noData: 'No data available',
  noDataHint: 'Please import a CSV file first',
  clearFilters: 'Clear Filters',
  fieldWard: 'Ward',
  fieldBoothNo: 'Booth No',
  fieldSrNo: 'Sr. No',
  fieldName: 'Name',
  fieldVoterCard: 'Voter Card',
  fieldAddress: 'Address',
  fieldVotingCenter: 'Voting Center',
  fieldHouseNo: 'House No',
  fieldAgeGender: 'Age/Gender',
  fieldColor: 'Color',
  fieldMobile1: 'Mobile 1',
  fieldMobile2: 'Mobile 2',
  fieldNewAddress: 'New Address',
  fieldVillage: 'Village',
  fieldVoted: 'Voted',
  fieldCommunity: 'Community',
  fieldExtraInfo2: 'Extra Info 2',
  fieldArea: 'Area',
  fieldResidentType: 'Resident Type',
  fieldExtraInfo5: 'Extra Info 5',
  fieldEmail: 'Email',
  fieldComplaint: 'Complaint',
  fieldSociety: 'Society',
  fieldExtraCheck1: 'Extra Check 1',
  fieldExtraCheck2: 'Extra Check 2',
  fieldPrinted: 'Printed',
  fieldFamilyId: 'Family ID',
  fieldAssemblyNo: 'Assembly No',
  importTitle: 'Import CSV',
  importDescription: 'Select a voter list CSV file and import the data',
  selectFile: 'Select CSV File',
  importing: 'Importing...',
  importSuccess: 'Import successful!',
  importError: 'Import failed',
  importedRows: 'Imported records',
  totalRecords: 'Total Records',
  clearDatabase: 'Clear Data',
  clearDatabaseConfirm: 'Are you sure you want to delete all voter data?',
  clearDatabaseSuccess: 'All data cleared',
  cancel: 'Cancel',
  confirm: 'Confirm',
  fileSelected: 'File selected',
  replaceData: 'Replace (delete old data)',
  appendData: 'Append (add to existing)',
  importMode: 'Import Mode',
  settingsTitle: 'Settings',
  language: 'Language',
  printerSetup: 'Printer Setup',
  scanPrinters: 'Scan for Printers',
  connectedPrinter: 'Connected Printer',
  noPrinter: 'No printer connected',
  scanning: 'Scanning...',
  connecting: 'Connecting...',
  connected: 'Connected',
  disconnected: 'Disconnected',
  printMethod: 'Print Method',
  systemPrint: 'System Print',
  bluetoothDirect: 'Bluetooth Direct',
  databaseInfo: 'Database Info',
  about: 'About',
  version: 'Version',
  print: 'Print',
  printing: 'Printing...',
  printSuccess: 'Print successful!',
  printError: 'Print failed',
  voterSlip: 'Voter Slip',
  close: 'Close',
  ok: 'OK',
  error: 'Error',
  success: 'Success',
  loading: 'Loading...',
  ward: 'Ward',
  booth: 'Booth',
};

export const translations: Record<Language, TranslationStrings> = { mr, en };
