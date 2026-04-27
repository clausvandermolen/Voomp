// New brand palette from logo analysis
export const BRAND_PRIMARY = "#FF385C";
export const BRAND_SECONDARY = "#FF6B35";
export const BRAND_LIGHT = "#FFE0E6";
export const BRAND_LIGHT_ALT = "#FFB3C1";
export const BRAND_ACCENT = "#FF8A9E";
export const BRAND_DARK = "#CC2D4A";
export const BRAND_DARKER = "#991E37";
export const BRAND_DARKEST = "#661024";
export const BRAND_GOLD = "#FFD700";

// Legacy exports for backwards compatibility
export const BRAND_COLOR = BRAND_PRIMARY;
export const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 50%, ${BRAND_DARK} 100%)`;
export const DARK_BG = "#222222";


export const CATEGORIES = [
  { id: "all", label: "Todos", icon: "\u{1F17F}\u{FE0F}" },
  { id: "covered", label: "Techado", icon: "\u{1F3E0}" },
  { id: "outdoor", label: "Aire libre", icon: "\u{2600}\u{FE0F}" },
  { id: "ev", label: "Carga EV", icon: "\u{26A1}" },
  { id: "security", label: "Seguridad 24/7", icon: "\u{1F512}" },
  { id: "hourly", label: "Por hora", icon: "\u{23F1}\u{FE0F}" },
  { id: "daily", label: "Por d\u00EDa", icon: "\u{1F4C5}" },
  { id: "airport", label: "Aeropuerto", icon: "\u{2708}\u{FE0F}" },
  { id: "downtown", label: "Centro", icon: "\u{1F3D9}\u{FE0F}" },
  { id: "residential", label: "Residencial", icon: "\u{1F3E1}" },
  { id: "commercial", label: "Comercial", icon: "\u{1F3E2}" },
  { id: "motorcycle", label: "Motos", icon: "\u{1F3CD}\u{FE0F}" },
  { id: "oversized", label: "Veh\u00EDculos grandes", icon: "\u{1F69B}" },
];

export const COMUNAS = [
  "Santiago Centro", "Providencia", "Las Condes", "\u00D1u\u00F1oa", "Vitacura", "Lo Barnechea",
  "La Reina", "Pe\u00F1alol\u00E9n", "Macul", "San Joaqu\u00EDn", "San Miguel", "La Florida",
  "Puente Alto", "Maip\u00FA", "Estaci\u00F3n Central", "Quinta Normal", "Independencia",
  "Recoleta", "Huechuraba", "Conchal\u00ED", "Renca", "Cerro Navia", "Lo Prado",
  "Pudahuel", "Cerrillos", "Pedro Aguirre Cerda", "Lo Espejo", "La Cisterna",
  "El Bosque", "San Bernardo", "La Granja", "San Ram\u00F3n", "La Pintana",
];

export const RENTAL_TYPES = [
  { value: "", label: "Todos" },
  { value: "hora", label: "Hora" },
  { value: "d\u00EDa", label: "D\u00EDa" },
  { value: "mes", label: "Mes" },
];

export const VEHICLE_TYPES = ["Sed\u00E1n", "Hatchback", "SUV", "Station Wagon", "Camioneta", "Furgoneta", "Moto"];
export const ACCESS_TYPES = ["Control remoto", "App m\u00F3vil", "Llave f\u00EDsica", "C\u00F3digo PIN", "Manual (anfitri\u00F3n abre)"];
export const SECURITY_FEATURES = ["C\u00E1maras CCTV", "Conserje 24/7", "Iluminaci\u00F3n LED", "Acceso controlado", "Alarma"];

export const COUNTRY_CODES = [
  { code: "+56", country: "Chile \u{1F1E8}\u{1F1F1}", flag: "\u{1F1E8}\u{1F1F1}" },
  { code: "+54", country: "Argentina \u{1F1E6}\u{1F1F7}", flag: "\u{1F1E6}\u{1F1F7}" },
  { code: "+55", country: "Brasil \u{1F1E7}\u{1F1F7}", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "+57", country: "Colombia \u{1F1E8}\u{1F1F4}", flag: "\u{1F1E8}\u{1F1F4}" },
  { code: "+52", country: "M\u00E9xico \u{1F1F2}\u{1F1FD}", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "+51", country: "Per\u00FA \u{1F1F5}\u{1F1EA}", flag: "\u{1F1F5}\u{1F1EA}" },
  { code: "+598", country: "Uruguay \u{1F1FA}\u{1F1FE}", flag: "\u{1F1FA}\u{1F1FE}" },
  { code: "+595", country: "Paraguay \u{1F1F5}\u{1F1FE}", flag: "\u{1F1F5}\u{1F1FE}" },
  { code: "+591", country: "Bolivia \u{1F1E7}\u{1F1F4}", flag: "\u{1F1E7}\u{1F1F4}" },
  { code: "+593", country: "Ecuador \u{1F1EA}\u{1F1E8}", flag: "\u{1F1EA}\u{1F1E8}" },
  { code: "+58", country: "Venezuela \u{1F1FB}\u{1F1EA}", flag: "\u{1F1FB}\u{1F1EA}" },
  { code: "+507", country: "Panam\u00E1 \u{1F1F5}\u{1F1E6}", flag: "\u{1F1F5}\u{1F1E6}" },
  { code: "+506", country: "Costa Rica \u{1F1E8}\u{1F1F7}", flag: "\u{1F1E8}\u{1F1F7}" },
  { code: "+34", country: "Espa\u00F1a \u{1F1EA}\u{1F1F8}", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "+1", country: "EEUU / Canad\u00E1 \u{1F1FA}\u{1F1F8}", flag: "\u{1F1FA}\u{1F1F8}" },
];

export const ID_TYPES = [
  { value: "rut", label: "RUT" },
  { value: "passport", label: "Pasaporte" },
];

export const MAP_POSITIONS = [
  { top: "25%", left: "30%" }, { top: "35%", left: "55%" }, { top: "50%", left: "75%" },
  { top: "60%", left: "20%" }, { top: "15%", left: "65%" }, { top: "70%", left: "50%" },
  { top: "45%", left: "40%" }, { top: "80%", left: "35%" },
];

export const CAR_COLORS = [
  "Blanco", "Negro", "Gris", "Plata", "Rojo", "Azul", "Verde", "Marrón", "Beige", "Amarillo"
];

export const CAR_BRANDS = [
  "Chevrolet", "Kia", "Suzuki", "Hyundai", "Toyota", "Nissan", "Peugeot", "Ford", "MG", "Chery", "Changan", "JAC", "Great Wall", "Maxus", "Renault", "Volkswagen", "Mazda", "Honda", "Subaru", "Mitsubishi", "BMW", "Mercedes-Benz", "Audi", "Volvo", "Geely", "Haval", "BYD"
];

export const CAR_MODELS = {
  "Chevrolet": ["Spark", "Sail", "Tracker", "Groove", "Captiva", "Silverado", "Colorado", "Camaro", "Onix", "Cruze", "Equinox", "Tahoe", "Suburban", "Traverse", "Montana", "Spin", "Prisma", "Cobalt", "Cavalier", "Orlando", "Sonic", "Aveo", "Optra", "N300", "N400", "Malibu", "Impala", "Corvette", "Blazer", "Trailblazer", "Trax", "Volt", "Bolt EV", "Lumina", "Chevette", "Corsa", "Astra", "Zafira", "S10", "D-Max"],
  "Kia": ["Morning", "Rio", "Cerato", "Soluto", "Sportage", "Sorento", "Sonet", "Seltos", "Carnival", "Optima", "K3", "K5", "Stinger", "Carens", "Niro", "EV6", "Telluride", "Picanto", "Forte", "Soul", "Cadenza", "K900", "Magentis", "Opirus", "Pride", "Sephia", "Shuma", "Spectra", "Venga", "Quoris", "Mohave", "Bongo", "Pregio"],
  "Suzuki": ["Alto", "Swift", "Baleno", "Dzire", "Jimny", "Vitara", "S-Cross", "Ertiga", "Celerio", "Ignis", "Grand Vitara", "Kizashi", "APV", "XL7", "S-Presso", "Aerio", "SX4", "Ciaz", "Fronx", "Maruti", "Samurai", "Sidekick", "Esteem", "Forsa", "Liana", "Splash", "Equator", "Carry", "Super Carry"],
  "Hyundai": ["Grand i10", "Accent", "Elantra", "Tucson", "Santa Fe", "Creta", "Venue", "Sonata", "Kona", "Palisade", "Ioniq", "Ioniq 5", "Ioniq 6", "Staria", "H-1", "Veloster", "Azera", "Galloper", "Veracruz", "Terracan", "Atos", "Getz", "i10", "i20", "i30", "i40", "Matrix", "Trajet", "Entourage", "Genesis", "Equus", "Tiburon", "Tuscani", "H-100", "Porter"],
  "Toyota": ["Yaris", "Corolla", "Camry", "RAV4", "Hilux", "Fortuner", "Land Cruiser", "Prado", "C-HR", "Prius", "Auris", "Aygo", "Supra", "86", "Crown", "Tacoma", "Tundra", "Sequoia", "4Runner", "Sienna", "Highlander", "Avanza", "Vitz", "Starlet", "Etios", "Corolla Cross", "Raize", "Agya", "Rush", "Innova", "Alphard", "Vellfire", "Hiace", "FJ Cruiser", "Matrix", "Echo", "Celica", "MR2", "Tercel", "Corona", "Cressida", "Avalon", "Venza", "Yaris Cross"],
  "Nissan": ["March", "Versa", "Sentra", "Kicks", "Qashqai", "X-Trail", "Navara", "Tiida", "Note", "Leaf", "Pathfinder", "Murano", "Armada", "Frontier", "Titan", "Juke", "Altima", "Maxima", "370Z", "GT-R", "Terrano", "V16", "NP300", "Micra", "Almera", "Silvia", "200SX", "240SX", "300ZX", "350Z", "Skyline", "Rogue", "Ariya", "Cube", "Quest", "Xterra", "Patrol", "Urvan", "NV200", "NV350", "Cabstar"],
  "Peugeot": ["208", "308", "2008", "3008", "5008", "Partner", "Rifter", "108", "207", "206", "307", "408", "508", "Traveller", "Expert", "Boxer", "RCZ", "Landtrek", "4008", "106", "107", "205", "301", "306", "405", "406", "407", "605", "607", "806", "807", "Bipper", "Ion"],
  "Ford": ["Fiesta", "Focus", "Mustang", "EcoSport", "Escape", "Explorer", "Edge", "Ranger", "F-150", "Bronco", "Taurus", "Fusion", "Expedition", "F-250", "F-350", "Transit", "Maverick", "Puma", "Kuga", "Mach-E", "Territory", "Ka", "Figo", "Mondeo", "Falcon", "Fairmont", "Crown Victoria", "Thunderbird", "Flex", "Freestyle", "C-Max", "S-Max", "Galaxy", "Tourneo", "Courier", "Aerostar", "Windstar", "Excursion"],
  "MG": ["MG3", "MG5", "ZS", "ZX", "HS", "RX5", "Marvel R", "MG4", "MG6", "GT", "One", "Gloster", "Extender", "Cyberster", "MG7", "Hector", "Astor", "Comet EV", "TF", "ZR", "ZS EV", "MG 350", "MG 550", "MG 750"],
  "Chery": ["Tiggo 2", "Tiggo 2 Pro", "Tiggo 3", "Tiggo 4", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Arrizo 3", "Arrizo 5", "Arrizo 7", "QQ", "Fulwin", "Omoda 5", "IQ", "Face", "Beat", "Destiny", "Skin", "Grand Tiggo", "Tiggo 9", "eQ1", "Ice Cream", "Exeed TX", "Exeed VX", "Exeed LX"],
  "Changan": ["CS15", "CS35", "CS35 Plus", "CS55", "CS55 Plus", "CS75", "CS85", "CS95", "Uni-T", "Uni-K", "Uni-V", "Hunter", "Alsvin", "Aura", "Benni", "Kaicene", "Lumin", "CX20", "CX70", "Oshan", "Star", "Ruixing", "Shenlan SL03", "Deepal S7", "Eado"],
  "JAC": ["J2", "J4", "J5", "JS2", "JS3", "JS4", "JS6", "JS8", "T6", "T8", "T8 Pro", "T9", "Refine", "E-JS1", "E-JS4", "Sunray", "S2", "S3", "S4", "S5", "S7", "J3", "J7", "X200", "Sei 2", "Sei 3", "Sei 4", "Sei 7", "Frison"],
  "Great Wall": ["Poer", "Hover", "Wingle", "Voleex", "C30", "M4", "H6", "Pao", "Coolbear", "Pegasus", "Florid", "Safe", "Deer", "Sailor", "Socool", "Sing", "Steed", "Wingle 5", "Wingle 7", "Cannon", "Tank 300", "Tank 500", "Ora Good Cat", "Ora Funky Cat", "Haval H2", "Wey Coffee"],
  "Maxus": ["T60", "T90", "D60", "D90", "EV30", "EV80", "V80", "V90", "G10", "G50", "Euniq 5", "Euniq 6", "Deliver 9", "eDeliver 3", "eDeliver 9", "MIFA 9", "D80", "G20", "V100", "RV80"],
  "Renault": ["Kwid", "Clio", "Megane", "Duster", "Koleos", "Kangoo", "Oroch", "Sandero", "Stepway", "Captur", "Logan", "Symbol", "Fluence", "Trafic", "Master", "Arkana", "Zoe", "Twingo", "Scenic", "Espace", "Laguna", "Safrane", "Vel Satis", "Avantime", "Modus", "Kadjar", "Austral", "Alaskan", "Twizy"],
  "Volkswagen": ["Gol", "Polo", "Virtus", "Jetta", "Golf", "Nivus", "T-Cross", "Taos", "Tiguan", "Amarok", "Up!", "Voyage", "Saveiro", "Bora", "Passat", "Arteon", "Touareg", "Atlas", "ID.3", "ID.4", "Caddy", "Transporter", "Fox", "Lupo", "Derby", "Pointer", "Santana", "Scirocco", "Corrado", "Eos", "Phaeton", "Sharan", "Touran", "Routan", "Karmann Ghia", "Beetle", "Crafter", "Multivan", "California"],
  "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-7", "CX-8", "CX-9", "CX-90", "BT-50", "MX-5", "RX-8", "Demio", "Axela", "Atenza", "CX-60", "CX-70", "CX-80", "Biante", "Premacy", "MPV", "Tribute", "Navajo", "B-Series", "RX-7", "323", "626", "929", "Protégé", "Familia", "Millenia", "Bongo"],
  "Honda": ["Fit", "City", "Civic", "Accord", "HR-V", "CR-V", "Pilot", "Odyssey", "Ridgeline", "Passport", "Jazz", "Brio", "Amaze", "Insight", "NSX", "ZR-V", "Prelude", "S2000", "CR-Z", "Element", "Crosstour", "Legend", "Acura", "Integra", "Vezel", "Shuttle", "Stepwgn", "Freed", "Mobilio", "N-WGN", "N-BOX", "Clarity"],
  "Subaru": ["Impreza", "Legacy", "Crosstrek", "Forester", "Outback", "WRX", "BRZ", "Ascent", "XV", "Levorg", "Tribeca", "Justy", "Vivio", "Pleo", "Stella", "Dex", "Trezia", "Exiga", "Crosstrek", "Baja", "SVX", "XT", "Leone", "Brat", "Sambar"],
  "Mitsubishi": ["Mirage", "Lancer", "ASX", "Eclipse Cross", "Outlander", "Montero", "Montero Sport", "L200", "Triton", "Galant", "Pajero", "Xpander", "Space Star", "Colt", "Delica", "Grandis", "Space Wagon", "Space Gear", "Endeavor", "Raider", "i-MiEV", "3000GT", "FTO", "Starion", "Sigma", "Diamante", "Magna", "Verada", "Rosa", "Canter"],
  "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "Serie 6", "Serie 7", "Serie 8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "i8", "iX", "M2", "M3", "M4", "M5", "M6", "M8", "X3 M", "X4 M", "X5 M", "X6 M", "Z3", "Z8", "iX3", "iX1", "i7"],
  "Mercedes-Benz": ["Clase A", "Clase B", "Clase C", "Clase E", "Clase S", "Clase G", "GLA", "GLB", "GLC", "GLE", "GLS", "CLA", "CLS", "Vito", "Sprinter", "AMG GT", "EQC", "EQE", "EQS", "Citan", "V-Class", "X-Class", "SLC", "SLK", "SL", "CLK", "CL", "GLK", "M-Class", "R-Class", "190", "W123", "W124", "EQA", "EQB", "EQV"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron", "TT", "R8", "RS3", "RS4", "RS5", "RS6", "S3", "S4", "S5", "S6", "S7", "S8", "SQ2", "SQ5", "SQ7", "SQ8", "RS7", "RS Q3", "RS Q8", "e-tron GT", "Q4 e-tron", "Allroad", "Cabriolet", "Coupe", "80", "90", "100"],
  "Volvo": ["S40", "S60", "S90", "V40", "V60", "V90", "XC40", "XC60", "XC90", "C30", "C40", "EX30", "EX90", "S80", "V50", "V70", "XC70", "S70", "C70", "850", "940", "960", "740", "760", "240", "140", "Amazon", "P1800"],
  "Geely": ["Coolray", "Azkarra", "Okavango", "Geometry C", "Emgrand", "Panda", "Tugella", "Monjaro", "Zeekr 001", "CK", "MK", "LC", "EC7", "EX7", "GC6", "GC9", "X7", "GX3", "Boyue", "Binyue", "Xingyue", "Preface", "Vision", "Englon", "Gleagle", "Zeekr X"],
  "Haval": ["Jolion", "H6", "Dargo", "H2", "H3", "H5", "H9", "F7", "F7x", "M6", "Big Dog", "Jolion Pro", "H1", "H4", "H7", "H8", "Chitu", "Shenshou", "Kugou", "Raptor", "Xiaolong", "H-Dog", "Blue Logo", "Red Logo"],
  "BYD": ["Dolphin", "Yuan Plus", "Seal", "Han", "Tang", "Song Plus", "Qin", "Destroyer", "Seagull", "Frigate", "Atto 3", "e2", "F3", "F0", "S6", "S7", "M6", "E5", "E6", "T3", "Yuan", "Song", "Qin Plus", "Han EV", "Tang EV", "Corvette 07", "Denza", "Yangwang"]
};

// Cross-reference between a model and its vehicle type. When a brand+model combo
// is found here, the vehicle form can auto-fill the "Tipo de vehículo" field so
// it stays consistent across the database. Keys are stored as `${Brand} ${Model}`.
// Only explicit entries are listed; anything not in this map falls back to a
// heuristic in getVehicleTypeForModel() below (keyword-based).
export const CAR_MODEL_TYPES = {
  // Toyota
  "Toyota Yaris": "Hatchback", "Toyota Corolla": "Sed\u00E1n", "Toyota Camry": "Sed\u00E1n", "Toyota RAV4": "SUV", "Toyota Hilux": "Camioneta",
  "Toyota Fortuner": "SUV", "Toyota Land Cruiser": "SUV", "Toyota Prado": "SUV", "Toyota C-HR": "SUV", "Toyota Prius": "Hatchback",
  "Toyota Auris": "Hatchback", "Toyota Aygo": "Hatchback", "Toyota Supra": "Sed\u00E1n", "Toyota 4Runner": "SUV", "Toyota Sienna": "Furgoneta",
  "Toyota Highlander": "SUV", "Toyota Avanza": "Furgoneta", "Toyota Corolla Cross": "SUV", "Toyota Raize": "SUV", "Toyota Rush": "SUV",
  "Toyota Innova": "Furgoneta", "Toyota Hiace": "Furgoneta", "Toyota Venza": "Station Wagon", "Toyota Yaris Cross": "SUV", "Toyota Tacoma": "Camioneta",
  "Toyota Tundra": "Camioneta",
  // Chevrolet
  "Chevrolet Spark": "Hatchback", "Chevrolet Sail": "Sed\u00E1n", "Chevrolet Tracker": "SUV", "Chevrolet Groove": "SUV", "Chevrolet Captiva": "SUV",
  "Chevrolet Silverado": "Camioneta", "Chevrolet Colorado": "Camioneta", "Chevrolet Onix": "Hatchback", "Chevrolet Cruze": "Sed\u00E1n",
  "Chevrolet Equinox": "SUV", "Chevrolet Tahoe": "SUV", "Chevrolet Suburban": "SUV", "Chevrolet Traverse": "SUV", "Chevrolet Montana": "Camioneta",
  "Chevrolet Spin": "Furgoneta", "Chevrolet Aveo": "Sed\u00E1n", "Chevrolet Malibu": "Sed\u00E1n", "Chevrolet Trailblazer": "SUV",
  "Chevrolet Trax": "SUV", "Chevrolet Bolt EV": "Hatchback", "Chevrolet S10": "Camioneta", "Chevrolet D-Max": "Camioneta",
  // Kia
  "Kia Morning": "Hatchback", "Kia Rio": "Sed\u00E1n", "Kia Cerato": "Sed\u00E1n", "Kia Sportage": "SUV", "Kia Sorento": "SUV",
  "Kia Sonet": "SUV", "Kia Seltos": "SUV", "Kia Carnival": "Furgoneta", "Kia EV6": "SUV", "Kia Picanto": "Hatchback", "Kia Soul": "SUV",
  "Kia Carens": "Furgoneta", "Kia Niro": "SUV", "Kia Telluride": "SUV", "Kia K3": "Sed\u00E1n", "Kia K5": "Sed\u00E1n",
  // Hyundai
  "Hyundai Grand i10": "Hatchback", "Hyundai Accent": "Sed\u00E1n", "Hyundai Elantra": "Sed\u00E1n", "Hyundai Tucson": "SUV",
  "Hyundai Santa Fe": "SUV", "Hyundai Creta": "SUV", "Hyundai Venue": "SUV", "Hyundai Sonata": "Sed\u00E1n", "Hyundai Kona": "SUV",
  "Hyundai Palisade": "SUV", "Hyundai Ioniq 5": "SUV", "Hyundai Ioniq 6": "Sed\u00E1n", "Hyundai Staria": "Furgoneta",
  "Hyundai H-1": "Furgoneta", "Hyundai i10": "Hatchback", "Hyundai i20": "Hatchback", "Hyundai i30": "Hatchback", "Hyundai Porter": "Camioneta",
  // Nissan
  "Nissan March": "Hatchback", "Nissan Versa": "Sed\u00E1n", "Nissan Sentra": "Sed\u00E1n", "Nissan Kicks": "SUV",
  "Nissan Qashqai": "SUV", "Nissan X-Trail": "SUV", "Nissan Navara": "Camioneta", "Nissan Frontier": "Camioneta",
  "Nissan Titan": "Camioneta", "Nissan Pathfinder": "SUV", "Nissan Murano": "SUV", "Nissan Armada": "SUV", "Nissan Leaf": "Hatchback",
  "Nissan Note": "Hatchback", "Nissan Juke": "SUV", "Nissan Altima": "Sed\u00E1n", "Nissan Maxima": "Sed\u00E1n",
  "Nissan Rogue": "SUV", "Nissan Ariya": "SUV", "Nissan NP300": "Camioneta", "Nissan Patrol": "SUV", "Nissan Urvan": "Furgoneta",
  // Ford
  "Ford Fiesta": "Hatchback", "Ford Focus": "Hatchback", "Ford Mustang": "Sed\u00E1n", "Ford EcoSport": "SUV",
  "Ford Escape": "SUV", "Ford Explorer": "SUV", "Ford Edge": "SUV", "Ford Ranger": "Camioneta", "Ford F-150": "Camioneta",
  "Ford Bronco": "SUV", "Ford Expedition": "SUV", "Ford F-250": "Camioneta", "Ford F-350": "Camioneta", "Ford Transit": "Furgoneta",
  "Ford Maverick": "Camioneta", "Ford Territory": "SUV", "Ford Kuga": "SUV", "Ford Mach-E": "SUV",
  // Peugeot
  "Peugeot 208": "Hatchback", "Peugeot 308": "Hatchback", "Peugeot 2008": "SUV", "Peugeot 3008": "SUV", "Peugeot 5008": "SUV",
  "Peugeot Partner": "Furgoneta", "Peugeot Rifter": "Furgoneta", "Peugeot Expert": "Furgoneta", "Peugeot Boxer": "Furgoneta",
  "Peugeot Landtrek": "Camioneta", "Peugeot 508": "Sed\u00E1n", "Peugeot 408": "Sed\u00E1n",
  // Volkswagen
  "Volkswagen Gol": "Hatchback", "Volkswagen Polo": "Hatchback", "Volkswagen Virtus": "Sed\u00E1n", "Volkswagen Jetta": "Sed\u00E1n",
  "Volkswagen Golf": "Hatchback", "Volkswagen Nivus": "SUV", "Volkswagen T-Cross": "SUV", "Volkswagen Taos": "SUV",
  "Volkswagen Tiguan": "SUV", "Volkswagen Amarok": "Camioneta", "Volkswagen Touareg": "SUV", "Volkswagen Atlas": "SUV",
  "Volkswagen Caddy": "Furgoneta", "Volkswagen Transporter": "Furgoneta", "Volkswagen Crafter": "Furgoneta",
  // Renault
  "Renault Kwid": "Hatchback", "Renault Clio": "Hatchback", "Renault Megane": "Hatchback", "Renault Duster": "SUV",
  "Renault Koleos": "SUV", "Renault Kangoo": "Furgoneta", "Renault Oroch": "Camioneta", "Renault Sandero": "Hatchback",
  "Renault Logan": "Sed\u00E1n", "Renault Captur": "SUV", "Renault Trafic": "Furgoneta", "Renault Master": "Furgoneta",
  "Renault Alaskan": "Camioneta",
  // Mazda
  "Mazda Mazda2": "Hatchback", "Mazda Mazda3": "Sed\u00E1n", "Mazda Mazda6": "Sed\u00E1n", "Mazda CX-3": "SUV",
  "Mazda CX-30": "SUV", "Mazda CX-5": "SUV", "Mazda CX-9": "SUV", "Mazda BT-50": "Camioneta", "Mazda MX-5": "Sed\u00E1n",
  // Honda
  "Honda Fit": "Hatchback", "Honda City": "Sed\u00E1n", "Honda Civic": "Sed\u00E1n", "Honda Accord": "Sed\u00E1n",
  "Honda HR-V": "SUV", "Honda CR-V": "SUV", "Honda Pilot": "SUV", "Honda Odyssey": "Furgoneta", "Honda Ridgeline": "Camioneta",
  // Subaru
  "Subaru Impreza": "Hatchback", "Subaru Legacy": "Sed\u00E1n", "Subaru Outback": "Station Wagon",
  "Subaru Forester": "SUV", "Subaru Crosstrek": "SUV", "Subaru Ascent": "SUV", "Subaru WRX": "Sed\u00E1n",
  // Mitsubishi
  "Mitsubishi Mirage": "Hatchback", "Mitsubishi Lancer": "Sed\u00E1n", "Mitsubishi ASX": "SUV",
  "Mitsubishi Eclipse Cross": "SUV", "Mitsubishi Outlander": "SUV", "Mitsubishi Montero": "SUV",
  "Mitsubishi Montero Sport": "SUV", "Mitsubishi L200": "Camioneta", "Mitsubishi Triton": "Camioneta",
  "Mitsubishi Xpander": "Furgoneta", "Mitsubishi Space Star": "Hatchback",
  // Maxus / MG / Chery / Changan / JAC / Great Wall / Geely / Haval / BYD
  "Maxus T60": "Camioneta", "Maxus T90": "Camioneta", "Maxus D60": "SUV", "Maxus D90": "SUV",
  "Maxus V80": "Furgoneta", "Maxus V90": "Furgoneta", "Maxus G10": "Furgoneta", "Maxus G50": "Furgoneta",
  "MG MG3": "Hatchback", "MG MG5": "Sed\u00E1n", "MG ZS": "SUV", "MG HS": "SUV", "MG RX5": "SUV", "MG MG4": "Hatchback",
  "Chery Tiggo 2": "SUV", "Chery Tiggo 3": "SUV", "Chery Tiggo 4": "SUV", "Chery Tiggo 7": "SUV", "Chery Tiggo 8": "SUV", "Chery QQ": "Hatchback",
  "Changan CS15": "SUV", "Changan CS35": "SUV", "Changan CS55": "SUV", "Changan CS75": "SUV", "Changan CS95": "SUV", "Changan Hunter": "Camioneta",
  "JAC T6": "Camioneta", "JAC T8": "Camioneta", "JAC JS2": "SUV", "JAC JS4": "SUV", "JAC S2": "SUV", "JAC S3": "SUV",
  "Great Wall Poer": "Camioneta", "Great Wall Wingle": "Camioneta", "Great Wall H6": "SUV", "Great Wall Tank 300": "SUV",
  "Geely Coolray": "SUV", "Geely Azkarra": "SUV", "Geely Emgrand": "Sed\u00E1n", "Geely Tugella": "SUV", "Geely Monjaro": "SUV",
  "Haval Jolion": "SUV", "Haval H6": "SUV", "Haval Dargo": "SUV", "Haval H2": "SUV",
  "BYD Dolphin": "Hatchback", "BYD Yuan Plus": "SUV", "BYD Seal": "Sed\u00E1n", "BYD Han": "Sed\u00E1n", "BYD Tang": "SUV", "BYD Song Plus": "SUV", "BYD Atto 3": "SUV",
  // Premium
  "BMW Serie 1": "Hatchback", "BMW Serie 2": "Sed\u00E1n", "BMW Serie 3": "Sed\u00E1n", "BMW Serie 5": "Sed\u00E1n", "BMW Serie 7": "Sed\u00E1n",
  "BMW X1": "SUV", "BMW X3": "SUV", "BMW X5": "SUV", "BMW X6": "SUV", "BMW X7": "SUV", "BMW iX": "SUV",
  "Mercedes-Benz Clase A": "Hatchback", "Mercedes-Benz Clase C": "Sed\u00E1n", "Mercedes-Benz Clase E": "Sed\u00E1n",
  "Mercedes-Benz Clase S": "Sed\u00E1n", "Mercedes-Benz GLA": "SUV", "Mercedes-Benz GLC": "SUV", "Mercedes-Benz GLE": "SUV",
  "Mercedes-Benz GLS": "SUV", "Mercedes-Benz Vito": "Furgoneta", "Mercedes-Benz Sprinter": "Furgoneta",
  "Audi A1": "Hatchback", "Audi A3": "Hatchback", "Audi A4": "Sed\u00E1n", "Audi A5": "Sed\u00E1n", "Audi A6": "Sed\u00E1n",
  "Audi Q3": "SUV", "Audi Q5": "SUV", "Audi Q7": "SUV", "Audi Q8": "SUV",
  "Volvo S60": "Sed\u00E1n", "Volvo S90": "Sed\u00E1n", "Volvo V60": "Station Wagon", "Volvo V90": "Station Wagon",
  "Volvo XC40": "SUV", "Volvo XC60": "SUV", "Volvo XC90": "SUV", "Volvo XC70": "Station Wagon",
};

// Resolve a vehicle type from brand + model. First tries the explicit lookup
// above; if absent, falls back to keyword-based heuristics so custom entries
// still default to something reasonable. Final fallback is "Sedán" so the UI
// always lands on a valid choice the user can override.
export function getVehicleTypeForModel(brand, model) {
  if (!brand || !model) return "";
  const key = `${brand} ${model}`.trim();
  if (CAR_MODEL_TYPES[key]) return CAR_MODEL_TYPES[key];
  const m = String(model).toLowerCase();
  if (/(wagon|outback|avant|touring|sportbrake|estate|variant|levorg)/.test(m)) return "Station Wagon";
  if (/(hilux|ranger|navara|frontier|amarok|l200|triton|d-max|silverado|tacoma|tundra|f-1\d0|f-2\d0|f-3\d0|np300|colorado|landtrek|oroch|saveiro|montana|poer|wingle|s10|bt-50|hunter|ridgeline|maverick|raider|titan|alaskan|t\d0?|t60|t90|cannon|tank\s?300|tank\s?500|pao|terracan|dmax)/.test(m)) return "Camioneta";
  if (/(hiace|staria|sprinter|vito|crafter|transit|kangoo|trafic|master|caddy|partner|rifter|expert|boxer|jumpy|jumper|ducato|daily|iveco|urvan|nv200|nv350|cabstar|v-class|sienna|odyssey|alphard|vellfire|carnival|carens|avanza|innova|caravan|multivan|california|transporter|t\.?\s?cross\s?van|spin|h-1|h-100|porter|deliver|euniq|mifa|g10|g20|g50|v80|v90|v100|ertiga|xpander|rosa|canter|despliegue)/.test(m)) return "Furgoneta";
  if (/(suv|rav4|cr-v|hr-v|x[ -]?trail|tucson|santa fe|outlander|tiguan|touareg|patrol|forester|ascent|pilot|4runner|fortuner|land cruiser|prado|captur|duster|koleos|kicks|juke|sportage|sorento|seltos|sonet|creta|venue|kona|palisade|cx-\d|compass|cherokee|explorer|edge|escape|atlas|equinox|tracker|groove|trax|trailblazer|territory|bronco|wrangler|rogue|murano|q[235789]|gl[abces]|x[13567]|ex[39]0|xc\d0|tank|haval|pajero|montero|tiggo|jolion|dargo|coolray|azkarra|tugella|monjaro|okavango|atto|yuan|song|tang|frigate|dolphin\s?mini|ioniq\s?5|ev6|ariya|mach-e|marvel|omoda|cs\d0|cs\d\d|uni-|deepal|eq[abcves]|e-tron|ix\d?|i[347x]|model\s?[xy]|c40|ex30|ex90|niro|telluride|mohave|terrano)/.test(m)) return "SUV";
  if (/(moto|bike|motorcycle|scooter)/.test(m)) return "Moto";
  if (/(i\d0|gol|polo|clio|yaris|fit|jazz|up!|kwid|picanto|morning|spark|onix|fiesta|march|sail|alto|swift|baleno|dzire|dolphin|mg[34]|qq|accent|aygo|corsa|208|308|106|107|207|fox|panda|mirage|lancer\s?ex|note|impreza|prius|auris|leaf|focus|polo|ibiza|tiida|\bka\b|figo|beat|bongo|kwid|aveo|agya|benni|lumin|mirage|e2|eq1|ice\s?cream|hatchback|celerio|ignis|s-presso|ioniq(?!\s?[56]))/.test(m)) return "Hatchback";
  if (/(corolla|camry|civic|accord|sentra|altima|maxima|passat|jetta|virtus|sonata|elantra|a[3-8]|clase [aces]|serie [1-8]|3\d0|5\d0|7\d0|model [s3]|cerato|cruze|rio\s?sed|soluto|logan|symbol|fluence|arkana|alsvin|arrizo|emgrand|preface|han|seal|k[35]|forte|optima|stinger|s60|s90|sonata|avalon|legacy|mazda[236]|mg5|mg6|mg7|elantra|k900|rio|sail|onix\s?sed|aura|virtus|vento)/.test(m)) return "Sed\u00E1n";
  // Default: when nothing matched, assume Sedán so the UI always has a selection.
  return "Sed\u00E1n";
}

// Approximate exterior dimensions by vehicle type (meters: width × length × height).
// Used as fallback when a specific model is not present in CAR_MODEL_DIMENSIONS.
export const VEHICLE_TYPE_DIMENSIONS = {
  "Hatchback":     { width: 1.75, length: 4.10, height: 1.50 },
  "Sed\u00E1n":    { width: 1.80, length: 4.60, height: 1.45 },
  "SUV":           { width: 1.85, length: 4.55, height: 1.65 },
  "Station Wagon": { width: 1.80, length: 4.75, height: 1.48 },
  "Camioneta":     { width: 1.90, length: 5.30, height: 1.80 },
  "Furgoneta":     { width: 1.95, length: 5.00, height: 2.00 },
  "Moto":          { width: 0.80, length: 2.10, height: 1.15 },
};

// Manufacturer-spec exterior dimensions (meters: width × length × height) for
// the most common models in Chile. When a user selects brand+model the form
// auto-fills these values but still lets the user override them. Anything not
// listed falls back to VEHICLE_TYPE_DIMENSIONS via getVehicleDimensions().
export const CAR_MODEL_DIMENSIONS = {
  // Toyota
  "Toyota Yaris":        { width: 1.70, length: 4.42, height: 1.47 },
  "Toyota Corolla":      { width: 1.78, length: 4.63, height: 1.44 },
  "Toyota Corolla Cross":{ width: 1.82, length: 4.46, height: 1.62 },
  "Toyota Camry":        { width: 1.84, length: 4.89, height: 1.45 },
  "Toyota RAV4":         { width: 1.86, length: 4.60, height: 1.69 },
  "Toyota C-HR":         { width: 1.80, length: 4.39, height: 1.56 },
  "Toyota Hilux":        { width: 1.86, length: 5.33, height: 1.81 },
  "Toyota Fortuner":     { width: 1.86, length: 4.79, height: 1.84 },
  "Toyota Land Cruiser": { width: 1.98, length: 4.95, height: 1.93 },
  "Toyota Prado":        { width: 1.88, length: 4.84, height: 1.88 },
  "Toyota Prius":        { width: 1.76, length: 4.57, height: 1.47 },
  "Toyota 4Runner":      { width: 1.93, length: 4.82, height: 1.81 },
  "Toyota Highlander":   { width: 1.93, length: 4.95, height: 1.73 },
  "Toyota Raize":        { width: 1.70, length: 4.00, height: 1.62 },
  "Toyota Rush":         { width: 1.75, length: 4.43, height: 1.74 },
  "Toyota Hiace":        { width: 1.95, length: 5.27, height: 1.99 },
  // Chevrolet
  "Chevrolet Spark":     { width: 1.59, length: 3.64, height: 1.48 },
  "Chevrolet Sail":      { width: 1.69, length: 4.39, height: 1.50 },
  "Chevrolet Onix":      { width: 1.73, length: 4.47, height: 1.47 },
  "Chevrolet Tracker":   { width: 1.79, length: 4.27, height: 1.64 },
  "Chevrolet Groove":    { width: 1.77, length: 4.32, height: 1.65 },
  "Chevrolet Captiva":   { width: 1.84, length: 4.67, height: 1.75 },
  "Chevrolet Cruze":     { width: 1.80, length: 4.67, height: 1.46 },
  "Chevrolet Equinox":   { width: 1.84, length: 4.65, height: 1.68 },
  "Chevrolet Silverado": { width: 2.06, length: 5.88, height: 1.87 },
  "Chevrolet Colorado":  { width: 1.89, length: 5.41, height: 1.80 },
  "Chevrolet Montana":   { width: 1.74, length: 4.50, height: 1.52 },
  "Chevrolet S10":       { width: 1.85, length: 5.35, height: 1.81 },
  "Chevrolet D-Max":     { width: 1.87, length: 5.30, height: 1.79 },
  // Kia
  "Kia Morning":         { width: 1.60, length: 3.60, height: 1.49 },
  "Kia Picanto":         { width: 1.60, length: 3.60, height: 1.49 },
  "Kia Rio":             { width: 1.72, length: 4.15, height: 1.45 },
  "Kia Cerato":          { width: 1.80, length: 4.64, height: 1.44 },
  "Kia Soluto":          { width: 1.72, length: 4.30, height: 1.46 },
  "Kia Sonet":           { width: 1.79, length: 4.12, height: 1.64 },
  "Kia Seltos":          { width: 1.80, length: 4.37, height: 1.63 },
  "Kia Sportage":        { width: 1.86, length: 4.66, height: 1.67 },
  "Kia Sorento":         { width: 1.90, length: 4.81, height: 1.70 },
  "Kia Carnival":        { width: 1.99, length: 5.16, height: 1.78 },
  "Kia EV6":             { width: 1.88, length: 4.69, height: 1.55 },
  // Hyundai
  "Hyundai Grand i10":   { width: 1.68, length: 3.78, height: 1.52 },
  "Hyundai Accent":      { width: 1.73, length: 4.44, height: 1.46 },
  "Hyundai Elantra":     { width: 1.83, length: 4.68, height: 1.42 },
  "Hyundai Sonata":      { width: 1.86, length: 4.90, height: 1.45 },
  "Hyundai Creta":       { width: 1.79, length: 4.32, height: 1.64 },
  "Hyundai Venue":       { width: 1.77, length: 4.04, height: 1.59 },
  "Hyundai Kona":        { width: 1.80, length: 4.35, height: 1.57 },
  "Hyundai Tucson":      { width: 1.87, length: 4.63, height: 1.65 },
  "Hyundai Santa Fe":    { width: 1.89, length: 4.83, height: 1.72 },
  "Hyundai Palisade":    { width: 1.97, length: 4.98, height: 1.75 },
  "Hyundai Ioniq 5":     { width: 1.89, length: 4.64, height: 1.61 },
  "Hyundai Staria":      { width: 1.99, length: 5.25, height: 1.99 },
  "Hyundai H-1":         { width: 1.92, length: 5.15, height: 1.93 },
  "Hyundai Porter":      { width: 1.74, length: 4.98, height: 1.97 },
  // Nissan
  "Nissan March":        { width: 1.66, length: 3.78, height: 1.52 },
  "Nissan Versa":        { width: 1.70, length: 4.49, height: 1.47 },
  "Nissan Sentra":       { width: 1.82, length: 4.64, height: 1.45 },
  "Nissan Kicks":        { width: 1.76, length: 4.29, height: 1.59 },
  "Nissan Qashqai":      { width: 1.84, length: 4.42, height: 1.62 },
  "Nissan X-Trail":      { width: 1.84, length: 4.69, height: 1.74 },
  "Nissan Pathfinder":   { width: 1.98, length: 5.00, height: 1.79 },
  "Nissan Murano":       { width: 1.92, length: 4.89, height: 1.69 },
  "Nissan Leaf":         { width: 1.79, length: 4.49, height: 1.55 },
  "Nissan Navara":       { width: 1.85, length: 5.26, height: 1.82 },
  "Nissan Frontier":     { width: 1.85, length: 5.26, height: 1.82 },
  "Nissan NP300":        { width: 1.85, length: 5.26, height: 1.82 },
  "Nissan Urvan":        { width: 1.88, length: 5.23, height: 2.30 },
  "Nissan Patrol":       { width: 2.03, length: 5.17, height: 1.94 },
  // Peugeot
  "Peugeot 208":         { width: 1.74, length: 4.05, height: 1.43 },
  "Peugeot 308":         { width: 1.85, length: 4.36, height: 1.44 },
  "Peugeot 2008":        { width: 1.77, length: 4.30, height: 1.53 },
  "Peugeot 3008":        { width: 1.84, length: 4.45, height: 1.62 },
  "Peugeot 5008":        { width: 1.84, length: 4.64, height: 1.64 },
  "Peugeot 408":         { width: 1.85, length: 4.69, height: 1.48 },
  "Peugeot Partner":     { width: 1.85, length: 4.40, height: 1.83 },
  "Peugeot Landtrek":    { width: 1.90, length: 5.39, height: 1.86 },
  // Ford
  "Ford Fiesta":         { width: 1.74, length: 4.06, height: 1.47 },
  "Ford Focus":          { width: 1.82, length: 4.38, height: 1.47 },
  "Ford Mustang":        { width: 1.92, length: 4.79, height: 1.38 },
  "Ford EcoSport":       { width: 1.77, length: 4.24, height: 1.66 },
  "Ford Escape":         { width: 1.88, length: 4.59, height: 1.68 },
  "Ford Explorer":       { width: 2.00, length: 5.05, height: 1.78 },
  "Ford Edge":           { width: 1.93, length: 4.78, height: 1.74 },
  "Ford Ranger":         { width: 1.93, length: 5.36, height: 1.85 },
  "Ford F-150":          { width: 2.03, length: 5.89, height: 1.96 },
  "Ford Bronco":         { width: 1.92, length: 4.81, height: 1.85 },
  "Ford Transit":        { width: 2.05, length: 5.53, height: 2.01 },
  "Ford Territory":      { width: 1.93, length: 4.63, height: 1.70 },
  // Mazda
  "Mazda Mazda2":        { width: 1.69, length: 4.06, height: 1.49 },
  "Mazda Mazda3":        { width: 1.80, length: 4.46, height: 1.44 },
  "Mazda Mazda6":        { width: 1.84, length: 4.86, height: 1.45 },
  "Mazda CX-3":          { width: 1.77, length: 4.28, height: 1.54 },
  "Mazda CX-30":         { width: 1.80, length: 4.39, height: 1.54 },
  "Mazda CX-5":          { width: 1.84, length: 4.55, height: 1.68 },
  "Mazda CX-9":          { width: 1.96, length: 5.07, height: 1.75 },
  "Mazda BT-50":         { width: 1.87, length: 5.28, height: 1.79 },
  // Honda
  "Honda Fit":           { width: 1.69, length: 4.06, height: 1.53 },
  "Honda City":          { width: 1.75, length: 4.55, height: 1.48 },
  "Honda Civic":         { width: 1.80, length: 4.65, height: 1.41 },
  "Honda Accord":        { width: 1.86, length: 4.89, height: 1.45 },
  "Honda HR-V":          { width: 1.79, length: 4.33, height: 1.59 },
  "Honda CR-V":          { width: 1.86, length: 4.62, height: 1.68 },
  "Honda Pilot":         { width: 2.00, length: 5.00, height: 1.80 },
  "Honda Odyssey":       { width: 1.99, length: 5.16, height: 1.74 },
  // Volkswagen
  "Volkswagen Gol":      { width: 1.66, length: 3.89, height: 1.45 },
  "Volkswagen Polo":     { width: 1.75, length: 4.05, height: 1.46 },
  "Volkswagen Virtus":   { width: 1.75, length: 4.48, height: 1.48 },
  "Volkswagen Jetta":    { width: 1.80, length: 4.70, height: 1.46 },
  "Volkswagen Golf":     { width: 1.79, length: 4.28, height: 1.48 },
  "Volkswagen Nivus":    { width: 1.76, length: 4.27, height: 1.50 },
  "Volkswagen T-Cross":  { width: 1.76, length: 4.22, height: 1.58 },
  "Volkswagen Taos":     { width: 1.81, length: 4.45, height: 1.63 },
  "Volkswagen Tiguan":   { width: 1.84, length: 4.51, height: 1.67 },
  "Volkswagen Touareg":  { width: 1.98, length: 4.88, height: 1.71 },
  "Volkswagen Amarok":   { width: 1.95, length: 5.25, height: 1.83 },
  "Volkswagen Transporter":{ width: 1.90, length: 4.90, height: 1.99 },
  "Volkswagen Crafter":  { width: 2.04, length: 5.99, height: 2.36 },
  // Renault
  "Renault Kwid":        { width: 1.58, length: 3.68, height: 1.50 },
  "Renault Clio":        { width: 1.80, length: 4.05, height: 1.44 },
  "Renault Sandero":     { width: 1.73, length: 4.07, height: 1.52 },
  "Renault Stepway":     { width: 1.76, length: 4.08, height: 1.61 },
  "Renault Logan":       { width: 1.73, length: 4.36, height: 1.52 },
  "Renault Duster":      { width: 1.80, length: 4.33, height: 1.63 },
  "Renault Captur":      { width: 1.80, length: 4.24, height: 1.58 },
  "Renault Koleos":      { width: 1.84, length: 4.67, height: 1.67 },
  "Renault Megane":      { width: 1.81, length: 4.36, height: 1.45 },
  "Renault Kangoo":      { width: 1.83, length: 4.49, height: 1.83 },
  "Renault Oroch":       { width: 1.82, length: 4.70, height: 1.71 },
  "Renault Trafic":      { width: 1.96, length: 5.00, height: 1.97 },
  "Renault Master":      { width: 2.07, length: 5.55, height: 2.30 },
  // Suzuki
  "Suzuki Alto":         { width: 1.48, length: 3.40, height: 1.47 },
  "Suzuki Swift":        { width: 1.69, length: 3.85, height: 1.50 },
  "Suzuki Baleno":       { width: 1.74, length: 3.99, height: 1.50 },
  "Suzuki Dzire":        { width: 1.73, length: 3.99, height: 1.52 },
  "Suzuki Jimny":        { width: 1.65, length: 3.64, height: 1.72 },
  "Suzuki Vitara":       { width: 1.78, length: 4.17, height: 1.61 },
  "Suzuki Grand Vitara": { width: 1.79, length: 4.30, height: 1.64 },
  "Suzuki S-Cross":      { width: 1.78, length: 4.30, height: 1.59 },
  "Suzuki Ertiga":       { width: 1.74, length: 4.39, height: 1.69 },
  // Subaru
  "Subaru Impreza":      { width: 1.78, length: 4.48, height: 1.48 },
  "Subaru Legacy":       { width: 1.84, length: 4.84, height: 1.50 },
  "Subaru Outback":      { width: 1.86, length: 4.87, height: 1.67 },
  "Subaru Forester":     { width: 1.81, length: 4.63, height: 1.73 },
  "Subaru Crosstrek":    { width: 1.80, length: 4.48, height: 1.60 },
  "Subaru XV":           { width: 1.80, length: 4.46, height: 1.60 },
  "Subaru WRX":          { width: 1.80, length: 4.59, height: 1.47 },
  // Mitsubishi
  "Mitsubishi Mirage":   { width: 1.67, length: 3.84, height: 1.51 },
  "Mitsubishi Lancer":   { width: 1.76, length: 4.58, height: 1.47 },
  "Mitsubishi ASX":      { width: 1.77, length: 4.36, height: 1.64 },
  "Mitsubishi Outlander":{ width: 1.86, length: 4.71, height: 1.74 },
  "Mitsubishi Eclipse Cross":{ width: 1.81, length: 4.55, height: 1.69 },
  "Mitsubishi Montero":  { width: 1.87, length: 4.90, height: 1.90 },
  "Mitsubishi Montero Sport":{ width: 1.82, length: 4.83, height: 1.81 },
  "Mitsubishi L200":     { width: 1.81, length: 5.27, height: 1.78 },
  "Mitsubishi Triton":   { width: 1.81, length: 5.27, height: 1.78 },
  "Mitsubishi Xpander":  { width: 1.75, length: 4.48, height: 1.73 },
  // MG
  "MG MG3":              { width: 1.73, length: 4.06, height: 1.52 },
  "MG MG5":              { width: 1.82, length: 4.67, height: 1.47 },
  "MG ZS":               { width: 1.81, length: 4.32, height: 1.62 },
  "MG HS":               { width: 1.87, length: 4.57, height: 1.68 },
  "MG RX5":              { width: 1.86, length: 4.58, height: 1.72 },
  "MG MG4":              { width: 1.84, length: 4.29, height: 1.52 },
  // Chery
  "Chery Tiggo 2":       { width: 1.76, length: 4.20, height: 1.57 },
  "Chery Tiggo 2 Pro":   { width: 1.76, length: 4.20, height: 1.58 },
  "Chery Tiggo 3":       { width: 1.76, length: 4.36, height: 1.63 },
  "Chery Tiggo 4":       { width: 1.83, length: 4.36, height: 1.74 },
  "Chery Tiggo 7":       { width: 1.84, length: 4.50, height: 1.75 },
  "Chery Tiggo 7 Pro":   { width: 1.86, length: 4.50, height: 1.71 },
  "Chery Tiggo 8":       { width: 1.86, length: 4.70, height: 1.75 },
  "Chery Tiggo 8 Pro":   { width: 1.86, length: 4.72, height: 1.74 },
  "Chery QQ":            { width: 1.52, length: 3.55, height: 1.53 },
  "Chery Arrizo 5":      { width: 1.79, length: 4.57, height: 1.48 },
  // Changan
  "Changan CS15":        { width: 1.73, length: 4.10, height: 1.60 },
  "Changan CS35":        { width: 1.82, length: 4.34, height: 1.67 },
  "Changan CS35 Plus":   { width: 1.81, length: 4.34, height: 1.68 },
  "Changan CS55":        { width: 1.85, length: 4.51, height: 1.68 },
  "Changan CS75":        { width: 1.87, length: 4.65, height: 1.70 },
  "Changan CS95":        { width: 1.98, length: 4.95, height: 1.79 },
  "Changan Hunter":      { width: 1.93, length: 5.40, height: 1.88 },
  "Changan Alsvin":      { width: 1.73, length: 4.39, height: 1.51 },
  // JAC
  "JAC JS2":             { width: 1.76, length: 4.13, height: 1.63 },
  "JAC JS3":             { width: 1.76, length: 4.33, height: 1.66 },
  "JAC JS4":             { width: 1.78, length: 4.41, height: 1.66 },
  "JAC T6":              { width: 1.80, length: 5.31, height: 1.77 },
  "JAC T8":              { width: 1.87, length: 5.33, height: 1.93 },
  "JAC S3":              { width: 1.76, length: 4.33, height: 1.66 },
  // Great Wall
  "Great Wall Poer":     { width: 1.93, length: 5.41, height: 1.89 },
  "Great Wall Wingle":   { width: 1.80, length: 5.04, height: 1.75 },
  "Great Wall H6":       { width: 1.89, length: 4.65, height: 1.73 },
  "Great Wall Tank 300": { width: 1.93, length: 4.76, height: 1.90 },
  // Maxus
  "Maxus T60":           { width: 1.90, length: 5.36, height: 1.81 },
  "Maxus T90":           { width: 1.93, length: 5.36, height: 1.87 },
  "Maxus D60":           { width: 1.85, length: 4.72, height: 1.72 },
  "Maxus D90":           { width: 1.93, length: 5.00, height: 1.88 },
  "Maxus V80":           { width: 1.98, length: 5.70, height: 2.36 },
  "Maxus V90":           { width: 2.00, length: 5.55, height: 2.36 },
  "Maxus G10":           { width: 1.98, length: 5.17, height: 1.93 },
  "Maxus G50":           { width: 1.83, length: 4.83, height: 1.78 },
  // Geely
  "Geely Coolray":       { width: 1.80, length: 4.33, height: 1.61 },
  "Geely Azkarra":       { width: 1.87, length: 4.54, height: 1.71 },
  "Geely Emgrand":       { width: 1.80, length: 4.63, height: 1.47 },
  "Geely Tugella":       { width: 1.90, length: 4.61, height: 1.65 },
  "Geely Monjaro":       { width: 1.90, length: 4.77, height: 1.69 },
  // Haval
  "Haval Jolion":        { width: 1.87, length: 4.47, height: 1.63 },
  "Haval H6":            { width: 1.89, length: 4.65, height: 1.73 },
  "Haval Dargo":         { width: 1.93, length: 4.62, height: 1.78 },
  "Haval H2":            { width: 1.81, length: 4.34, height: 1.70 },
  // BYD
  "BYD Dolphin":         { width: 1.77, length: 4.13, height: 1.57 },
  "BYD Yuan Plus":       { width: 1.88, length: 4.46, height: 1.61 },
  "BYD Atto 3":          { width: 1.88, length: 4.46, height: 1.61 },
  "BYD Seal":            { width: 1.88, length: 4.80, height: 1.46 },
  "BYD Han":             { width: 1.91, length: 4.99, height: 1.49 },
  "BYD Tang":            { width: 1.95, length: 4.87, height: 1.73 },
  "BYD Song Plus":       { width: 1.89, length: 4.71, height: 1.62 },
  // BMW
  "BMW Serie 1":         { width: 1.80, length: 4.32, height: 1.45 },
  "BMW Serie 2":         { width: 1.80, length: 4.52, height: 1.42 },
  "BMW Serie 3":         { width: 1.83, length: 4.71, height: 1.44 },
  "BMW Serie 4":         { width: 1.85, length: 4.77, height: 1.39 },
  "BMW Serie 5":         { width: 1.87, length: 4.96, height: 1.48 },
  "BMW Serie 7":         { width: 1.95, length: 5.39, height: 1.54 },
  "BMW X1":              { width: 1.83, length: 4.50, height: 1.64 },
  "BMW X3":              { width: 1.89, length: 4.71, height: 1.68 },
  "BMW X5":              { width: 2.00, length: 4.92, height: 1.75 },
  "BMW X6":              { width: 2.00, length: 4.94, height: 1.70 },
  "BMW X7":              { width: 2.00, length: 5.15, height: 1.80 },
  "BMW iX":              { width: 1.97, length: 4.95, height: 1.70 },
  // Mercedes-Benz
  "Mercedes-Benz Clase A":{ width: 1.80, length: 4.42, height: 1.44 },
  "Mercedes-Benz Clase B":{ width: 1.80, length: 4.42, height: 1.56 },
  "Mercedes-Benz Clase C":{ width: 1.82, length: 4.75, height: 1.44 },
  "Mercedes-Benz Clase E":{ width: 1.85, length: 4.94, height: 1.46 },
  "Mercedes-Benz Clase S":{ width: 1.92, length: 5.29, height: 1.50 },
  "Mercedes-Benz GLA":   { width: 1.83, length: 4.41, height: 1.61 },
  "Mercedes-Benz GLB":   { width: 1.83, length: 4.63, height: 1.70 },
  "Mercedes-Benz GLC":   { width: 1.89, length: 4.71, height: 1.64 },
  "Mercedes-Benz GLE":   { width: 1.95, length: 4.92, height: 1.77 },
  "Mercedes-Benz GLS":   { width: 2.03, length: 5.21, height: 1.82 },
  "Mercedes-Benz Vito":  { width: 1.93, length: 5.14, height: 1.91 },
  "Mercedes-Benz Sprinter":{ width: 2.02, length: 5.93, height: 2.36 },
  // Audi
  "Audi A1":             { width: 1.74, length: 4.03, height: 1.41 },
  "Audi A3":             { width: 1.82, length: 4.34, height: 1.43 },
  "Audi A4":             { width: 1.85, length: 4.76, height: 1.43 },
  "Audi A5":             { width: 1.85, length: 4.69, height: 1.37 },
  "Audi A6":             { width: 1.89, length: 4.94, height: 1.46 },
  "Audi A7":             { width: 1.91, length: 4.97, height: 1.42 },
  "Audi A8":             { width: 1.95, length: 5.17, height: 1.47 },
  "Audi Q2":             { width: 1.79, length: 4.19, height: 1.52 },
  "Audi Q3":             { width: 1.84, length: 4.48, height: 1.59 },
  "Audi Q5":             { width: 1.89, length: 4.66, height: 1.66 },
  "Audi Q7":             { width: 2.00, length: 5.07, height: 1.74 },
  "Audi Q8":             { width: 2.00, length: 4.99, height: 1.71 },
  // Volvo
  "Volvo S60":           { width: 1.85, length: 4.76, height: 1.43 },
  "Volvo S90":           { width: 1.88, length: 4.96, height: 1.44 },
  "Volvo V60":           { width: 1.85, length: 4.76, height: 1.43 },
  "Volvo V90":           { width: 1.88, length: 4.94, height: 1.47 },
  "Volvo XC40":          { width: 1.86, length: 4.43, height: 1.65 },
  "Volvo XC60":          { width: 1.90, length: 4.69, height: 1.66 },
  "Volvo XC90":          { width: 1.92, length: 4.95, height: 1.78 },
};

// Resolve exterior dimensions for a vehicle. Tries the explicit model lookup
// first, then the type-based fallback. Returns null if nothing matches so the
// form can leave the fields empty rather than guessing blindly.
export function getVehicleDimensions(brand, model, type) {
  if (brand && model) {
    const key = `${brand} ${model}`.trim();
    if (CAR_MODEL_DIMENSIONS[key]) return CAR_MODEL_DIMENSIONS[key];
  }
  if (type && VEHICLE_TYPE_DIMENSIONS[type]) return VEHICLE_TYPE_DIMENSIONS[type];
  return null;
}

export const CHILE_REGIONS_COMUNAS = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Villa Alemana"],
  "Libertador General Bernardo O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Chillán Viejo", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Trehuaco", "San Carlos", "Coihueco", "Ñiquén", "San Fabián", "San Nicolás"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén del General Carlos Ibáñez del Campo": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"],
  "Metropolitana de Santiago": [
    "Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
  ]
};


