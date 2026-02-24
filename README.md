# मतदार शोध / Voter Search App

A React Native (Expo) application for searching and printing voter data on Android. Built for election fieldwork with offline SQLite database, CSV import, multi-field search, and Bluetooth/system printing support.

## Features

- **CSV Import**: Import voter data CSV files from device storage
- **SQLite Database**: Offline-first local database for fast queries  
- **Multi-field Search**: Search by name, voter card, address, house no, mobile, sr.no
- **Advanced Filters**: Filter by ward, booth, gender, voted status
- **Bluetooth Printing**: Print voter slips via Bluetooth thermal printer
- **System Printing**: Print via Android system print dialog (supports any paired printer)
- **Bilingual UI**: Marathi (मराठी) and English interface
- **Family Lookup**: View family members linked by family ID
- **Pagination**: Smooth scrolling through large datasets

## Tech Stack

- **Framework**: React Native + Expo (SDK 52)
- **Navigation**: Expo Router (file-based routing)
- **Database**: expo-sqlite (SQLite)
- **CSV Parsing**: PapaParse
- **Printing**: expo-print (system) + react-native-bluetooth-escpos-printer (direct BT)
- **Language**: TypeScript

## Project Structure

```
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (providers)
│   └── (tabs)/
│       ├── _layout.tsx           # Tab navigation
│       ├── index.tsx             # Search screen (home)
│       ├── import.tsx            # CSV import screen
│       └── settings.tsx          # Settings (language, printer, about)
├── src/
│   ├── types/voter.ts            # TypeScript types & CSV column mapping
│   ├── i18n/
│   │   ├── translations.ts      # Marathi/English translations
│   │   └── LanguageContext.tsx   # Language context provider
│   ├── database/
│   │   ├── database.ts          # SQLite operations (CRUD, search, indexes)
│   │   └── csvParser.ts         # CSV file picker, parser, importer
│   ├── services/
│   │   └── printService.ts      # System & Bluetooth printing
│   ├── theme/
│   │   └── colors.ts            # Colors, spacing, typography
│   └── components/
│       ├── VoterCard.tsx         # Voter list item card
│       ├── VoterDetailModal.tsx  # Full voter detail + print
│       └── SearchFilters.tsx     # Advanced filter chips
├── package.json
├── app.json                      # Expo config + Android permissions
└── tsconfig.json
```

## Setup & Installation

### Prerequisites

- Node.js 18+ (LTS recommended)  
- npm or yarn
- Android phone or emulator
- Expo CLI: `npm install -g expo-cli`
- For APK build: EAS CLI: `npm install -g eas-cli`

### 1. Install Dependencies

```bash
cd "Voter Search App"
npm install
```

If you get version conflicts, run:
```bash
npx expo install --fix
```

### 2. Run in Development

**Option A: Expo Go (System Print only)**
```bash
npx expo start
```
Scan QR code with Expo Go app on Android phone.

**Option B: Development Build (Full Bluetooth support)**
```bash
npx expo prebuild --platform android
npx expo run:android
```

### 3. Build APK for Distribution

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create eas.json (one-time)
eas build:configure

# Build APK (preview profile)
eas build -p android --profile preview

# Or build AAB for Play Store
eas build -p android --profile production
```

**Local APK build (without EAS):**
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/
```

## Usage Guide

### Importing Data

1. Open the **Import** tab
2. Choose import mode: **Replace** (clear old data) or **Append** (add to existing)
3. Tap **Select CSV File** and pick your voter list CSV
4. Preview the data, then confirm import
5. Wait for import to complete (progress shown)

### Searching Voters

1. On the **Search** tab, type in the search bar
2. Search works across: Name, Voter Card, Address, House No, Mobile, Sr.No
3. Use **Advanced Filters** for: Ward, Booth, Gender, Voted status
4. Tap a voter card to see full details

### Printing

1. Go to **Settings** > **Print Method**
   - **System Print**: Uses Android print dialog. Pair your Bluetooth printer in Android Settings first.
   - **Bluetooth Direct**: For thermal ESC/POS printers. Scan and connect from Settings.
2. Open any voter detail and tap the **Print** button
3. A formatted voter slip will be printed

### CSV Format

The app expects CSV files with these column headers (Marathi):

| Column | Description |
|--------|-------------|
| प्रभाग | Ward |
| बूथ नं | Booth Number |
| अक्र | Serial Number |
| नाव | Name |
| मतदान कार्ड | Voter Card Number |
| पत्ता | Address |
| मतदान केंद्र | Voting Center |
| घर क्र | House Number |
| वय/लिंग | Age/Gender (e.g., "51 M") |
| रंग | Color |
| मोबाइल - 1 | Mobile 1 |
| मोबाइल - 2 | Mobile 2 |
| नवीन पत्ता | New Address |
| गाव | Village |
| वोटेड | Voted |
| समुदाय (Community) गट | Community |
| क्षेत्र (Area) | Area |
| निवासी प्रकार | Resident Type |
| ई मेल | Email |
| तक्रार | Complaint |
| सोसायटी | Society |
| कुटुंब | Family ID |
| विधानसभा क्र | Assembly Number |

## Bluetooth Printing Notes

- **System Print** works with any printer paired via Android Settings (recommended for most users)
- **Bluetooth Direct** requires `react-native-bluetooth-escpos-printer` native module
- Most thermal printers work best with English text; Devanagari support depends on printer model
- For Devanagari on thermal printers, System Print (HTML-based) renders correctly on all printers

## License

Private - For authorized use only.
