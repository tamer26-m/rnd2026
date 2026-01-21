// بيانات الولايات الجزائرية (58 ولاية) مع جميع الدوائر والبلديات
export interface Commune {
  name: string;
  nameAr: string;
}

export interface Daira {
  code: string;
  name: string;
  nameAr: string;
  communes: Commune[];
}

export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  dairas: Daira[];
}

export const WILAYAS: Wilaya[] = [
  {
    code: "01",
    name: "Adrar",
    nameAr: "أدرار",
    dairas: [
      { code: "0101", name: "Adrar", nameAr: "أدرار", communes: [
        { name: "Adrar", nameAr: "أدرار" },
        { name: "Bouda", nameAr: "بودة" },
        { name: "Ouled Ahmed Timmi", nameAr: "أولاد أحمد تيمي" },
        { name: "Timmi", nameAr: "تيمي" }
      ]},
      { code: "0102", name: "Reggane", nameAr: "رقان", communes: [
        { name: "Reggane", nameAr: "رقان" },
        { name: "Sali", nameAr: "سالي" }
      ]},
      { code: "0103", name: "Aoulef", nameAr: "أولف", communes: [
        { name: "Aoulef", nameAr: "أولف" },
        { name: "Akabli", nameAr: "اقبلي" },
        { name: "Tit", nameAr: "تيت" },
        { name: "Timekten", nameAr: "تيمقتن" }
      ]},
      { code: "0104", name: "Fenoughil", nameAr: "فنوغيل", communes: [
        { name: "Fenoughil", nameAr: "فنوغيل" },
        { name: "Tamantit", nameAr: "تامنطيط" },
        { name: "Tamest", nameAr: "تامست" }
      ]},
      { code: "0105", name: "Tsabit", nameAr: "تسابيت", communes: [
        { name: "Tsabit", nameAr: "تسابيت" },
        { name: "Sebaa", nameAr: "السبع" },
        { name: "Metarfa", nameAr: "المطارفة" }
      ]},
      { code: "0106", name: "Zaouiet Kounta", nameAr: "زاوية كنتة", communes: [
        { name: "Zaouiet Kounta", nameAr: "زاوية كنتة" },
        { name: "In Zghmir", nameAr: "إن زغمير" },
        { name: "Ksar Kaddour", nameAr: "قصر قدور" }
      ]}
    ]
  },
  {
    code: "02",
    name: "Chlef",
    nameAr: "الشلف",
    dairas: [
      { code: "0201", name: "Chlef", nameAr: "الشلف", communes: [
        { name: "Chlef", nameAr: "الشلف" },
        { name: "Oum Drou", nameAr: "أم الدروع" },
        { name: "Sendjas", nameAr: "سنجاس" },
        { name: "Medjadja", nameAr: "مجاجة" }
      ]},
      { code: "0202", name: "Tenes", nameAr: "تنس", communes: [
        { name: "Tenes", nameAr: "تنس" },
        { name: "Sidi Abderrahmane", nameAr: "سيدي عبد الرحمن" },
        { name: "Sidi Akkacha", nameAr: "سيدي عكاشة" },
        { name: "El Marsa", nameAr: "المرسى" }
      ]},
      { code: "0203", name: "Boukadir", nameAr: "بوقادير", communes: [
        { name: "Boukadir", nameAr: "بوقادير" },
        { name: "Oued Sly", nameAr: "وادي سلي" },
        { name: "Sobha", nameAr: "الصبحة" },
        { name: "Ouled Ben Abdelkader", nameAr: "أولاد بن عبد القادر" }
      ]},
      { code: "0204", name: "El Karimia", nameAr: "الكريمية", communes: [
        { name: "El Karimia", nameAr: "الكريمية" },
        { name: "Beni Bouattab", nameAr: "بني بوعتاب" },
        { name: "Harchoun", nameAr: "حرشون" },
        { name: "Tadjena", nameAr: "تاجنة" }
      ]},
      { code: "0205", name: "Oued Fodda", nameAr: "وادي الفضة", communes: [
        { name: "Oued Fodda", nameAr: "وادي الفضة" },
        { name: "Beni Rached", nameAr: "بني راشد" },
        { name: "Ouled Abbes", nameAr: "أولاد عباس" },
        { name: "Ain Merane", nameAr: "عين مران" }
      ]},
      { code: "0206", name: "Ouled Fares", nameAr: "أولاد فارس", communes: [
        { name: "Ouled Fares", nameAr: "أولاد فارس" },
        { name: "Chettia", nameAr: "الشطية" },
        { name: "Labiod Medjadja", nameAr: "الأبيض مجاجة" },
        { name: "Harenfa", nameAr: "الهرانفة" }
      ]},
      { code: "0207", name: "Beni Haoua", nameAr: "بني حواء", communes: [
        { name: "Beni Haoua", nameAr: "بني حواء" },
        { name: "Breira", nameAr: "بريرة" },
        { name: "Oued Goussine", nameAr: "وادي قوسين" }
      ]},
      { code: "0208", name: "Zeboudja", nameAr: "الزبوجة", communes: [
        { name: "Zeboudja", nameAr: "الزبوجة" },
        { name: "Benairia", nameAr: "بنايرية" },
        { name: "Bouzeghaia", nameAr: "بوزغاية" }
      ]},
      { code: "0209", name: "Abou El Hassan", nameAr: "أبو الحسن", communes: [
        { name: "Abou El Hassan", nameAr: "أبو الحسن" },
        { name: "Talassa", nameAr: "تلعصة" },
        { name: "Moussadek", nameAr: "مصدق" }
      ]},
      { code: "0210", name: "Taougrit", nameAr: "تاوقريت", communes: [
        { name: "Taougrit", nameAr: "تاوقريت" },
        { name: "Dahra", nameAr: "الظهرة" }
      ]}
    ]
  },
  {
    code: "03",
    name: "Laghouat",
    nameAr: "الأغواط",
    dairas: [
      { code: "0301", name: "Laghouat", nameAr: "الأغواط", communes: [
        { name: "Laghouat", nameAr: "الأغواط" },
        { name: "Mekhareg", nameAr: "مخارق" },
        { name: "Sidi Makhlouf", nameAr: "سيدي مخلوف" }
      ]},
      { code: "0302", name: "Aflou", nameAr: "أفلو", communes: [
        { name: "Aflou", nameAr: "أفلو" },
        { name: "Sebgag", nameAr: "سبقاق" },
        { name: "Sidi Bouzid", nameAr: "سيدي بوزيد" },
        { name: "Oued Morra", nameAr: "وادي مرة" }
      ]},
      { code: "0303", name: "Ksar El Hirane", nameAr: "قصر الحيران", communes: [
        { name: "Ksar El Hirane", nameAr: "قصر الحيران" },
        { name: "Benacer Benchohra", nameAr: "بن ناصر بن شهرة" },
        { name: "El Haouaita", nameAr: "الحويطة" }
      ]},
      { code: "0304", name: "Hassi R'mel", nameAr: "حاسي الرمل", communes: [
        { name: "Hassi R'mel", nameAr: "حاسي الرمل" },
        { name: "Hassi Delaa", nameAr: "حاسي الدلاعة" }
      ]},
      { code: "0305", name: "Ain Madhi", nameAr: "عين ماضي", communes: [
        { name: "Ain Madhi", nameAr: "عين ماضي" },
        { name: "Tadjemout", nameAr: "تاجموت" },
        { name: "Kheneg", nameAr: "الخنق" },
        { name: "Taouiala", nameAr: "تاويالة" }
      ]},
      { code: "0306", name: "Brida", nameAr: "بريدة", communes: [
        { name: "Brida", nameAr: "بريدة" },
        { name: "Hadj Mechri", nameAr: "الحاج مشري" },
        { name: "Gueltat Sidi Saad", nameAr: "قلتة سيدي سعد" }
      ]},
      { code: "0307", name: "El Ghicha", nameAr: "الغيشة", communes: [
        { name: "El Ghicha", nameAr: "الغيشة" },
        { name: "Ain Sidi Ali", nameAr: "عين سيدي علي" }
      ]},
      { code: "0308", name: "Oued M'zi", nameAr: "وادي مزي", communes: [
        { name: "Oued M'zi", nameAr: "وادي مزي" },
        { name: "El Assafia", nameAr: "العسافية" }
      ]}
    ]
  },
  {
    code: "04",
    name: "Oum El Bouaghi",
    nameAr: "أم البواقي",
    dairas: [
      { code: "0401", name: "Oum El Bouaghi", nameAr: "أم البواقي", communes: [
        { name: "Oum El Bouaghi", nameAr: "أم البواقي" },
        { name: "Ain Zitoun", nameAr: "عين الزيتون" },
        { name: "Hanchir Toumghani", nameAr: "حنشير تومغني" }
      ]},
      { code: "0402", name: "Ain Beida", nameAr: "عين البيضاء", communes: [
        { name: "Ain Beida", nameAr: "عين البيضاء" },
        { name: "Berriche", nameAr: "بريش" },
        { name: "Zorg", nameAr: "الزرق" },
        { name: "El Belala", nameAr: "البلالة" }
      ]},
      { code: "0403", name: "Ain M'lila", nameAr: "عين مليلة", communes: [
        { name: "Ain M'lila", nameAr: "عين مليلة" },
        { name: "Ouled Gacem", nameAr: "أولاد قاسم" },
        { name: "Ain Kercha", nameAr: "عين كرشة" },
        { name: "El Amiria", nameAr: "العامرية" }
      ]},
      { code: "0404", name: "Meskiana", nameAr: "مسكيانة", communes: [
        { name: "Meskiana", nameAr: "مسكيانة" },
        { name: "Rahia", nameAr: "الرحية" },
        { name: "Dhalaa", nameAr: "الضلعة" }
      ]},
      { code: "0405", name: "Ain Fekroun", nameAr: "عين فكرون", communes: [
        { name: "Ain Fekroun", nameAr: "عين فكرون" },
        { name: "Bir Chouhada", nameAr: "بئر الشهداء" },
        { name: "Ouled Zouai", nameAr: "أولاد زواي" }
      ]},
      { code: "0406", name: "Sigus", nameAr: "سيقوس", communes: [
        { name: "Sigus", nameAr: "سيقوس" },
        { name: "El Harmilia", nameAr: "الحرملية" },
        { name: "Ain Babouche", nameAr: "عين بابوش" }
      ]},
      { code: "0407", name: "Ksar Sbahi", nameAr: "قصر الصباحي", communes: [
        { name: "Ksar Sbahi", nameAr: "قصر الصباحي" },
        { name: "Fkirina", nameAr: "فكيرينة" },
        { name: "Souk Naamane", nameAr: "سوق نعمان" }
      ]},
      { code: "0408", name: "F'kirina", nameAr: "فكيرينة", communes: [
        { name: "F'kirina", nameAr: "فكيرينة" }
      ]}
    ]
  },
  {
    code: "05",
    name: "Batna",
    nameAr: "باتنة",
    dairas: [
      { code: "0501", name: "Batna", nameAr: "باتنة", communes: [
        { name: "Batna", nameAr: "باتنة" },
        { name: "Fesdis", nameAr: "فسديس" },
        { name: "Oued Chaaba", nameAr: "وادي الشعبة" },
        { name: "Lazrou", nameAr: "لازرو" }
      ]},
      { code: "0502", name: "Barika", nameAr: "بريكة", communes: [
        { name: "Barika", nameAr: "بريكة" },
        { name: "Bitam", nameAr: "بيطام" },
        { name: "M'doukal", nameAr: "إمدوكل" },
        { name: "Djezzar", nameAr: "جزار" }
      ]},
      { code: "0503", name: "Ain Touta", nameAr: "عين التوتة", communes: [
        { name: "Ain Touta", nameAr: "عين التوتة" },
        { name: "Maafa", nameAr: "معافة" },
        { name: "Ouled Selam", nameAr: "أولاد سلام" },
        { name: "Hidoussa", nameAr: "حيدوسة" }
      ]},
      { code: "0504", name: "N'gaous", nameAr: "نقاوس", communes: [
        { name: "N'gaous", nameAr: "نقاوس" },
        { name: "Boumagueur", nameAr: "بومقر" },
        { name: "Sefiane", nameAr: "سفيان" },
        { name: "Ras El Aioun", nameAr: "رأس العيون" }
      ]},
      { code: "0505", name: "Merouana", nameAr: "مروانة", communes: [
        { name: "Merouana", nameAr: "مروانة" },
        { name: "Oued El Ma", nameAr: "وادي الماء" },
        { name: "Talkhamt", nameAr: "تالخمت" }
      ]},
      { code: "0506", name: "Arris", nameAr: "أريس", communes: [
        { name: "Arris", nameAr: "أريس" },
        { name: "Tighanimine", nameAr: "تيغانمين" },
        { name: "Foum Toub", nameAr: "فم الطوب" },
        { name: "Inoughissen", nameAr: "إينوغيسن" }
      ]},
      { code: "0507", name: "Tazoult", nameAr: "تازولت", communes: [
        { name: "Tazoult", nameAr: "تازولت" },
        { name: "Ghassira", nameAr: "غسيرة" }
      ]},
      { code: "0508", name: "Timgad", nameAr: "تيمقاد", communes: [
        { name: "Timgad", nameAr: "تيمقاد" },
        { name: "Oued Taga", nameAr: "وادي الطاقة" }
      ]},
      { code: "0509", name: "Menaa", nameAr: "منعة", communes: [
        { name: "Menaa", nameAr: "منعة" },
        { name: "Bouzina", nameAr: "بوزينة" },
        { name: "Theniet El Abed", nameAr: "ثنية العابد" }
      ]},
      { code: "0510", name: "Seriana", nameAr: "سريانة", communes: [
        { name: "Seriana", nameAr: "سريانة" },
        { name: "Djerma", nameAr: "جرمة" },
        { name: "Ain Djasser", nameAr: "عين جاسر" }
      ]},
      { code: "0511", name: "Chemora", nameAr: "الشمرة", communes: [
        { name: "Chemora", nameAr: "الشمرة" },
        { name: "Ouled Ammar", nameAr: "أولاد عمار" }
      ]},
      { code: "0512", name: "El Madher", nameAr: "المعذر", communes: [
        { name: "El Madher", nameAr: "المعذر" },
        { name: "Boumia", nameAr: "بومية" },
        { name: "Djeroh", nameAr: "جروح" }
      ]},
      { code: "0513", name: "Ichemoul", nameAr: "إشمول", communes: [
        { name: "Ichemoul", nameAr: "إشمول" },
        { name: "Chir", nameAr: "شير" },
        { name: "Taxlent", nameAr: "تاكسلانت" }
      ]},
      { code: "0514", name: "Ouled Si Slimane", nameAr: "أولاد سي سليمان", communes: [
        { name: "Ouled Si Slimane", nameAr: "أولاد سي سليمان" },
        { name: "Tilatou", nameAr: "تيلاطو" }
      ]},
      { code: "0515", name: "Seggana", nameAr: "سقانة", communes: [
        { name: "Seggana", nameAr: "سقانة" },
        { name: "Tkout", nameAr: "تكوت" }
      ]},
      { code: "0516", name: "Rahbat", nameAr: "الرحبات", communes: [
        { name: "Rahbat", nameAr: "الرحبات" },
        { name: "Lemsane", nameAr: "لمسان" }
      ]}
    ]
  },
  {
    code: "06",
    name: "Bejaia",
    nameAr: "بجاية",
    dairas: [
      { code: "0601", name: "Bejaia", nameAr: "بجاية", communes: [
        { name: "Bejaia", nameAr: "بجاية" },
        { name: "Oued Ghir", nameAr: "وادي غير" },
        { name: "Tala Hamza", nameAr: "تالة حمزة" },
        { name: "Boukhlifa", nameAr: "بوخليفة" }
      ]},
      { code: "0602", name: "Akbou", nameAr: "أقبو", communes: [
        { name: "Akbou", nameAr: "أقبو" },
        { name: "Chellata", nameAr: "شلاطة" },
        { name: "Ighram", nameAr: "اغرم" },
        { name: "Tamokra", nameAr: "تامقرة" },
        { name: "Ouzellaguen", nameAr: "أوزلاقن" }
      ]},
      { code: "0603", name: "Amizour", nameAr: "أميزور", communes: [
        { name: "Amizour", nameAr: "أميزور" },
        { name: "Feraoun", nameAr: "فرعون" },
        { name: "Semaoun", nameAr: "سمعون" },
        { name: "Barbacha", nameAr: "برباشة" }
      ]},
      { code: "0604", name: "El Kseur", nameAr: "القصر", communes: [
        { name: "El Kseur", nameAr: "القصر" },
        { name: "Toudja", nameAr: "توجة" },
        { name: "Kendira", nameAr: "كنديرة" }
      ]},
      { code: "0605", name: "Sidi Aich", nameAr: "سيدي عيش", communes: [
        { name: "Sidi Aich", nameAr: "سيدي عيش" },
        { name: "Tinebdar", nameAr: "تينبدار" },
        { name: "Leflaye", nameAr: "لفلاي" },
        { name: "Mcisna", nameAr: "مسيسنة" }
      ]},
      { code: "0606", name: "Kherrata", nameAr: "خراطة", communes: [
        { name: "Kherrata", nameAr: "خراطة" },
        { name: "Dra El Caid", nameAr: "ذراع القايد" },
        { name: "Oued Bared", nameAr: "وادي البارد" }
      ]},
      { code: "0607", name: "Tazmalt", nameAr: "تازملت", communes: [
        { name: "Tazmalt", nameAr: "تازمالت" },
        { name: "Boudjellil", nameAr: "بو جليل" },
        { name: "Ait R'zine", nameAr: "آيت رزين" },
        { name: "Beni Mellikeche", nameAr: "بني مليكش" }
      ]},
      { code: "0608", name: "Seddouk", nameAr: "صدوق", communes: [
        { name: "Seddouk", nameAr: "صدوق" },
        { name: "Amalou", nameAr: "أمالو" },
        { name: "Bouhamza", nameAr: "بوحمزة" }
      ]},
      { code: "0609", name: "Adekar", nameAr: "أدكار", communes: [
        { name: "Adekar", nameAr: "أدكار" },
        { name: "Taourirt Ighil", nameAr: "تاوريرت إيغيل" },
        { name: "Beni Ksila", nameAr: "بني كسيلة" }
      ]},
      { code: "0610", name: "Chemini", nameAr: "شميني", communes: [
        { name: "Chemini", nameAr: "شميني" },
        { name: "Souk Oufella", nameAr: "سوق أوفلة" },
        { name: "Tibane", nameAr: "تيبان" }
      ]},
      { code: "0611", name: "Darguina", nameAr: "درقينة", communes: [
        { name: "Darguina", nameAr: "درقينة" },
        { name: "Tizi N'berber", nameAr: "تيزي نبربر" },
        { name: "Ait Smail", nameAr: "آيت سماعيل" }
      ]},
      { code: "0612", name: "Souk El Tenine", nameAr: "سوق الاثنين", communes: [
        { name: "Souk El Tenine", nameAr: "سوق الاثنين" },
        { name: "Melbou", nameAr: "ملبو" },
        { name: "Tamridjet", nameAr: "تامريجت" }
      ]}
    ]
  },
  {
    code: "07",
    name: "Biskra",
    nameAr: "بسكرة",
    dairas: [
      { code: "0701", name: "Biskra", nameAr: "بسكرة", communes: [
        { name: "Biskra", nameAr: "بسكرة" },
        { name: "El Hadjab", nameAr: "الحاجب" },
        { name: "Oumache", nameAr: "أوماش" },
        { name: "Branis", nameAr: "برانيس" }
      ]},
      { code: "0702", name: "Tolga", nameAr: "طولقة", communes: [
        { name: "Tolga", nameAr: "طولقة" },
        { name: "Lichana", nameAr: "ليشانة" },
        { name: "Bordj Ben Azzouz", nameAr: "برج بن عزوز" },
        { name: "Bouchagroun", nameAr: "بوشقرون" },
        { name: "Foughala", nameAr: "فوغالة" }
      ]},
      { code: "0703", name: "Sidi Okba", nameAr: "سيدي عقبة", communes: [
        { name: "Sidi Okba", nameAr: "سيدي عقبة" },
        { name: "Chetma", nameAr: "شتمة" },
        { name: "Ain Naga", nameAr: "عين الناقة" },
        { name: "El Haouch", nameAr: "الحوش" }
      ]},
      { code: "0704", name: "Zeribet El Oued", nameAr: "زريبة الوادي", communes: [
        { name: "Zeribet El Oued", nameAr: "زريبة الوادي" },
        { name: "El Feidh", nameAr: "الفيض" },
        { name: "Khanguet Sidi Nadji", nameAr: "خنقة سيدي ناجي" }
      ]},
      { code: "0705", name: "El Kantara", nameAr: "القنطرة", communes: [
        { name: "El Kantara", nameAr: "القنطرة" },
        { name: "Ain Zaatout", nameAr: "عين زعطوط" },
        { name: "Djemorah", nameAr: "جمورة" }
      ]},
      { code: "0706", name: "Ourlal", nameAr: "أورلال", communes: [
        { name: "Ourlal", nameAr: "أورلال" },
        { name: "Lioua", nameAr: "ليوة" },
        { name: "M'lili", nameAr: "مليلي" }
      ]},
      { code: "0707", name: "M'Chouneche", nameAr: "مشونش", communes: [
        { name: "M'Chouneche", nameAr: "مشونش" }
      ]},
      { code: "0708", name: "El Outaya", nameAr: "الوطاية", communes: [
        { name: "El Outaya", nameAr: "الوطاية" },
        { name: "El Ghrous", nameAr: "الغروس" }
      ]}
    ]
  },
  {
    code: "08",
    name: "Bechar",
    nameAr: "بشار",
    dairas: [
      { code: "0801", name: "Bechar", nameAr: "بشار", communes: [
        { name: "Bechar", nameAr: "بشار" },
        { name: "Bechar Djedid", nameAr: "بشار الجديدة" }
      ]},
      { code: "0802", name: "Kenadsa", nameAr: "القنادسة", communes: [
        { name: "Kenadsa", nameAr: "القنادسة" },
        { name: "Meridja", nameAr: "المريجة" }
      ]},
      { code: "0803", name: "Abadla", nameAr: "العبادلة", communes: [
        { name: "Abadla", nameAr: "العبادلة" },
        { name: "Erg Ferradj", nameAr: "عرق فراج" },
        { name: "Ouled Khodeir", nameAr: "أولاد خضير" }
      ]},
      { code: "0804", name: "Beni Ounif", nameAr: "بني ونيف", communes: [
        { name: "Beni Ounif", nameAr: "بني ونيف" },
        { name: "Mogheul", nameAr: "موغل" }
      ]},
      { code: "0805", name: "Taghit", nameAr: "تاغيت", communes: [
        { name: "Taghit", nameAr: "تاغيت" }
      ]},
      { code: "0806", name: "Lahmar", nameAr: "لحمر", communes: [
        { name: "Lahmar", nameAr: "لحمر" },
        { name: "Boukais", nameAr: "بوكايس" },
        { name: "Mougheul", nameAr: "موغل" }
      ]},
      { code: "0807", name: "Tabelbala", nameAr: "تبلبالة", communes: [
        { name: "Tabelbala", nameAr: "تبلبالة" }
      ]},
    ]
  },
  {
    code: "09",
    name: "Blida",
    nameAr: "البليدة",
    dairas: [
      { code: "0901", name: "Blida", nameAr: "البليدة", communes: [
        { name: "Blida", nameAr: "البليدة" },
        { name: "Bouarfa", nameAr: "بوعرفة" },
        { name: "Beni Mered", nameAr: "بني مراد" }
      ]},
      { code: "0902", name: "Boufarik", nameAr: "بوفاريك", communes: [
        { name: "Boufarik", nameAr: "بوفاريك" },
        { name: "Soumaa", nameAr: "الصومعة" },
        { name: "Guerrouaou", nameAr: "قرواو" },
        { name: "Beni Tamou", nameAr: "بني تامو" }
      ]},
      { code: "0903", name: "Mouzaia", nameAr: "موزاية", communes: [
        { name: "Mouzaia", nameAr: "موزاية" },
        { name: "Chiffa", nameAr: "الشفة" },
        { name: "Ain Romana", nameAr: "عين الرمانة" },
        { name: "Chrea", nameAr: "الشريعة" }
      ]},
      { code: "0904", name: "Larbaa", nameAr: "الأربعاء", communes: [
        { name: "Larbaa", nameAr: "الأربعاء" },
        { name: "Souhane", nameAr: "صوحان" },
        { name: "Oued El Alleug", nameAr: "وادي العلايق" }
      ]},
      { code: "0905", name: "Meftah", nameAr: "مفتاح", communes: [
        { name: "Meftah", nameAr: "مفتاح" },
        { name: "Djebabra", nameAr: "جبابرة" }
      ]},
      { code: "0906", name: "Bougara", nameAr: "بوقرة", communes: [
        { name: "Bougara", nameAr: "بوقرة" },
        { name: "Hammam Melouane", nameAr: "حمام ملوان" }
      ]},
      { code: "0907", name: "El Affroun", nameAr: "العفرون", communes: [
        { name: "El Affroun", nameAr: "العفرون" },
        { name: "Oued Djer", nameAr: "وادي جر" },
        { name: "Ben Khellil", nameAr: "بن خليل" }
      ]},
      { code: "0908", name: "Ouled Yaich", nameAr: "أولاد يعيش", communes: [
        { name: "Ouled Yaich", nameAr: "أولاد يعيش" }
      ]},
      { code: "0909", name: "Bouinan", nameAr: "بوعينان", communes: [
        { name: "Bouinan", nameAr: "بوعينان" }
      ]}
    ]
  },
  {
    code: "10",
    name: "Bouira",
    nameAr: "البويرة",
    dairas: [
      { code: "1001", name: "Bouira", nameAr: "البويرة", communes: [
        { name: "Bouira", nameAr: "البويرة" },
        { name: "Ait Laaziz", nameAr: "أيت لعزيز" },
        { name: "Haizer", nameAr: "حيزر" },
        { name: "El Hachimia", nameAr: "الهاشمية" }
      ]},
      { code: "1002", name: "Lakhdaria", nameAr: "الأخضرية", communes: [
        { name: "Lakhdaria", nameAr: "الأخضرية" },
        { name: "Guerrouma", nameAr: "قرومة" },
        { name: "Bouderbala", nameAr: "بودربالة" },
        { name: "Zbarbar", nameAr: "زبربر" }
      ]},
      { code: "1003", name: "Sour El Ghozlane", nameAr: "سور الغزلان", communes: [
        { name: "Sour El Ghozlane", nameAr: "سور الغزلان" },
        { name: "Dirah", nameAr: "ديرة" },
        { name: "Dechmia", nameAr: "دشمية" },
        { name: "Maamora", nameAr: "المعمورة" }
      ]},
      { code: "1004", name: "Ain Bessem", nameAr: "عين بسام", communes: [
        { name: "Ain Bessem", nameAr: "عين بسام" },
        { name: "Ain Laloui", nameAr: "عين العلوي" },
        { name: "Souk El Khemis", nameAr: "سوق الخميس" },
        { name: "Raouraoua", nameAr: "الرواراوة" }
      ]},
      { code: "1005", name: "M'chedallah", nameAr: "مشد الله", communes: [
        { name: "M'chedallah", nameAr: "أمشدالة" },
        { name: "Saharidj", nameAr: "سحاريج" },
        { name: "Aghbalou", nameAr: "أغبالو" },
        { name: "Chorfa", nameAr: "الشرفة" }
      ]},
      { code: "1006", name: "Kadiria", nameAr: "القادرية", communes: [
        { name: "Kadiria", nameAr: "قادرية" },
        { name: "Aomar", nameAr: "أعمر" },
        { name: "Djebahia", nameAr: "جباحية" }
      ]},
      { code: "1007", name: "Bechloul", nameAr: "بشلول", communes: [
        { name: "Bechloul", nameAr: "بشلول" },
        { name: "Ahl El Ksar", nameAr: "أهل القصر" },
        { name: "Hanif", nameAr: "حنيف" }
      ]},
      { code: "1008", name: "Bordj Okhriss", nameAr: "برج أوخريص", communes: [
        { name: "Bordj Okhriss", nameAr: "برج أوخريص" },
        { name: "Taguedit", nameAr: "تاقديت" },
        { name: "El Mokrani", nameAr: "المقراني" }
      ]},
      { code: "1009", name: "Bir Ghbalou", nameAr: "بئر غبالو", communes: [
        { name: "Bir Ghbalou", nameAr: "بئر غبالو" },
        { name: "Maala", nameAr: "معالة" }
      ]},
      { code: "1010", name: "El Asnam", nameAr: "الأصنام", communes: [
        { name: "El Asnam", nameAr: "الأصنام" },
        { name: "Ouled Rached", nameAr: "أولاد راشد" }
      ]}
    ]
  },
  {
    code: "11",
    name: "Tamanrasset",
    nameAr: "تمنراست",
    dairas: [
      { code: "1101", name: "Tamanrasset", nameAr: "تمنراست", communes: [
        { name: "Tamanrasset", nameAr: "تمنراست" },
        { name: "Ain Amguel", nameAr: "عين امقل" },
        { name: "Abalessa", nameAr: "أبلسة" }
      ]},
      { code: "1102", name: "Tazrouk", nameAr: "تاظروك", communes: [
        { name: "Tazrouk", nameAr: "تاظروك" },
        { name: "Idles", nameAr: "أدلس" }
      ]}
    ]
  },
  {
    code: "12",
    name: "Tebessa",
    nameAr: "تبسة",
    dairas: [
      { code: "1201", name: "Tebessa", nameAr: "تبسة", communes: [
        { name: "Tebessa", nameAr: "تبسة" },
        { name: "Hammamet", nameAr: "الحمامات" },
        { name: "Bekkaria", nameAr: "بكارية" }
      ]},
      { code: "1202", name: "Bir El Ater", nameAr: "بئر العاتر", communes: [
        { name: "Bir El Ater", nameAr: "بئر العاتر" },
        { name: "El Ogla", nameAr: "العقلة" },
        { name: "Negrine", nameAr: "نقرين" }
      ]},
      { code: "1203", name: "Cheria", nameAr: "الشريعة", communes: [
        { name: "Cheria", nameAr: "الشريعة" },
        { name: "Telidjen", nameAr: "ثليجان" },
        { name: "Stah Guentis", nameAr: "سطح قنطيس" }
      ]},
      { code: "1204", name: "El Aouinet", nameAr: "العوينات", communes: [
        { name: "El Aouinet", nameAr: "العوينات" },
        { name: "Boukhadra", nameAr: "بوخضرة" },
        { name: "Safsaf El Ouesra", nameAr: "صفصاف الوسرة" }
      ]},
      { code: "1205", name: "Ouenza", nameAr: "الونزة", communes: [
        { name: "Ouenza", nameAr: "الونزة" },
        { name: "El Meridj", nameAr: "المريج" }
      ]},
      { code: "1206", name: "El Malabiod", nameAr: "الماء الابيض", communes: [
        { name: "El Malabiod", nameAr: "الماء الابيض" },
        { name: "Bir Mokkadem", nameAr: "بئر مقدم" }
      ]},
      { code: "1207", name: "El Kouif", nameAr: "الكويف", communes: [
        { name: "El Kouif", nameAr: "الكويف" },
        { name: "Morsott", nameAr: "مرسط" }
      ]},
      { code: "1208", name: "Oum Ali", nameAr: "أم علي", communes: [
        { name: "Oum Ali", nameAr: "أم علي" },
        { name: "Ain Zerga", nameAr: "عين الزرقاء" }
      ]}
    ]
  },
  {
    code: "13",
    name: "Tlemcen",
    nameAr: "تلمسان",
    dairas: [
      { code: "1301", name: "Tlemcen", nameAr: "تلمسان", communes: [
        { name: "Tlemcen", nameAr: "تلمسان" },
        { name: "Mansourah", nameAr: "المنصورة" },
        { name: "Chetouane", nameAr: "شتوان" },
        { name: "Beni Mester", nameAr: "بني مستار" }
      ]},
      { code: "1302", name: "Maghnia", nameAr: "مغنية", communes: [
        { name: "Maghnia", nameAr: "مغنية" },
        { name: "Hammam Boughrara", nameAr: "حمام بوغرارة" },
        { name: "Beni Boussaid", nameAr: "بني بوسعيد" },
        { name: "Sidi Medjahed", nameAr: "سيدي مجاهد" }
      ]},
      { code: "1303", name: "Ghazaouet", nameAr: "الغزوات", communes: [
        { name: "Ghazaouet", nameAr: "الغزوات" },
        { name: "Souahlia", nameAr: "السواحلية" },
        { name: "Dar Yaghmouracen", nameAr: "دار يغمراسن" },
        { name: "Tienet", nameAr: "تيانت" }
      ]},
      { code: "1304", name: "Remchi", nameAr: "الرمشي", communes: [
        { name: "Remchi", nameAr: "الرمشي" },
        { name: "Ain Youcef", nameAr: "عين يوسف" },
        { name: "Beni Ouarsous", nameAr: "بني ورسوس" },
        { name: "El Fehoul", nameAr: "الفحول" }
      ]},
      { code: "1305", name: "Nedroma", nameAr: "ندرومة", communes: [
        { name: "Nedroma", nameAr: "ندرومة" },
        { name: "Djebala", nameAr: "جبالة" },
        { name: "Ain Kebira", nameAr: "عين الكبيرة" },
        { name: "Fellaoucene", nameAr: "فلاوسن" }
      ]},
      { code: "1306", name: "Sebdou", nameAr: "سبدو", communes: [
        { name: "Sebdou", nameAr: "سبدو" },
        { name: "El Aricha", nameAr: "العريشة" },
        { name: "Beni Snous", nameAr: "بني سنوس" },
        { name: "Sidi Djillali", nameAr: "سيدي الجيلالي" }
      ]},
      { code: "1307", name: "Hennaya", nameAr: "الحناية", communes: [
        { name: "Hennaya", nameAr: "الحناية" },
        { name: "Zenata", nameAr: "زناتة" },
        { name: "Ouled Mimoun", nameAr: "أولاد ميمون" },
        { name: "Amieur", nameAr: "عمير" }
      ]},
      { code: "1308", name: "Bab El Assa", nameAr: "باب العسة", communes: [
        { name: "Bab El Assa", nameAr: "باب العسة" },
        { name: "Souk Tlata", nameAr: "سوق الثلاثاء" }
      ]},
      { code: "1309", name: "Honaine", nameAr: "هنين", communes: [
        { name: "Honaine", nameAr: "هنين" },
        { name: "Beni Khellad", nameAr: "بني خلاد" },
        { name: "Ain Fettah", nameAr: "عين فتاح" }
      ]},
      { code: "1310", name: "Sabra", nameAr: "صبرة", communes: [
        { name: "Sabra", nameAr: "صبرة" },
        { name: "Sidi Abdelli", nameAr: "سيدي العبدلي" }
      ]}
    ]
  },
  {
    code: "14",
    name: "Tiaret",
    nameAr: "تيارت",
    dairas: [
      { code: "1401", name: "Tiaret", nameAr: "تيارت", communes: [
        { name: "Tiaret", nameAr: "تيارت" },
        { name: "Medroussa", nameAr: "مدروسة" },
        { name: "Guertoufa", nameAr: "قرطوفة" }
      ]},
      { code: "1402", name: "Sougueur", nameAr: "السوقر", communes: [
        { name: "Sougueur", nameAr: "السوقر" },
        { name: "Faidja", nameAr: "الفايجة" },
        { name: "Sidi Bakhti", nameAr: "سيدي بختي" },
        { name: "Ain Bouchekif", nameAr: "عين بوشقيف" }
      ]},
      { code: "1403", name: "Frenda", nameAr: "فرندة", communes: [
        { name: "Frenda", nameAr: "فرندة" },
        { name: "Takhemaret", nameAr: "تخمرت" },
        { name: "Ain El Hadid", nameAr: "عين الحديد" },
        { name: "Medrissa", nameAr: "مدريسة" }
      ]},
      { code: "1404", name: "Ksar Chellala", nameAr: "قصر الشلالة", communes: [
        { name: "Ksar Chellala", nameAr: "قصر الشلالة" },
        { name: "Serghine", nameAr: "سرغين" },
        { name: "Rechaiga", nameAr: "الرشايقة" }
      ]},
      { code: "1405", name: "Mahdia", nameAr: "مهدية", communes: [
        { name: "Mahdia", nameAr: "مهدية" },
        { name: "Ain Dzarit", nameAr: "عين دزاريت" },
        { name: "Nadora", nameAr: "الناظورة" },
        { name: "Sebt", nameAr: "السبت" }
      ]},
      { code: "1406", name: "Ain Deheb", nameAr: "عين الذهب", communes: [
        { name: "Ain Deheb", nameAr: "عين الذهب" },
        { name: "Naima", nameAr: "النعيمة" },
        { name: "Chehaima", nameAr: "الشحيمة" }
      ]},
      { code: "1407", name: "Rahouia", nameAr: "رحوية", communes: [
        { name: "Rahouia", nameAr: "الرحوية" },
        { name: "Djillali Ben Amar", nameAr: "جيلالي بن عمار" },
        { name: "Zmalet El Emir Abdelkader", nameAr: "زمالة الأمير عبد القادر" }
      ]},
      { code: "1408", name: "Oued Lilli", nameAr: "وادي ليلي", communes: [
        { name: "Oued Lilli", nameAr: "وادي ليلي" },
        { name: "Mechraa Safa", nameAr: "مشرع الصفا" },
        { name: "Mellakou", nameAr: "ملاكو" }
      ]},
      { code: "1409", name: "Hamadia", nameAr: "حمادية", communes: [
        { name: "Hamadia", nameAr: "حمادية" },
        { name: "Bougara", nameAr: "بوقرة" },
        { name: "Sidi Hosni", nameAr: "سيدي حسني" }
      ]},
      { code: "1410", name: "Dahmouni", nameAr: "دحموني", communes: [
        { name: "Dahmouni", nameAr: "دحموني" },
        { name: "Tagdemt", nameAr: "تاقدمت" },
        { name: "Sidi Ali Mellal", nameAr: "سيدي علي ملال" }
      ]}
    ]
  },
  {
    code: "15",
    name: "Tizi Ouzou",
    nameAr: "تيزي وزو",
    dairas: [
      { code: "1501", name: "Tizi Ouzou", nameAr: "تيزي وزو", communes: [
        { name: "Tizi Ouzou", nameAr: "تيزي وزو" },
        { name: "Beni Zmenzer", nameAr: "بني زمنزر" }
      ]},
      { code: "1502", name: "Azazga", nameAr: "عزازقة", communes: [
        { name: "Azazga", nameAr: "عزازقة" },
        { name: "Freha", nameAr: "فريحة" },
        { name: "Yakourene", nameAr: "إعكورن" },
        { name: "Zekri", nameAr: "زكري" },
        { name: "Ifigha", nameAr: "إفيغا" }
      ]},
      { code: "1503", name: "Draa El Mizan", nameAr: "ذراع الميزان", communes: [
        { name: "Draa El Mizan", nameAr: "ذراع الميزان" },
        { name: "Frikat", nameAr: "فريقات" },
        { name: "Ain Zaouia", nameAr: "عين الزاوية" },
        { name: "Tizi Gheniff", nameAr: "تيزي غنيف" }
      ]},
      { code: "1504", name: "Larbaa Nath Irathen", nameAr: "الأربعاء ناث إيراثن", communes: [
        { name: "Larbaa Nath Irathen", nameAr: "الأربعاء ناث إيراثن" },
        { name: "Irdjen", nameAr: "إيرجن" },
        { name: "Aghribs", nameAr: "أغريب" },
        { name: "Iloula Oumalou", nameAr: "إيلولة أومالو" }
      ]},
      { code: "1505", name: "Ain El Hammam", nameAr: "عين الحمام", communes: [
        { name: "Ain El Hammam", nameAr: "عين الحمام" },
        { name: "Akbil", nameAr: "اقبيل" },
        { name: "Ait Yahia", nameAr: "آيت يحيى" },
        { name: "Abi Youcef", nameAr: "أبي يوسف" }
      ]},
      { code: "1506", name: "Boghni", nameAr: "بوغني", communes: [
        { name: "Boghni", nameAr: "بوغني" },
        { name: "Mechtras", nameAr: "مشطراس" },
        { name: "Assi Youcef", nameAr: "آسي يوسف" },
        { name: "Bounouh", nameAr: "بونوح" }
      ]},
      { code: "1507", name: "Tigzirt", nameAr: "تيقزيرت", communes: [
        { name: "Tigzirt", nameAr: "تيقزيرت" },
        { name: "Iflissen", nameAr: "إفليسن" },
        { name: "Mizrana", nameAr: "مزرانة" }
      ]},
      { code: "1508", name: "Azeffoun", nameAr: "أزفون", communes: [
        { name: "Azeffoun", nameAr: "أزفون" },
        { name: "Akerrou", nameAr: "أكرو" },
        { name: "Ait Chafaa", nameAr: "آيت شفعة" }
      ]},
      { code: "1509", name: "Beni Douala", nameAr: "بني دوالة", communes: [
        { name: "Beni Douala", nameAr: "بني دوالة" },
        { name: "Beni Aissi", nameAr: "بني عيسي" },
        { name: "Beni Ziki", nameAr: "بني زيكي" }
      ]},
      { code: "1510", name: "Ouaguenoun", nameAr: "واقنون", communes: [
        { name: "Ouaguenoun", nameAr: "واقنون" },
        { name: "Timizart", nameAr: "تيميزار" },
        { name: "Agouni Gueghrane", nameAr: "أقني قغران" }
      ]},
      { code: "1511", name: "Ouadhia", nameAr: "واضية", communes: [
        { name: "Ouadhia", nameAr: "واضية" },
        { name: "Tizi N'tleta", nameAr: "تيزي نتلاتة" },
        { name: "Aghni Gueghrane", nameAr: "أغني قغران" }
      ]},
      { code: "1512", name: "Mekla", nameAr: "مقلع", communes: [
        { name: "Mekla", nameAr: "مقلع" },
        { name: "Souamaa", nameAr: "الصوامع" },
        { name: "Ait Khelili", nameAr: "آيت خليلي" }
      ]},
      { code: "1513", name: "Bouzeguene", nameAr: "بوزقن", communes: [
        { name: "Bouzeguene", nameAr: "بوزقن" },
        { name: "Illoula Oumalou", nameAr: "إيلولة أومالو" },
        { name: "Idjeur", nameAr: "إجر" }
      ]},
      { code: "1514", name: "Maatka", nameAr: "معاتقة", communes: [
        { name: "Maatka", nameAr: "معاتقة" },
        { name: "Souk El Tenine", nameAr: "سوق الاثنين" }
      ]},
      { code: "1515", name: "Draa Ben Khedda", nameAr: "ذراع بن خدة", communes: [
        { name: "Draa Ben Khedda", nameAr: "ذراع بن خدة" },
        { name: "Tirmitine", nameAr: "ترمتين" },
        { name: "Sidi Naamane", nameAr: "سيدي نعمان" }
      ]}
    ]
  },
  {
    code: "16",
    name: "Alger",
    nameAr: "الجزائر",
    dairas: [
      { code: "1601", name: "Sidi M'hamed", nameAr: "سيدي امحمد", communes: [
        { name: "Alger Centre", nameAr: "الجزائر الوسطى" },
        { name: "Sidi M'hamed", nameAr: "سيدي امحمد" },
        { name: "El Madania", nameAr: "المدنية" },
        { name: "El Mouradia", nameAr: "المرادية" },
        { name: "Belouizdad", nameAr: "بلوزداد" }
      ]},
      { code: "1602", name: "Bab El Oued", nameAr: "باب الوادي", communes: [
        { name: "Bab El Oued", nameAr: "باب الوادي" },
        { name: "Casbah", nameAr: "القصبة" },
        { name: "Oued Koriche", nameAr: "وادي قريش" },
        { name: "Bologhine", nameAr: "بولوغين" },
        { name: "Rais Hamidou", nameAr: "رايس حميدو" }
      ]},
      { code: "1603", name: "Hussein Dey", nameAr: "حسين داي", communes: [
        { name: "Hussein Dey", nameAr: "حسين داي" },
        { name: "Kouba", nameAr: "القبة" },
        { name: "El Magharia", nameAr: "المغارية" },
        { name: "Bachdjerrah", nameAr: "باش جراح" }
      ]},
      { code: "1604", name: "El Harrach", nameAr: "الحراش", communes: [
        { name: "El Harrach", nameAr: "الحراش" },
        { name: "Oued Smar", nameAr: "وادي السمار" },
        { name: "Bourouba", nameAr: "بوروبة" },
        { name: "Mohammadia", nameAr: "المحمدية" }
      ]},
      { code: "1605", name: "Baraki", nameAr: "براقي", communes: [
        { name: "Baraki", nameAr: "براقي" },
        { name: "Les Eucalyptus", nameAr: "الكاليتوس" },
        { name: "Sidi Moussa", nameAr: "سيدي موسى" }
      ]},
      { code: "1606", name: "Bir Mourad Rais", nameAr: "بئر مراد رايس", communes: [
        { name: "Bir Mourad Rais", nameAr: "بئر مراد رايس" },
        { name: "Birkhadem", nameAr: "بئر خادم" },
        { name: "Hydra", nameAr: "حيدرة" },
        { name: "Saoula", nameAr: "ساولة" }
      ]},
      { code: "1607", name: "Bouzareah", nameAr: "بوزريعة", communes: [
        { name: "Bouzareah", nameAr: "بوزريعة" },
        { name: "El Biar", nameAr: "الابيار" },
        { name: "Ben Aknoun", nameAr: "ابن عكنون" },
        { name: "Telemly", nameAr: "تلملي" }
      ]},
      { code: "1608", name: "Dar El Beida", nameAr: "الدار البيضاء", communes: [
        { name: "Dar El Beida", nameAr: "الدار البيضاء" },
        { name: "Bab Ezzouar", nameAr: "باب الزوار" },
        { name: "Bordj El Kiffan", nameAr: "برج الكيفان" },
        { name: "El Marsa", nameAr: "المرسى" }
      ]},
      { code: "1609", name: "Rouiba", nameAr: "الرويبة", communes: [
        { name: "Rouiba", nameAr: "الرويبة" },
        { name: "Reghaia", nameAr: "رغاية" },
        { name: "Herraoua", nameAr: "هراوة" },
        { name: "Ain Taya", nameAr: "عين طاية" }
      ]},
      { code: "1610", name: "Cheraga", nameAr: "الشراقة", communes: [
        { name: "Cheraga", nameAr: "الشراقة" },
        { name: "Dely Ibrahim", nameAr: "دالي ابراهيم" },
        { name: "Ouled Fayet", nameAr: "اولاد فايت" },
        { name: "Ain Benian", nameAr: "عين البنيان" }
      ]},
      { code: "1611", name: "Draria", nameAr: "الدرارية", communes: [
        { name: "Draria", nameAr: "الدرارية" },
        { name: "El Achour", nameAr: "العاشور" },
        { name: "Baba Hassen", nameAr: "بابا حسن" },
        { name: "Khraicia", nameAr: "خرايسية" }
      ]},
      { code: "1612", name: "Zeralda", nameAr: "زرالدة", communes: [
        { name: "Zeralda", nameAr: "زرالدة" },
        { name: "Staoueli", nameAr: "سطاوالي" },
        { name: "Mahelma", nameAr: "المحالمة" },
        { name: "Souidania", nameAr: "سويدانية" }
      ]},
      { code: "1613", name: "Birtouta", nameAr: "بئر توتة", communes: [
        { name: "Birtouta", nameAr: "بئر توتة" },
        { name: "Ouled Chebel", nameAr: "اولاد شبل" },
        { name: "Tessala El Merdja", nameAr: "تسالة المرجة" }
      ]}
    ]
  },
  {
    code: "17",
    name: "Djelfa",
    nameAr: "الجلفة",
    dairas: [
      { code: "1701", name: "Djelfa", nameAr: "الجلفة", communes: [
        { name: "Djelfa", nameAr: "الجلفة" },
        { name: "Moudjebara", nameAr: "مجبارة" },
        { name: "El Guedid", nameAr: "القديد" }
      ]},
      { code: "1702", name: "Messaad", nameAr: "مسعد", communes: [
        { name: "Messaad", nameAr: "مسعد" },
        { name: "Guettara", nameAr: "القطارة" },
        { name: "Deldoul", nameAr: "دلدول" },
        { name: "Selmana", nameAr: "سلمانة" }
      ]},
      { code: "1703", name: "Ain Oussera", nameAr: "عين وسارة", communes: [
        { name: "Ain Oussera", nameAr: "عين وسارة" },
        { name: "Benhar", nameAr: "بنهار" },
        { name: "Guernini", nameAr: "قرنيني" },
        { name: "El Khemis", nameAr: "الخميس" }
      ]},
      { code: "1704", name: "Hassi Bahbah", nameAr: "حاسي بحبح", communes: [
        { name: "Hassi Bahbah", nameAr: "حاسي بحبح" },
        { name: "Zaafrane", nameAr: "الزعفران" },
        { name: "Hassi El Euch", nameAr: "حاسي العش" }
      ]},
      { code: "1705", name: "Dar Chioukh", nameAr: "دار الشيوخ", communes: [
        { name: "Dar Chioukh", nameAr: "دار الشيوخ" },
        { name: "Mliliha", nameAr: "مليليحة" },
        { name: "Sed Rahal", nameAr: "سد رحال" }
      ]},
      { code: "1706", name: "Charef", nameAr: "الشارف", communes: [
        { name: "Charef", nameAr: "الشارف" },
        { name: "Douis", nameAr: "دويس" },
        { name: "Bouira Lahdab", nameAr: "بويرة الأحداب" }
      ]},
      { code: "1707", name: "Birine", nameAr: "بيرين", communes: [
        { name: "Birine", nameAr: "بيرين" },
        { name: "Hadj Mechri", nameAr: "الحاج مشري" },
        { name: "Sidi Ladjel", nameAr: "سيدي لعجال" }
      ]},
      { code: "1708", name: "Faidh El Botma", nameAr: "فيض البطمة", communes: [
        { name: "Faidh El Botma", nameAr: "فيض البطمة" },
        { name: "Ain Maabed", nameAr: "عين معبد" },
        { name: "Zaccar", nameAr: "زكار" }
      ]},
      { code: "1709", name: "Ain El Ibel", nameAr: "عين الإبل", communes: [
        { name: "Ain El Ibel", nameAr: "عين الإبل" },
        { name: "Ain Chouhada", nameAr: "عين الشهداء" },
        { name: "Oum Laadham", nameAr: "أم العظام" }
      ]},
      { code: "1710", name: "Had Sahary", nameAr: "حد الصحاري", communes: [
        { name: "Had Sahary", nameAr: "حد الصحاري" },
        { name: "Ain Fekka", nameAr: "عين فقة" },
        { name: "Taadmit", nameAr: "تعضميت" }
      ]}
    ]
  },
  {
    code: "18",
    name: "Jijel",
    nameAr: "جيجل",
    dairas: [
      { code: "1801", name: "Jijel", nameAr: "جيجل", communes: [
        { name: "Jijel", nameAr: "جيجل" },
        { name: "Kaous", nameAr: "قاوس" }
      ]},
      { code: "1802", name: "El Milia", nameAr: "الميلية", communes: [
        { name: "El Milia", nameAr: "الميلية" },
        { name: "Ouled Yahia Khedrouche", nameAr: "أولاد يحيى خدروش" },
        { name: "Settara", nameAr: "سطارة" },
        { name: "Ouled Rabah", nameAr: "أولاد رابح" }
      ]},
      { code: "1803", name: "Taher", nameAr: "الطاهير", communes: [
        { name: "Taher", nameAr: "الطاهير" },
        { name: "Emir Abdelkader", nameAr: "الأمير عبد القادر" },
        { name: "Chekfa", nameAr: "الشقفة" },
        { name: "El Aouana", nameAr: "العوانة" }
      ]},
      { code: "1804", name: "Sidi Maarouf", nameAr: "سيدي معروف", communes: [
        { name: "Sidi Maarouf", nameAr: "سيدي معروف" },
        { name: "Bouraoui Belhadef", nameAr: "بوراوي بلهادف" },
        { name: "Ouadjana", nameAr: "وجانة" }
      ]},
      { code: "1805", name: "Texenna", nameAr: "تكسانة", communes: [
        { name: "Texenna", nameAr: "تكسانة" },
        { name: "Selma Benziada", nameAr: "سلمى بن زيادة" },
        { name: "Boudria Beni Yadjis", nameAr: "بودريعة بني ياجيس" }
      ]},
      { code: "1806", name: "Ziama Mansouriah", nameAr: "زيامة منصورية", communes: [
        { name: "Ziama Mansouriah", nameAr: "زيامة منصورية" },
        { name: "Erraguene Souissi", nameAr: "الرقان السويسي" }
      ]},
      { code: "1807", name: "Djimla", nameAr: "جيملة", communes: [
        { name: "Djimla", nameAr: "جيملة" },
        { name: "Beni Yadjis", nameAr: "بني ياجيس" }
      ]},
      { code: "1808", name: "El Ancer", nameAr: "العنصر", communes: [
        { name: "El Ancer", nameAr: "العنصر" },
        { name: "Sidi Abdelaziz", nameAr: "سيدي عبد العزيز" },
        { name: "El Kennar Nouchfi", nameAr: "القنار نوشفي" }
      ]}
    ]
  },
  {
    code: "19",
    name: "Setif",
    nameAr: "سطيف",
    dairas: [
      { code: "1901", name: "Setif", nameAr: "سطيف", communes: [
        { name: "Setif", nameAr: "سطيف" },
        { name: "Mezloug", nameAr: "مزلوق" },
        { name: "Ouled Saber", nameAr: "أولاد صابر" },
        { name: "Guedjel", nameAr: "قجال" }
      ]},
      { code: "1902", name: "El Eulma", nameAr: "العلمة", communes: [
        { name: "El Eulma", nameAr: "العلمة" },
        { name: "Bazer Sakra", nameAr: "بازر الصخرة" },
        { name: "Beida Bordj", nameAr: "البيضاء برج" },
        { name: "Hamma", nameAr: "الحامة" }
      ]},
      { code: "1903", name: "Ain Oulmene", nameAr: "عين ولمان", communes: [
        { name: "Ain Oulmene", nameAr: "عين ولمان" },
        { name: "Ouled Si Ahmed", nameAr: "أولاد سي أحمد" },
        { name: "Bir Haddada", nameAr: "بئر حدادة" },
        { name: "Guellal", nameAr: "قلال" }
      ]},
      { code: "1904", name: "Ain Arnat", nameAr: "عين أرنات", communes: [
        { name: "Ain Arnat", nameAr: "عين أرنات" },
        { name: "El Ouricia", nameAr: "الأوريسية" },
        { name: "Beni Fouda", nameAr: "بني فودة" }
      ]},
      { code: "1905", name: "Bougaa", nameAr: "بوقاعة", communes: [
        { name: "Bougaa", nameAr: "بوقاعة" },
        { name: "Guenzet", nameAr: "قنزات" },
        { name: "Beni Chebana", nameAr: "بني شبانة" },
        { name: "Dehamcha", nameAr: "دهامشة" }
      ]},
      { code: "1906", name: "Ain El Kebira", nameAr: "عين الكبيرة", communes: [
        { name: "Ain El Kebira", nameAr: "عين الكبيرة" },
        { name: "Beni Aziz", nameAr: "بني عزيز" },
        { name: "Oued El Bared", nameAr: "وادي البارد" }
      ]},
      { code: "1907", name: "Beni Ourtilane", nameAr: "بني ورتيلان", communes: [
        { name: "Beni Ourtilane", nameAr: "بني ورتيلان" },
        { name: "Bouandas", nameAr: "بوعنداس" },
        { name: "Tizi N'bechar", nameAr: "تيزي نبشار" }
      ]},
      { code: "1908", name: "Ain Azel", nameAr: "عين آزال", communes: [
        { name: "Ain Azel", nameAr: "عين آزال" },
        { name: "Ain Lahdjar", nameAr: "عين الحجر" },
        { name: "Bir El Arch", nameAr: "بئر العرش" }
      ]},
      { code: "1909", name: "Salah Bey", nameAr: "صالح باي", communes: [
        { name: "Salah Bey", nameAr: "صالح باي" },
        { name: "Rasfa", nameAr: "رصفة" },
        { name: "Ouled Tebben", nameAr: "أولاد تبان" }
      ]},
      { code: "1910", name: "Hammam Guergour", nameAr: "حمام قرقور", communes: [
        { name: "Hammam Guergour", nameAr: "حمام قرقور" },
        { name: "Ait Naoual Mezada", nameAr: "آيت نوال مزادة" },
        { name: "Harbil", nameAr: "حربيل" }
      ]},
      { code: "1911", name: "Djemila", nameAr: "جميلة", communes: [
        { name: "Djemila", nameAr: "جميلة" }
      ]},
      { code: "1912", name: "Maoklane", nameAr: "ماوكلان", communes: [
        { name: "Maoklane", nameAr: "ماوكلان" },
        { name: "Amoucha", nameAr: "عموشة" },
        { name: "Talaifacene", nameAr: "تالة إيفاسن" }
      ]},
      { code: "1913", name: "Babor", nameAr: "بابور", communes: [
        { name: "Babor", nameAr: "بابور" },
        { name: "Draa Kebila", nameAr: "ذراع قبيلة" }
      ]}
    ]
  },
  {
    code: "20",
    name: "Saida",
    nameAr: "سعيدة",
    dairas: [
      { code: "2001", name: "Saida", nameAr: "سعيدة", communes: [
        { name: "Saida", nameAr: "سعيدة" },
        { name: "Doui Thabet", nameAr: "دوي ثابت" },
        { name: "Sidi Boubekeur", nameAr: "سيدي بوبكر" }
      ]},
      { code: "2002", name: "Ain El Hadjar", nameAr: "عين الحجر", communes: [
        { name: "Ain El Hadjar", nameAr: "عين الحجر" },
        { name: "Ouled Khaled", nameAr: "أولاد خالد" },
        { name: "Maamora", nameAr: "المعمورة" }
      ]},
      { code: "2003", name: "El Hassasna", nameAr: "الحساسنة", communes: [
        { name: "El Hassasna", nameAr: "الحساسنة" },
        { name: "Sidi Ahmed", nameAr: "سيدي أحمد" },
        { name: "Hounet", nameAr: "هونت" }
      ]},
      { code: "2004", name: "Youb", nameAr: "يوب", communes: [
        { name: "Youb", nameAr: "يوب" },
        { name: "Tircine", nameAr: "تيرسين" },
        { name: "Ain Sekhouna", nameAr: "عين السخونة" }
      ]},
      { code: "2005", name: "Ouled Brahim", nameAr: "أولاد ابراهيم", communes: [
        { name: "Ouled Brahim", nameAr: "أولاد ابراهيم" },
        { name: "Sidi Amar", nameAr: "سيدي عمار" }
      ]},
      { code: "2006", name: "Moulay Larbi", nameAr: "مولاي العربي", communes: [
        { name: "Moulay Larbi", nameAr: "مولاي العربي" },
        { name: "Ain Soltane", nameAr: "عين السلطان" }
      ]}
    ]
  },
  // الولايات من 21 إلى 58 - سأضيف الدوائر والبلديات الرئيسية
  {
    code: "21",
    name: "Skikda",
    nameAr: "سكيكدة",
    dairas: [
      { code: "2101", name: "Skikda", nameAr: "سكيكدة", communes: [
        { name: "Skikda", nameAr: "سكيكدة" },
        { name: "Hamadi Krouma", nameAr: "حمادي كرومة" },
        { name: "Filfila", nameAr: "فلفلة" }
      ]},
      { code: "2102", name: "Collo", nameAr: "القل", communes: [
        { name: "Collo", nameAr: "القل" },
        { name: "Beni Zid", nameAr: "بني زيد" },
        { name: "Cheraia", nameAr: "الشرايع" },
        { name: "Kerkera", nameAr: "كركرة" }
      ]},
      { code: "2103", name: "Azzaba", nameAr: "عزابة", communes: [
        { name: "Azzaba", nameAr: "عزابة" },
        { name: "Djendel Saadi Mohamed", nameAr: "جندل سعدي محمد" },
        { name: "Ain Charchar", nameAr: "عين شرشار" }
      ]},
      { code: "2104", name: "El Harrouch", nameAr: "الحروش", communes: [
        { name: "El Harrouch", nameAr: "الحروش" },
        { name: "Zerdazas", nameAr: "زردازة" },
        { name: "Salah Bouchaour", nameAr: "صالح بوشعور" }
      ]},
      { code: "2105", name: "Tamalous", nameAr: "تمالوس", communes: [
        { name: "Tamalous", nameAr: "تمالوس" },
        { name: "Beni Oulbane", nameAr: "بني ولبان" },
        { name: "Kanoua", nameAr: "قنوعة" }
      ]},
      { code: "2106", name: "Ramdane Djamel", nameAr: "رمضان جمال", communes: [
        { name: "Ramdane Djamel", nameAr: "رمضان جمال" },
        { name: "Beni Bechir", nameAr: "بني بشير" },
        { name: "Bouchtata", nameAr: "بوشطاطة" }
      ]},
      { code: "2107", name: "Sidi Mezghiche", nameAr: "سيدي مزغيش", communes: [
        { name: "Sidi Mezghiche", nameAr: "سيدي مزغيش" },
        { name: "Oum Toub", nameAr: "أم الطوب" }
      ]},
      { code: "2108", name: "Ouled Attia", nameAr: "أولاد عطية", communes: [
        { name: "Ouled Attia", nameAr: "أولاد عطية" },
        { name: "Es Sebt", nameAr: "السبت" }
      ]}
    ]
  },
  {
    code: "22",
    name: "Sidi Bel Abbes",
    nameAr: "سيدي بلعباس",
    dairas: [
      { code: "2201", name: "Sidi Bel Abbes", nameAr: "سيدي بلعباس", communes: [
        { name: "Sidi Bel Abbes", nameAr: "سيدي بلعباس" },
        { name: "Sidi Brahim", nameAr: "سيدي ابراهيم" },
        { name: "Amarnas", nameAr: "عمارنة" }
      ]},
      { code: "2202", name: "Telagh", nameAr: "تلاغ", communes: [
        { name: "Telagh", nameAr: "تلاغ" },
        { name: "Teghaliment", nameAr: "تغاليمت" },
        { name: "Dhaya", nameAr: "الضاية" }
      ]},
      { code: "2203", name: "Sfisef", nameAr: "سفيزف", communes: [
        { name: "Sfisef", nameAr: "سفيزف" },
        { name: "Ain Tindamine", nameAr: "عين تندامين" },
        { name: "Oued Taourira", nameAr: "وادي تاوريرة" }
      ]},
      { code: "2204", name: "Ain El Berd", nameAr: "عين البرد", communes: [
        { name: "Ain El Berd", nameAr: "عين البرد" },
        { name: "Sidi Khaled", nameAr: "سيدي خالد" },
        { name: "Mostefa Ben Brahim", nameAr: "مصطفى بن ابراهيم" }
      ]},
      { code: "2205", name: "Ben Badis", nameAr: "بن باديس", communes: [
        { name: "Ben Badis", nameAr: "بن باديس" },
        { name: "Sidi Hamadouche", nameAr: "سيدي حمادوش" }
      ]},
      { code: "2206", name: "Tessala", nameAr: "تسالة", communes: [
        { name: "Tessala", nameAr: "تسالة" },
        { name: "Sidi Ali Boussidi", nameAr: "سيدي علي بوسيدي" }
      ]},
      { code: "2207", name: "Ras El Ma", nameAr: "رأس الماء", communes: [
        { name: "Ras El Ma", nameAr: "رأس الماء" },
        { name: "Redjem Demouche", nameAr: "رجم دموش" }
      ]},
      { code: "2208", name: "Merine", nameAr: "مرين", communes: [
        { name: "Merine", nameAr: "مرين" },
        { name: "Oued Sebaa", nameAr: "وادي السبع" }
      ]}
    ]
  },
  {
    code: "23",
    name: "Annaba",
    nameAr: "عنابة",
    dairas: [
      { code: "2301", name: "Annaba", nameAr: "عنابة", communes: [
        { name: "Annaba", nameAr: "عنابة" }
      ]},
      { code: "2302", name: "El Bouni", nameAr: "البوني", communes: [
        { name: "El Bouni", nameAr: "البوني" },
        { name: "Sidi Amar", nameAr: "سيدي عمار" },
        { name: "Oued El Aneb", nameAr: "وادي العنب" }
      ]},
      { code: "2303", name: "El Hadjar", nameAr: "الحجار", communes: [
        { name: "El Hadjar", nameAr: "الحجار" },
        { name: "Eulma", nameAr: "العلمة" }
      ]},
      { code: "2304", name: "Berrahal", nameAr: "برحال", communes: [
        { name: "Berrahal", nameAr: "برحال" },
        { name: "Treat", nameAr: "تريعات" }
      ]},
      { code: "2305", name: "Ain El Berda", nameAr: "عين الباردة", communes: [
        { name: "Ain El Berda", nameAr: "عين الباردة" },
        { name: "Cheurfa", nameAr: "الشرفة" }
      ]},
      { code: "2306", name: "Chetaibi", nameAr: "شطايبي", communes: [
        { name: "Chetaibi", nameAr: "شطايبي" },
        { name: "Seraidi", nameAr: "سرايدي" }
      ]}
    ]
  },
  {
    code: "24",
    name: "Guelma",
    nameAr: "قالمة",
    dairas: [
      { code: "2401", name: "Guelma", nameAr: "قالمة", communes: [
        { name: "Guelma", nameAr: "قالمة" },
        { name: "Belkheir", nameAr: "بلخير" },
        { name: "Bendjerrah", nameAr: "بن جراح" }
      ]},
      { code: "2402", name: "Oued Zenati", nameAr: "وادي الزناتي", communes: [
        { name: "Oued Zenati", nameAr: "وادي الزناتي" },
        { name: "Ras El Agba", nameAr: "رأس العقبة" },
        { name: "Ain Makhlouf", nameAr: "عين مخلوف" }
      ]},
      { code: "2403", name: "Bouchegouf", nameAr: "بوشقوف", communes: [
        { name: "Bouchegouf", nameAr: "بوشقوف" },
        { name: "Medjez Amar", nameAr: "مجاز عمار" },
        { name: "Ain Ben Beida", nameAr: "عين بن بيضاء" }
      ]},
      { code: "2404", name: "Hammam Debagh", nameAr: "حمام دباغ", communes: [
        { name: "Hammam Debagh", nameAr: "حمام دباغ" },
        { name: "Roknia", nameAr: "ركنية" }
      ]},
      { code: "2405", name: "Heliopolis", nameAr: "هيليوبوليس", communes: [
        { name: "Heliopolis", nameAr: "هيليوبوليس" },
        { name: "Nechmaya", nameAr: "نشماية" }
      ]},
      { code: "2406", name: "Khezaras", nameAr: "خزارة", communes: [
        { name: "Khezaras", nameAr: "خزارة" },
        { name: "Tamlouka", nameAr: "تاملوكة" }
      ]},
      { code: "2407", name: "Hammam N'bails", nameAr: "حمام النبايل", communes: [
        { name: "Hammam N'bails", nameAr: "حمام النبايل" },
        { name: "Ain Larbi", nameAr: "عين العربي" }
      ]},
      { code: "2408", name: "Guelaat Bou Sbaa", nameAr: "قلعة بوصبع", communes: [
        { name: "Guelaat Bou Sbaa", nameAr: "قلعة بوصبع" },
        { name: "Bouati Mahmoud", nameAr: "بوعاتي محمود" }
      ]}
    ]
  },
  {
    code: "25",
    name: "Constantine",
    nameAr: "قسنطينة",
    dairas: [
      { code: "2501", name: "Constantine", nameAr: "قسنطينة", communes: [
        { name: "Constantine", nameAr: "قسنطينة" }
      ]},
      { code: "2502", name: "El Khroub", nameAr: "الخروب", communes: [
        { name: "El Khroub", nameAr: "الخروب" },
        { name: "Ain Smara", nameAr: "عين سمارة" },
        { name: "Ouled Rahmoun", nameAr: "أولاد رحمون" }
      ]},
      { code: "2503", name: "Hamma Bouziane", nameAr: "حامة بوزيان", communes: [
        { name: "Hamma Bouziane", nameAr: "حامة بوزيان" },
        { name: "Didouche Mourad", nameAr: "ديدوش مراد" }
      ]},
      { code: "2504", name: "Zighoud Youcef", nameAr: "زيغود يوسف", communes: [
        { name: "Zighoud Youcef", nameAr: "زيغود يوسف" },
        { name: "Beni Hamidene", nameAr: "بني حميدان" }
      ]},
      { code: "2505", name: "Ibn Ziad", nameAr: "ابن زياد", communes: [
        { name: "Ibn Ziad", nameAr: "ابن زياد" },
        { name: "Messaoud Boudjeriou", nameAr: "مسعود بوجريو" }
      ]},
      { code: "2506", name: "Ain Abid", nameAr: "عين عبيد", communes: [
        { name: "Ain Abid", nameAr: "عين عبيد" },
        { name: "IBN BADIS EL HERIA", nameAr: "إبن باديس الهرية" }
      ]}
    ]
  },
  {
    code: "26",
    name: "Medea",
    nameAr: "المدية",
    dairas: [
      { code: "2601", name: "Medea", nameAr: "المدية", communes: [
        { name: "Medea", nameAr: "المدية" },
        { name: "Ouzera", nameAr: "وزرة" },
        { name: "Draa Essamar", nameAr: "ذراع السمار" }
      ]},
      { code: "2602", name: "Berrouaghia", nameAr: "البرواقية", communes: [
        { name: "Berrouaghia", nameAr: "البرواقية" },
        { name: "Sidi Naamane", nameAr: "سيدي نعمان" },
        { name: "Boughezoul", nameAr: "بوغزول" }
      ]},
      { code: "2603", name: "Ksar El Boukhari", nameAr: "قصر البخاري", communes: [
        { name: "Ksar El Boukhari", nameAr: "قصر البخاري" },
        { name: "Saneg", nameAr: "سانق" },
        { name: "Boghar", nameAr: "بوغار" }
      ]},
      { code: "2604", name: "Tablat", nameAr: "تابلاط", communes: [
        { name: "Tablat", nameAr: "تابلاط" },
        { name: "Mihoub", nameAr: "ميهوب" },
        { name: "Deux Bassins", nameAr: "الحوضين" }
      ]},
      { code: "2605", name: "Ain Boucif", nameAr: "عين بوسيف", communes: [
        { name: "Ain Boucif", nameAr: "عين بوسيف" },
        { name: "Oued Harbil", nameAr: "وادي حربيل" }
      ]},
      { code: "2606", name: "Chahbounia", nameAr: "الشهبونية", communes: [
        { name: "Chahbounia", nameAr: "الشهبونية" },
        { name: "Sidi Damed", nameAr: "سيدي دامد" }
      ]},
      { code: "2607", name: "Ouamri", nameAr: "وامري", communes: [
        { name: "Ouamri", nameAr: "وامري" },
        { name: "Tamesguida", nameAr: "تمسقيدة" }
      ]},
      { code: "2608", name: "Seghouane", nameAr: "سغوان", communes: [
        { name: "Seghouane", nameAr: "سغوان" },
        { name: "Aziz", nameAr: "عزيز" }
      ]},
      { code: "2609", name: "El Omaria", nameAr: "العمارية", communes: [
        { name: "El Omaria", nameAr: "العمارية" },
        { name: "Cheniguel", nameAr: "شنيقل" }
      ]},
      { code: "2610", name: "Si Mahdjoub", nameAr: "سي المحجوب", communes: [
        { name: "Si Mahdjoub", nameAr: "سي المحجوب" },
        { name: "Souagui", nameAr: "السواقي" }
      ]}
    ]
  },
  {
    code: "27",
    name: "Mostaganem",
    nameAr: "مستغانم",
    dairas: [
      { code: "2701", name: "Mostaganem", nameAr: "مستغانم", communes: [
        { name: "Mostaganem", nameAr: "مستغانم" },
        { name: "Mazagran", nameAr: "مزغران" },
        { name: "Sayada", nameAr: "الصيادة" }
      ]},
      { code: "2702", name: "Ain Tedles", nameAr: "عين تادلس", communes: [
        { name: "Ain Tedles", nameAr: "عين تادلس" },
        { name: "Sour", nameAr: "الصور" },
        { name: "Oued El Kheir", nameAr: "وادي الخير" }
      ]},
      { code: "2703", name: "Sidi Ali", nameAr: "سيدي علي", communes: [
        { name: "Sidi Ali", nameAr: "سيدي علي" },
        { name: "Abdelmalek Ramdane", nameAr: "عبد المالك رمضان" },
        { name: "Ouled Boughalem", nameAr: "أولاد بوغالم" }
      ]},
      { code: "2704", name: "Hassi Mameche", nameAr: "حاسي ماماش", communes: [
        { name: "Hassi Mameche", nameAr: "حاسي ماماش" },
        { name: "Ain Nouissy", nameAr: "عين نويسي" }
      ]},
      { code: "2705", name: "Achaacha", nameAr: "عشعاشة", communes: [
        { name: "Achaacha", nameAr: "عشعاشة" },
        { name: "Sidi Lakhdar", nameAr: "سيدي لخضر" },
        { name: "Kheir Eddine", nameAr: "خير الدين" }
      ]},
      { code: "2706", name: "Bouguirat", nameAr: "بوقيراط", communes: [
        { name: "Bouguirat", nameAr: "بوقيراط" },
        { name: "Sirat", nameAr: "سيرات" },
        { name: "Fornaka", nameAr: "فرناقة" }
      ]},
      { code: "2707", name: "Mesra", nameAr: "مسرى", communes: [
        { name: "Mesra", nameAr: "مسرى" },
        { name: "Mansourah", nameAr: "المنصورة" }
      ]},
      { code: "2708", name: "Ain Boudinar", nameAr: "عين بودينار", communes: [
        { name: "Ain Boudinar", nameAr: "عين بودينار" },
        { name: "Tazgait", nameAr: "تازقايت" }
      ]}
    ]
  },
  {
    code: "28",
    name: "M'Sila",
    nameAr: "المسيلة",
    dairas: [
      { code: "2801", name: "M'Sila", nameAr: "المسيلة", communes: [
        { name: "M'Sila", nameAr: "المسيلة" },
        { name: "Tarmount", nameAr: "ترمونت" },
        { name: "Ouled Derradj", nameAr: "أولاد دراج" }
      ]},
      { code: "2802", name: "Bou Saada", nameAr: "بوسعادة", communes: [
        { name: "Bou Saada", nameAr: "بوسعادة" },
        { name: "Ouled Sidi Brahim", nameAr: "أولاد سيدي ابراهيم" },
        { name: "Oultem", nameAr: "أولتم" }
      ]},
      { code: "2803", name: "Sidi Aissa", nameAr: "سيدي عيسى", communes: [
        { name: "Sidi Aissa", nameAr: "سيدي عيسى" },
        { name: "Bouti Sayah", nameAr: "بوطي صياح" },
        { name: "Ain El Hadjel", nameAr: "عين الحجل" }
      ]},
      { code: "2804", name: "Ain El Melh", nameAr: "عين الملح", communes: [
        { name: "Ain El Melh", nameAr: "عين الملح" },
        { name: "Sidi Ameur", nameAr: "سيدي عامر" },
        { name: "Ain Fares", nameAr: "عين فارس" }
      ]},
      { code: "2805", name: "Hammam Dalaa", nameAr: "حمام الضلعة", communes: [
        { name: "Hammam Dalaa", nameAr: "حمام الضلعة" },
        { name: "Maadid", nameAr: "معاضيد" },
        { name: "Ouled Addi Guebala", nameAr: "أولاد عدي قبالة" }
      ]},
      { code: "2806", name: "Magra", nameAr: "مقرة", communes: [
        { name: "Magra", nameAr: "مقرة" },
        { name: "Berhoum", nameAr: "برهوم" },
        { name: "Mohamed Boudiaf", nameAr: "محمد بوضياف" }
      ]},
      { code: "2807", name: "Ouled Derradj", nameAr: "أولاد دراج", communes: [
        { name: "Ouled Derradj", nameAr: "أولاد دراج" },
        { name: "Belaiba", nameAr: "بلعايبة" }
      ]},
      { code: "2808", name: "Chellal", nameAr: "شلال", communes: [
        { name: "Chellal", nameAr: "شلال" },
        { name: "Ouled Mansour", nameAr: "أولاد منصور" }
      ]},
      { code: "2809", name: "Khoubana", nameAr: "خبانة", communes: [
        { name: "Khoubana", nameAr: "خبانة" },
        { name: "M'cif", nameAr: "مسيف" }
      ]},
      { code: "2810", name: "Djebel Messaad", nameAr: "جبل مساعد", communes: [
        { name: "Djebel Messaad", nameAr: "جبل مساعد" },
        { name: "Slim", nameAr: "سليم" }
      ]}
    ]
  },
  {
    code: "29",
    name: "Mascara",
    nameAr: "معسكر",
    dairas: [
      { code: "2901", name: "Mascara", nameAr: "معسكر", communes: [
        { name: "Mascara", nameAr: "معسكر" },
        { name: "Bou Hanifia", nameAr: "بوحنيفية" },
        { name: "Tizi", nameAr: "تيزي" }
      ]},
      { code: "2902", name: "Sig", nameAr: "سيق", communes: [
        { name: "Sig", nameAr: "سيق" },
        { name: "Oggaz", nameAr: "عقاز" },
        { name: "Zahana", nameAr: "زهانة" }
      ]},
      { code: "2903", name: "Mohammadia", nameAr: "المحمدية", communes: [
        { name: "Mohammadia", nameAr: "المحمدية" },
        { name: "Sidi Kada", nameAr: "سيدي قادة" },
        { name: "Ferraguig", nameAr: "فراقيق" }
      ]},
      { code: "2904", name: "Tighennif", nameAr: "تيغنيف", communes: [
        { name: "Tighennif", nameAr: "تيغنيف" },
        { name: "Matemore", nameAr: "مطمور" },
        { name: "Ain Fekan", nameAr: "عين فكان" }
      ]},
      { code: "2905", name: "Ghriss", nameAr: "غريس", communes: [
        { name: "Ghriss", nameAr: "غريس" },
        { name: "Froha", nameAr: "فروحة" },
        { name: "Maoussa", nameAr: "ماوسة" }
      ]},
      { code: "2906", name: "Bouhanifia", nameAr: "بوحنيفية", communes: [
        { name: "Bouhanifia", nameAr: "بوحنيفية" },
        { name: "Hacine", nameAr: "حسين" }
      ]},
      { code: "2907", name: "Ain Fares", nameAr: "عين فارس", communes: [
        { name: "Ain Fares", nameAr: "عين فارس" },
        { name: "Oued El Abtal", nameAr: "وادي الأبطال" }
      ]},
      { code: "2908", name: "Oued Taria", nameAr: "وادي التاغية", communes: [
        { name: "Oued Taria", nameAr: "وادي التاغية" },
        { name: "Aouf", nameAr: "عوف" }
      ]}
    ]
  },
  {
    code: "30",
    name: "Ouargla",
    nameAr: "ورقلة",
    dairas: [
      { code: "3001", name: "Ouargla", nameAr: "ورقلة", communes: [
        { name: "Ouargla", nameAr: "ورقلة" },
        { name: "Rouissat", nameAr: "الرويسات" },
        { name: "Ain Beida", nameAr: "عين البيضاء" }
      ]},
      { code: "3002", name: "Hassi Messaoud", nameAr: "حاسي مسعود", communes: [
        { name: "Hassi Messaoud", nameAr: "حاسي مسعود" }
      ]},
      { code: "3003", name: "N'goussa", nameAr: "انقوسة", communes: [
        { name: "N'goussa", nameAr: "انقوسة" }
      ]},
      { code: "3004", name: "Sidi Khouiled", nameAr: "سيدي خويلد", communes: [
        { name: "Sidi Khouiled", nameAr: "سيدي خويلد" },
        { name: "Hassi Ben Abdallah", nameAr: "حاسي بن عبد الله" }
      ]},
      { code: "3005", name: "El Borma", nameAr: "البرمة", communes: [
        { name: "El Borma", nameAr: "البرمة" }
      ]}
    ]
  },
  {
    code: "31",
    name: "Oran",
    nameAr: "وهران",
    dairas: [
      { code: "3101", name: "Oran", nameAr: "وهران", communes: [
        { name: "Oran", nameAr: "وهران" }
      ]},
      { code: "3102", name: "Es Senia", nameAr: "السانية", communes: [
        { name: "Es Senia", nameAr: "السانية" },
        { name: "El Kerma", nameAr: "الكرمة" }
      ]},
      { code: "3103", name: "Bir El Djir", nameAr: "بئر الجير", communes: [
        { name: "Bir El Djir", nameAr: "بئر الجير" },
        { name: "Hassi Bounif", nameAr: "حاسي بونيف" },
        { name: "Hassi Ben Okba", nameAr: "حاسي بن عقبة" }
      ]},
      { code: "3104", name: "Arzew", nameAr: "أرزيو", communes: [
        { name: "Arzew", nameAr: "أرزيو" },
        { name: "Bethioua", nameAr: "بطيوة" },
        { name: "Sidi Ben Yebka", nameAr: "سيدي بن يبقى" }
      ]},
      { code: "3105", name: "Ain Turk", nameAr: "عين الترك", communes: [
        { name: "Ain Turk", nameAr: "عين الترك" },
        { name: "Mers El Kebir", nameAr: "المرسى الكبير" },
        { name: "Bousfer", nameAr: "بوسفر" }
      ]},
      { code: "3106", name: "Gdyel", nameAr: "قديل", communes: [
        { name: "Gdyel", nameAr: "قديل" },
        { name: "Hassi Mefsoukh", nameAr: "حاسي مفسوخ" },
        { name: "Ben Freha", nameAr: "بن فريحة" }
      ]},
      { code: "3107", name: "Boutlelis", nameAr: "بوتليليس", communes: [
        { name: "Boutlelis", nameAr: "بوتليليس" },
        { name: "Ain El Kerma", nameAr: "عين الكرمة" },
        { name: "Misserghin", nameAr: "مسرغين" }
      ]},
      { code: "3108", name: "Oued Tlelat", nameAr: "وادي تليلات", communes: [
        { name: "Oued Tlelat", nameAr: "وادي تليلات" },
        { name: "Tafraoui", nameAr: "تافراوي" },
        { name: "Sidi Chami", nameAr: "سيدي الشحمي" }
      ]}
    ]
  },
  {
    code: "32",
    name: "El Bayadh",
    nameAr: "البيض",
    dairas: [
      { code: "3201", name: "El Bayadh", nameAr: "البيض", communes: [
        { name: "El Bayadh", nameAr: "البيض" },
        { name: "Rogassa", nameAr: "روقاصة" },
        { name: "Stitten", nameAr: "ستيتن" }
      ]},
      { code: "3202", name: "Bougtob", nameAr: "بوقطب", communes: [
        { name: "Bougtob", nameAr: "بوقطب" },
        { name: "El Kheiter", nameAr: "الخيثر" },
        { name: "Kef El Ahmar", nameAr: "الكاف الأحمر" }
      ]},
      { code: "3203", name: "El Abiodh Sidi Cheikh", nameAr: "الأبيض سيدي الشيخ", communes: [
        { name: "El Abiodh Sidi Cheikh", nameAr: "الأبيض سيدي الشيخ" },
        { name: "Ain El Orak", nameAr: "عين العراك" }
      ]},
      { code: "3204", name: "Brezina", nameAr: "بريزينة", communes: [
        { name: "Brezina", nameAr: "بريزينة" },
        { name: "Ghassoul", nameAr: "الغاسول" }
      ]},
      { code: "3205", name: "Chellala", nameAr: "الشلالة", communes: [
        { name: "Chellala", nameAr: "الشلالة" },
        { name: "Kraakda", nameAr: "كراكدة" }
      ]},
      { code: "3206", name: "Boualem", nameAr: "بوعالم", communes: [
        { name: "Boualem", nameAr: "بوعالم" },
        { name: "Arbaouat", nameAr: "أربوات" }
      ]},
      { code: "3207", name: "Bou Semghoun", nameAr: "بوسمغون", communes: [
        { name: "Bou Semghoun", nameAr: "بوسمغون" },
        { name: "El Mehara", nameAr: "المحرة" }
      ]}
    ]
  },
  {
    code: "33",
    name: "Illizi",
    nameAr: "إليزي",
    dairas: [
      { code: "3301", name: "Illizi", nameAr: "إليزي", communes: [
        { name: "Illizi", nameAr: "إليزي" }
      ]},
      { code: "3302", name: "In Amenas", nameAr: "عين أمناس", communes: [
        { name: "In Amenas", nameAr: "عين أمناس" }
      ]}
    ]
  },
  {
    code: "34",
    name: "Bordj Bou Arreridj",
    nameAr: "برج بوعريريج",
    dairas: [
      { code: "3401", name: "Bordj Bou Arreridj", nameAr: "برج بوعريريج", communes: [
        { name: "Bordj Bou Arreridj", nameAr: "برج بوعريريج" },
        { name: "El Hamadia", nameAr: "الحمادية" },
        { name: "Hasnaoua", nameAr: "حسناوة" }
      ]},
      { code: "3402", name: "Ras El Oued", nameAr: "رأس الوادي", communes: [
        { name: "Ras El Oued", nameAr: "رأس الوادي" },
        { name: "Ouled Brahem", nameAr: "أولاد ابراهيم" },
        { name: "Tassameurt", nameAr: "تسامرت" }
      ]},
      { code: "3403", name: "Bordj Ghedir", nameAr: "برج الغدير", communes: [
        { name: "Bordj Ghedir", nameAr: "برج الغدير" },
        { name: "Sidi Embarek", nameAr: "سيدي امبارك" },
        { name: "Tefreg", nameAr: "تفرق" }
      ]},
      { code: "3404", name: "Medjana", nameAr: "مجانة", communes: [
        { name: "Medjana", nameAr: "مجانة" },
        { name: "Teniet En Nasr", nameAr: "ثنية النصر" }
      ]},
      { code: "3405", name: "El Hamadia", nameAr: "الحمادية", communes: [
        { name: "El Hamadia", nameAr: "الحمادية" },
        { name: "Belimour", nameAr: "بليمور" }
      ]},
      { code: "3406", name: "Mansourah", nameAr: "منصورة", communes: [
        { name: "Mansourah", nameAr: "منصورة" },
        { name: "El Achir", nameAr: "الأشير" },
        { name: "Ain Taghrout", nameAr: "عين تاغروت" }
      ]},
      { code: "3407", name: "Djaafra", nameAr: "جعافرة", communes: [
        { name: "Djaafra", nameAr: "جعافرة" },
        { name: "Bir Kasdali", nameAr: "بئر قصد علي" }
      ]},
      { code: "3408", name: "El Main", nameAr: "الماين", communes: [
        { name: "El Main", nameAr: "الماين" },
        { name: "Ouled Dahmane", nameAr: "أولاد دحمان" }
      ]}
    ]
  },
  {
    code: "35",
    name: "Boumerdes",
    nameAr: "بومرداس",
    dairas: [
      { code: "3501", name: "Boumerdes", nameAr: "بومرداس", communes: [
        { name: "Boumerdes", nameAr: "بومرداس" },
        { name: "Tidjelabine", nameAr: "تيجلابين" },
        { name: "Corso", nameAr: "كورسو" }
      ]},
      { code: "3502", name: "Bordj Menaiel", nameAr: "برج منايل", communes: [
        { name: "Bordj Menaiel", nameAr: "برج منايل" },
        { name: "Si Mustapha", nameAr: "سي مصطفى" },
        { name: "Ammal", nameAr: "عمال" }
      ]},
      { code: "3503", name: "Dellys", nameAr: "دلس", communes: [
        { name: "Dellys", nameAr: "دلس" },
        { name: "Afir", nameAr: "أفير" },
        { name: "Ben Choud", nameAr: "بن شود" },
        { name: "Baghlia", nameAr: "بغلية" }
      ]},
      { code: "3504", name: "Khemis El Khechna", nameAr: "خميس الخشنة", communes: [
        { name: "Khemis El Khechna", nameAr: "خميس الخشنة" },
        { name: "Ouled Moussa", nameAr: "أولاد موسى" },
        { name: "Hammadi", nameAr: "حمادي" }
      ]},
      { code: "3505", name: "Thenia", nameAr: "الثنية", communes: [
        { name: "Thenia", nameAr: "الثنية" },
        { name: "Souk El Had", nameAr: "سوق الحد" },
        { name: "Boudouaou", nameAr: "بودواو" }
      ]},
      { code: "3506", name: "Isser", nameAr: "يسر", communes: [
        { name: "Isser", nameAr: "يسر" },
        { name: "Chabet El Ameur", nameAr: "شعبة العامر" },
        { name: "Djinet", nameAr: "جينات" }
      ]},
      { code: "3507", name: "Naciria", nameAr: "الناصرية", communes: [
        { name: "Naciria", nameAr: "الناصرية" },
        { name: "Timezrit", nameAr: "تيمزريت" },
        { name: "Beni Amrane", nameAr: "بني عمران" }
      ]},
      { code: "3508", name: "Baghlia", nameAr: "بغلية", communes: [
        { name: "Baghlia", nameAr: "بغلية" },
        { name: "Sidi Daoud", nameAr: "سيدي داود" }
      ]}
    ]
  },
  {
    code: "36",
    name: "El Tarf",
    nameAr: "الطارف",
    dairas: [
      { code: "3601", name: "El Tarf", nameAr: "الطارف", communes: [
        { name: "El Tarf", nameAr: "الطارف" },
        { name: "Zitouna", nameAr: "الزيتونة" },
        { name: "Ain El Assel", nameAr: "عين العسل" }
      ]},
      { code: "3602", name: "El Kala", nameAr: "القالة", communes: [
        { name: "El Kala", nameAr: "القالة" },
        { name: "Souarekh", nameAr: "السوارخ" },
        { name: "Berrihane", nameAr: "بريحان" }
      ]},
      { code: "3603", name: "Bouhadjar", nameAr: "بوحجار", communes: [
        { name: "Bouhadjar", nameAr: "بوحجار" },
        { name: "Chebaita Mokhtar", nameAr: "شبيطة مختار" },
        { name: "Oued Zitoun", nameAr: "وادي الزيتون" }
      ]},
      { code: "3604", name: "Ben M'hidi", nameAr: "بن مهيدي", communes: [
        { name: "Ben M'hidi", nameAr: "بن مهيدي" },
        { name: "Zerizer", nameAr: "زريزر" },
        { name: "Echatt", nameAr: "الشط" }
      ]},
      { code: "3605", name: "Drean", nameAr: "الذرعان", communes: [
        { name: "Drean", nameAr: "الذرعان" },
        { name: "Chihani", nameAr: "شيحاني" }
      ]},
      { code: "3606", name: "Besbes", nameAr: "بسباس", communes: [
        { name: "Besbes", nameAr: "بسباس" },
        { name: "Asfour", nameAr: "عصفور" }
      ]},
      { code: "3607", name: "Lac des Oiseaux", nameAr: "بحيرة الطيور", communes: [
        { name: "Lac des Oiseaux", nameAr: "بحيرة الطيور" },
        { name: "Raml Souk", nameAr: "رمل السوق" }
      ]}
    ]
  },
  {
    code: "37",
    name: "Tindouf",
    nameAr: "تندوف",
    dairas: [
      { code: "3701", name: "Tindouf", nameAr: "تندوف", communes: [
        { name: "Tindouf", nameAr: "تندوف" }
      ]},
      { code: "3702", name: "Oum El Assel", nameAr: "أم العسل", communes: [
        { name: "Oum El Assel", nameAr: "أم العسل" }
      ]}
    ]
  },
  {
    code: "38",
    name: "Tissemsilt",
    nameAr: "تيسمسيلت",
    dairas: [
      { code: "3801", name: "Tissemsilt", nameAr: "تيسمسيلت", communes: [
        { name: "Tissemsilt", nameAr: "تيسمسيلت" },
        { name: "Beni Chaib", nameAr: "بني شعيب" },
        { name: "Lazharia", nameAr: "الأزهرية" }
      ]},
      { code: "3802", name: "Bordj Bounaama", nameAr: "برج بونعامة", communes: [
        { name: "Bordj Bounaama", nameAr: "برج بونعامة" },
        { name: "Beni Lahcene", nameAr: "بني لحسن" },
        { name: "Sidi Abed", nameAr: "سيدي عابد" }
      ]},
      { code: "3803", name: "Theniet El Had", nameAr: "ثنية الحد", communes: [
        { name: "Theniet El Had", nameAr: "ثنية الحد" },
        { name: "Youssoufia", nameAr: "اليوسفية" },
        { name: "Maacem", nameAr: "معاصم" }
      ]},
      { code: "3804", name: "Lardjem", nameAr: "لرجام", communes: [
        { name: "Lardjem", nameAr: "لرجام" },
        { name: "Melaab", nameAr: "ملعب" },
        { name: "Sidi Boutouchent", nameAr: "سيدي بوتوشنت" }
      ]},
      { code: "3805", name: "Khemisti", nameAr: "خميستي", communes: [
        { name: "Khemisti", nameAr: "خميستي" },
        { name: "Ouled Bessem", nameAr: "أولاد بسام" }
      ]},
      { code: "3806", name: "Ammari", nameAr: "عماري", communes: [
        { name: "Ammari", nameAr: "عماري" },
        { name: "Sidi Slimane", nameAr: "سيدي سليمان" }
      ]},
      { code: "3807", name: "Layoune", nameAr: "العيون", communes: [
        { name: "Layoune", nameAr: "العيون" },
        { name: "Boucaid", nameAr: "بوقايد" }
      ]}
    ]
  },
  {
    code: "39",
    name: "El Oued",
    nameAr: "الوادي",
    dairas: [
      { code: "3901", name: "El Oued", nameAr: "الوادي", communes: [
        { name: "El Oued", nameAr: "الوادي" },
        { name: "Kouinine", nameAr: "كوينين" },
        { name: "Bayadha", nameAr: "البياضة" }
      ]},
      { code: "3902", name: "Guemar", nameAr: "قمار", communes: [
        { name: "Guemar", nameAr: "قمار" },
        { name: "Taghzout", nameAr: "تاغزوت" },
        { name: "Sidi Aoun", nameAr: "سيدي عون" }
      ]},
      { code: "3903", name: "Robbah", nameAr: "الرباح", communes: [
        { name: "Robbah", nameAr: "الرباح" },
        { name: "Nakhla", nameAr: "النخلة" },
        { name: "Ourmas", nameAr: "أورماس" }
      ]},
      { code: "3904", name: "Debila", nameAr: "الدبيلة", communes: [
        { name: "Debila", nameAr: "الدبيلة" },
        { name: "Hassani Abdelkrim", nameAr: "حساني عبد الكريم" }
      ]},
      { code: "3905", name: "Hassi Khalifa", nameAr: "حاسي خليفة", communes: [
        { name: "Hassi Khalifa", nameAr: "حاسي خليفة" }
      ]},
      { code: "3906", name: "Taleb Larbi", nameAr: "طالب العربي", communes: [
        { name: "Taleb Larbi", nameAr: "طالب العربي" },
        { name: "Douar El Ma", nameAr: "دوار الماء" }
      ]}
    ]
  },
  {
    code: "40",
    name: "Khenchela",
    nameAr: "خنشلة",
    dairas: [
      { code: "4001", name: "Khenchela", nameAr: "خنشلة", communes: [
        { name: "Khenchela", nameAr: "خنشلة" },
        { name: "El Mahmal", nameAr: "المحمل" },
        { name: "Mtoussa", nameAr: "متوسة" }
      ]},
      { code: "4002", name: "Kais", nameAr: "قايس", communes: [
        { name: "Kais", nameAr: "قايس" },
        { name: "Baghai", nameAr: "باغاي" },
        { name: "El Hamma", nameAr: "الحامة" }
      ]},
      { code: "4003", name: "Chechar", nameAr: "ششار", communes: [
        { name: "Chechar", nameAr: "ششار" },
        { name: "Djellal", nameAr: "جلال" }
      ]},
      { code: "4004", name: "Ouled Rechache", nameAr: "أولاد رشاش", communes: [
        { name: "Ouled Rechache", nameAr: "أولاد رشاش" },
        { name: "Remila", nameAr: "الرميلة" }
      ]},
      { code: "4005", name: "Babar", nameAr: "بابار", communes: [
        { name: "Babar", nameAr: "بابار" },
        { name: "Bouhmama", nameAr: "بوحمامة" },
        { name: "Tamza", nameAr: "تامزة" }
      ]},
      { code: "4006", name: "Ain Touila", nameAr: "عين الطويلة", communes: [
        { name: "Ain Touila", nameAr: "عين الطويلة" },
        { name: "Taouzianat", nameAr: "تاوزيانات" }
      ]},
      { code: "4007", name: "Yabous", nameAr: "يابوس", communes: [
        { name: "Yabous", nameAr: "يابوس" },
        { name: "Chelia", nameAr: "شلية" }
      ]}
    ]
  },
  {
    code: "41",
    name: "Souk Ahras",
    nameAr: "سوق أهراس",
    dairas: [
      { code: "4101", name: "Souk Ahras", nameAr: "سوق أهراس", communes: [
        { name: "Souk Ahras", nameAr: "سوق أهراس" },
        { name: "Zaarouria", nameAr: "الزعرورية" },
        { name: "Ouled Driss", nameAr: "أولاد دريس" }
      ]},
      { code: "4102", name: "Sedrata", nameAr: "سدراتة", communes: [
        { name: "Sedrata", nameAr: "سدراتة" },
        { name: "Khemissa", nameAr: "خميسة" },
        { name: "Oued Keberit", nameAr: "وادي الكبريت" }
      ]},
      { code: "4103", name: "M'daourouch", nameAr: "مداوروش", communes: [
        { name: "M'daourouch", nameAr: "مداوروش" },
        { name: "Drea", nameAr: "دريعة" },
        { name: "Ouillen", nameAr: "ويلان" }
      ]},
      { code: "4104", name: "Taoura", nameAr: "تاورة", communes: [
        { name: "Taoura", nameAr: "تاورة" },
        { name: "Mechroha", nameAr: "المشروحة" },
        { name: "Sidi Fredj", nameAr: "سيدي فرج" }
      ]},
      { code: "4105", name: "Bir Bouhouche", nameAr: "بئر بوحوش", communes: [
        { name: "Bir Bouhouche", nameAr: "بئر بوحوش" },
        { name: "Ouled Moumen", nameAr: "أولاد مومن" }
      ]},
      { code: "4106", name: "Heddada", nameAr: "الحدادة", communes: [
        { name: "Heddada", nameAr: "الحدادة" },
        { name: "Khedara", nameAr: "خضارة" }
      ]},
      { code: "4107", name: "Merahna", nameAr: "المراهنة", communes: [
        { name: "Merahna", nameAr: "المراهنة" },
        { name: "Terraguelt", nameAr: "ترقالت" }
      ]},
      { code: "4108", name: "Ouled Driss", nameAr: "أولاد دريس", communes: [
        { name: "Ouled Driss", nameAr: "أولاد دريس" },
        { name: "Ain Zana", nameAr: "عين الزانة" }
      ]}
    ]
  },
  {
    code: "42",
    name: "Tipaza",
    nameAr: "تيبازة",
    dairas: [
      { code: "4201", name: "Tipaza", nameAr: "تيبازة", communes: [
        { name: "Tipaza", nameAr: "تيبازة" },
        { name: "Nador", nameAr: "الناظور" },
        { name: "Sidi Rached", nameAr: "سيدي راشد" }
      ]},
      { code: "4202", name: "Cherchell", nameAr: "شرشال", communes: [
        { name: "Cherchell", nameAr: "شرشال" },
        { name: "Sidi Ghiles", nameAr: "سيدي غيلاس" },
        { name: "Hadjret Ennous", nameAr: "حجرة النص" }
      ]},
      { code: "4203", name: "Kolea", nameAr: "القليعة", communes: [
        { name: "Kolea", nameAr: "القليعة" },
        { name: "Douaouda", nameAr: "دواودة" },
        { name: "Chaiba", nameAr: "الشعيبة" }
      ]},
      { code: "4204", name: "Hadjout", nameAr: "حجوط", communes: [
        { name: "Hadjout", nameAr: "حجوط" },
        { name: "Merad", nameAr: "مراد" },
        { name: "Ahmer El Ain", nameAr: "أحمر العين" }
      ]},
      { code: "4205", name: "Bou Ismail", nameAr: "بواسماعيل", communes: [
        { name: "Bou Ismail", nameAr: "بواسماعيل" },
        { name: "Khemisti", nameAr: "خميستي" },
        { name: "Ain Tagourait", nameAr: "عين تاقورايت" }
      ]},
      { code: "4206", name: "Fouka", nameAr: "فوكة", communes: [
        { name: "Fouka", nameAr: "فوكة" },
        { name: "Bou Haroun", nameAr: "بوهارون" }
      ]},
      { code: "4207", name: "Gouraya", nameAr: "قوراية", communes: [
        { name: "Gouraya", nameAr: "قوراية" },
        { name: "Messelmoun", nameAr: "مسلمون" },
        { name: "Aghbal", nameAr: "أغبال" }
      ]},
      { code: "4208", name: "Damous", nameAr: "الداموس", communes: [
        { name: "Damous", nameAr: "الداموس" },
        { name: "Larhat", nameAr: "لرهاط" }
      ]},
      { code: "4209", name: "Sidi Amar", nameAr: "سيدي عمر", communes: [
        { name: "Sidi Amar", nameAr: "سيدي عمر" },
        { name: "Menaceur", nameAr: "مناصر" }
      ]}
    ]
  },
  {
    code: "43",
    name: "Mila",
    nameAr: "ميلة",
    dairas: [
      { code: "4301", name: "Mila", nameAr: "ميلة", communes: [
        { name: "Mila", nameAr: "ميلة" },
        { name: "Zeghaia", nameAr: "زغاية" },
        { name: "Sidi Khelifa", nameAr: "سيدي خليفة" }
      ]},
      { code: "4302", name: "Ferdjioua", nameAr: "فرجيوة", communes: [
        { name: "Ferdjioua", nameAr: "فرجيوة" },
        { name: "Tiberguent", nameAr: "تيبرقنت" },
        { name: "Derrahi Bousselah", nameAr: "دراحي بوصلاح" }
      ]},
      { code: "4303", name: "Chelghoum Laid", nameAr: "شلغوم العيد", communes: [
        { name: "Chelghoum Laid", nameAr: "شلغوم العيد" },
        { name: "Oued Athmenia", nameAr: "وادي العثمانية" },
        { name: "Teleghma", nameAr: "التلاغمة" }
      ]},
      { code: "4304", name: "Grarem Gouga", nameAr: "قرارم قوقة", communes: [
        { name: "Grarem Gouga", nameAr: "قرارم قوقة" },
        { name: "Hamala", nameAr: "حمالة" }
      ]},
      { code: "4305", name: "Oued Athmania", nameAr: "وادي العثمانية", communes: [
        { name: "Oued Athmania", nameAr: "وادي العثمانية" },
        { name: "Ain Tine", nameAr: "عين التين" }
      ]},
      { code: "4306", name: "Tassadane Haddada", nameAr: "تسدان حدادة", communes: [
        { name: "Tassadane Haddada", nameAr: "تسدان حدادة" },
        { name: "Terrai Bainen", nameAr: "تراي باينان" }
      ]},
      { code: "4307", name: "Rouached", nameAr: "الرواشد", communes: [
        { name: "Rouached", nameAr: "الرواشد" },
        { name: "Tessala Lemtai", nameAr: "تسالة لمطاعي" }
      ]},
      { code: "4308", name: "Tadjenanet", nameAr: "تاجنانت", communes: [
        { name: "Tadjenanet", nameAr: "تاجنانت" },
        { name: "Bouhatem", nameAr: "بوحاتم" }
      ]}
    ]
  },
  {
    code: "44",
    name: "Ain Defla",
    nameAr: "عين الدفلى",
    dairas: [
      { code: "4401", name: "Ain Defla", nameAr: "عين الدفلى", communes: [
        { name: "Ain Defla", nameAr: "عين الدفلى" },
        { name: "Mekhatria", nameAr: "مخاطرية" },
        { name: "Rouina", nameAr: "الروينة" }
      ]},
      { code: "4402", name: "Khemis Miliana", nameAr: "خميس مليانة", communes: [
        { name: "Khemis Miliana", nameAr: "خميس مليانة" },
        { name: "Sidi Lakhdar", nameAr: "سيدي لخضر" },
        { name: "Bir Ould Khelifa", nameAr: "بئر ولد خليفة" }
      ]},
      { code: "4403", name: "Miliana", nameAr: "مليانة", communes: [
        { name: "Miliana", nameAr: "مليانة" },
        { name: "Ben Allal", nameAr: "بن علال" },
        { name: "Ain Torki", nameAr: "عين التركي" }
      ]},
      { code: "4404", name: "El Attaf", nameAr: "العطاف", communes: [
        { name: "El Attaf", nameAr: "العطاف" },
        { name: "Djendel", nameAr: "جندل" },
        { name: "El Amra", nameAr: "العامرة" }
      ]},
      { code: "4405", name: "Djelida", nameAr: "جليدة", communes: [
        { name: "Djelida", nameAr: "جليدة" },
        { name: "Oued Chorfa", nameAr: "وادي الشرفة" }
      ]},
      { code: "4406", name: "El Abadia", nameAr: "العبادية", communes: [
        { name: "El Abadia", nameAr: "العبادية" },
        { name: "Bourached", nameAr: "بوراشد" }
      ]},
      { code: "4407", name: "Hammam Righa", nameAr: "حمام ريغة", communes: [
        { name: "Hammam Righa", nameAr: "حمام ريغة" },
        { name: "Arib", nameAr: "عريب" }
      ]},
      { code: "4408", name: "Bathia", nameAr: "بطحية", communes: [
        { name: "Bathia", nameAr: "بطحية" },
        { name: "Tacheta Zougagha", nameAr: "تاشتة زقاغة" }
      ]}
    ]
  },
  {
    code: "45",
    name: "Naama",
    nameAr: "النعامة",
    dairas: [
      { code: "4501", name: "Naama", nameAr: "النعامة", communes: [
        { name: "Naama", nameAr: "النعامة" },
        { name: "Sfissifa", nameAr: "سفيسيفة" }
      ]},
      { code: "4502", name: "Mecheria", nameAr: "المشرية", communes: [
        { name: "Mecheria", nameAr: "المشرية" },
        { name: "El Biod", nameAr: "البيوض" }
      ]},
      { code: "4503", name: "Ain Sefra", nameAr: "عين الصفراء", communes: [
        { name: "Ain Sefra", nameAr: "عين الصفراء" },
        { name: "Tiout", nameAr: "تيوت" }
      ]},
      { code: "4504", name: "Moghrar", nameAr: "مغرار", communes: [
        { name: "Moghrar", nameAr: "مغرار" },
        { name: "Djenien Bourezg", nameAr: "جنين بورزق" }
      ]},
      { code: "4505", name: "Asla", nameAr: "عسلة", communes: [
        { name: "Asla", nameAr: "عسلة" },
        { name: "Mekmen Ben Amar", nameAr: "مكمن بن عمار" }
      ]},
      { code: "4506", name: "Kasdir", nameAr: "قصدير", communes: [
        { name: "Kasdir", nameAr: "قصدير" },
        { name: "Ain Ben Khelil", nameAr: "عين بن خليل" }
      ]}
    ]
  },
  {
    code: "46",
    name: "Ain Temouchent",
    nameAr: "عين تموشنت",
    dairas: [
      { code: "4601", name: "Ain Temouchent", nameAr: "عين تموشنت", communes: [
        { name: "Ain Temouchent", nameAr: "عين تموشنت" },
        { name: "Sidi Ben Adda", nameAr: "سيدي بن عدة" },
        { name: "Chaabat El Leham", nameAr: "شعبة اللحم" }
      ]},
      { code: "4602", name: "Beni Saf", nameAr: "بني صاف", communes: [
        { name: "Beni Saf", nameAr: "بني صاف" },
        { name: "Sidi Safi", nameAr: "سيدي صافي" },
        { name: "Oulhaca El Gheraba", nameAr: "ولهاصة الغرابة" }
      ]},
      { code: "4603", name: "Hammam Bou Hadjar", nameAr: "حمام بوحجر", communes: [
        { name: "Hammam Bou Hadjar", nameAr: "حمام بوحجر" },
        { name: "Oued Berkeche", nameAr: "وادي بركش" },
        { name: "Tamzoura", nameAr: "تامزورة" }
      ]},
      { code: "4604", name: "El Amria", nameAr: "العامرية", communes: [
        { name: "El Amria", nameAr: "العامرية" },
        { name: "Hassi El Ghella", nameAr: "حاسي الغلة" },
        { name: "Aoubellil", nameAr: "أوبليل" }
      ]},
      { code: "4605", name: "El Malah", nameAr: "المالح", communes: [
        { name: "El Malah", nameAr: "المالح" },
        { name: "Oued Sabah", nameAr: "وادي الصباح" }
      ]},
      { code: "4606", name: "Ain El Arbaa", nameAr: "عين الأربعاء", communes: [
        { name: "Ain El Arbaa", nameAr: "عين الأربعاء" },
        { name: "Chentouf", nameAr: "شنتوف" }
      ]},
      { code: "4607", name: "Ain Kihal", nameAr: "عين الكيحل", communes: [
        { name: "Ain Kihal", nameAr: "عين الكيحل" },
        { name: "Aghlal", nameAr: "أغلال" }
      ]}
    ]
  },
  {
    code: "47",
    name: "Ghardaia",
    nameAr: "غرداية",
    dairas: [
      { code: "4701", name: "Ghardaia", nameAr: "غرداية", communes: [
        { name: "Ghardaia", nameAr: "غرداية" },
        { name: "Daya Ben Dahoua", nameAr: "ضاية بن ضحوة" },
        { name: "Bounoura", nameAr: "بونورة" }
      ]},
      { code: "4702", name: "Metlili", nameAr: "متليلي", communes: [
        { name: "Metlili", nameAr: "متليلي" },
        { name: "Sebseb", nameAr: "سبسب" }
      ]},
      { code: "4703", name: "Berriane", nameAr: "بريان", communes: [
        { name: "Berriane", nameAr: "بريان" }
      ]},
      { code: "4704", name: "Guerrara", nameAr: "القرارة", communes: [
        { name: "Guerrara", nameAr: "القرارة" }
      ]},
      { code: "4705", name: "El Atteuf", nameAr: "العطف", communes: [
        { name: "El Atteuf", nameAr: "العطف" }
      ]},
      { code: "4706", name: "Zelfana", nameAr: "زلفانة", communes: [
        { name: "Zelfana", nameAr: "زلفانة" }
      ]},
      { code: "4707", name: "El Menia", nameAr: "المنيعة", communes: [
        { name: "El Menia", nameAr: "المنيعة" },
        { name: "Hassi Gara", nameAr: "حاسي القارة" },
        { name: "Hassi Fehal", nameAr: "حاسي الفحل" }
      ]}
    ]
  },
  {
    code: "48",
    name: "Relizane",
    nameAr: "غليزان",
    dairas: [
      { code: "4801", name: "Relizane", nameAr: "غليزان", communes: [
        { name: "Relizane", nameAr: "غليزان" },
        { name: "Bendaoud", nameAr: "بن داود" },
        { name: "Sidi M'hamed Benali", nameAr: "سيدي محمد بن علي" }
      ]},
      { code: "4802", name: "Oued Rhiou", nameAr: "وادي رهيو", communes: [
        { name: "Oued Rhiou", nameAr: "وادي رهيو" },
        { name: "El Matmar", nameAr: "المطمر" },
        { name: "Ouarizane", nameAr: "واريزان" }
      ]},
      { code: "4803", name: "Mazouna", nameAr: "مازونة", communes: [
        { name: "Mazouna", nameAr: "مازونة" },
        { name: "Sidi Khettab", nameAr: "سيدي خطاب" },
        { name: "Kalaa", nameAr: "القلعة" }
      ]},
      { code: "4804", name: "Mendes", nameAr: "منداس", communes: [
        { name: "Mendes", nameAr: "منداس" },
        { name: "Beni Zentis", nameAr: "بني زنطيس" }
      ]},
      { code: "4805", name: "Djidiouia", nameAr: "جديوية", communes: [
        { name: "Djidiouia", nameAr: "جديوية" },
        { name: "Ain Tarek", nameAr: "عين طارق" }
      ]},
      { code: "4806", name: "Yellel", nameAr: "يلل", communes: [
        { name: "Yellel", nameAr: "يلل" },
        { name: "Souk El Had", nameAr: "سوق الحد" }
      ]},
      { code: "4807", name: "Ammi Moussa", nameAr: "عمي موسى", communes: [
        { name: "Ammi Moussa", nameAr: "عمي موسى" },
        { name: "Ouled Sidi Mihoub", nameAr: "أولاد سيدي ميهوب" }
      ]},
      { code: "4808", name: "Zemmora", nameAr: "زمورة", communes: [
        { name: "Zemmora", nameAr: "زمورة" },
        { name: "Mediouna", nameAr: "مديونة" }
      ]}
    ]
  },
  // الولايات الجديدة (49-58)
  {
    code: "49",
    name: "Timimoun",
    nameAr: "تيميمون",
    dairas: [
      { code: "4901", name: "Timimoun", nameAr: "تيميمون", communes: [
        { name: "Timimoun", nameAr: "تيميمون" },
        { name: "Ouled Said", nameAr: "أولاد السعيد" }
      ]},
      { code: "4902", name: "Charouine", nameAr: "شروين", communes: [
        { name: "Charouine", nameAr: "شروين" },
        { name: "Ouled Aissa", nameAr: "أولاد عيسى" },
        { name: "Talmine", nameAr: "طالمين" }
      ]},
      { code: "4903", name: "Tinerkouk", nameAr: "تنركوك", communes: [
        { name: "Tinerkouk", nameAr: "تنركوك" },
        { name: "Ksar Kaddour", nameAr: "قصر قدور" }
      ]},
      { code: "4904", name: "Aougrout", nameAr: "أوقروت", communes: [
        { name: "Aougrout", nameAr: "أوقروت" },
        { name: "Deldoul", nameAr: "دلدول" },
        { name: "Metarfa", nameAr: "المطارفة" }
      ]}
    ]
  },
  {
    code: "50",
    name: "Bordj Badji Mokhtar",
    nameAr: "برج باجي مختار",
    dairas: [
      { code: "5001", name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار", communes: [
        { name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار" }
      ]},
      { code: "5002", name: "Timiaouine", nameAr: "تيمياوين", communes: [
        { name: "Timiaouine", nameAr: "تيمياوين" }
      ]}
    ]
  },
  {
    code: "51",
    name: "Ouled Djellal",
    nameAr: "أولاد جلال",
    dairas: [
      { code: "5101", name: "Ouled Djellal", nameAr: "أولاد جلال", communes: [
        { name: "Ouled Djellal", nameAr: "أولاد جلال" },
        { name: "Doucen", nameAr: "الدوسن" },
        { name: "Chaiba", nameAr: "الشعيبة" }
      ]},
      { code: "5102", name: "Sidi Khaled", nameAr: "سيدي خالد", communes: [
        { name: "Sidi Khaled", nameAr: "سيدي خالد" },
        { name: "Besbes", nameAr: "بسباس" },
        { name: "Ras El Miad", nameAr: "رأس الميعاد" }
      ]}
    ]
  },
  {
    code: "52",
    name: "Beni Abbes",
    nameAr: "بني عباس",
    dairas: [
      { code: "5201", name: "Beni Abbes", nameAr: "بني عباس", communes: [
        { name: "Beni Abbes", nameAr: "بني عباس" },
        { name: "Tamtert", nameAr: "تامترت" }
      ]},
      { code: "5202", name: "Igli", nameAr: "إقلي", communes: [
        { name: "Igli", nameAr: "إقلي" }
      ]},
      { code: "5203", name: "Kerzaz", nameAr: "كرزاز", communes: [
        { name: "Kerzaz", nameAr: "كرزاز" },
        { name: "Timoudi", nameAr: "تيمودي" },
        { name: "Beni Ikhlef", nameAr: "بن يخلف" }
      ]},
      { code: "5204", name: "El Ouata", nameAr: "الواتة", communes: [
        { name: "El Ouata", nameAr: "الواتة" }
      ]},
      { code: "5205", name: "Ouled Khodeir", nameAr: "أولاد خضير", communes: [
        { name: "Ouled Khodeir", nameAr: "أولاد خضير" },
        { name: "Ksabi", nameAr: "القصابي" }
      ]}
    ]
  },
  {
    code: "53",
    name: "In Salah",
    nameAr: "عين صالح",
    dairas: [
      { code: "5301", name: "In Salah", nameAr: "عين صالح", communes: [
        { name: "In Salah", nameAr: "عين صالح" },
        { name: "Foggaret Ezzoua", nameAr: "فقارة الزوى" }
      ]},
      { code: "5302", name: "In Ghar", nameAr: "إينغر", communes: [
        { name: "In Ghar", nameAr: "إينغر" }
      ]}
    ]
  },
  {
    code: "54",
    name: "In Guezzam",
    nameAr: "عين قزام",
    dairas: [
      { code: "5401", name: "In Guezzam", nameAr: "عين قزام", communes: [
        { name: "In Guezzam", nameAr: "عين قزام" }
      ]},
      { code: "5402", name: "Tin Zouatine", nameAr: "تين زواتين", communes: [
        { name: "Tin Zouatine", nameAr: "تين زواتين" }
      ]}
    ]
  },
  {
    code: "55",
    name: "Touggourt",
    nameAr: "تقرت",
    dairas: [
      { code: "5501", name: "Touggourt", nameAr: "تقرت", communes: [
        { name: "Touggourt", nameAr: "تقرت" },
        { name: "Nezla", nameAr: "النزلة" },
        { name: "Tebesbest", nameAr: "تبسبست" },
        { name: "Zaouia El Abidia", nameAr: "الزاوية العابدية" }
      ]},
      { code: "5502", name: "Temacine", nameAr: "تماسين", communes: [
        { name: "Temacine", nameAr: "تماسين" },
        { name: "Blidet Amor", nameAr: "بلدة اعمر" }
      ]},
      { code: "5503", name: "El Hadjira", nameAr: "الحجيرة", communes: [
        { name: "El Hadjira", nameAr: "الحجيرة" },
        { name: "El Alia", nameAr: "العالية" }
      ]},
      { code: "5504", name: "Taibet", nameAr: "الطيبات", communes: [
        { name: "Taibet", nameAr: "الطيبات" },
        { name: "Benaceur", nameAr: "بن ناصر" },
        { name: "M'naguer", nameAr: "المنقر" }
      ]},
      { code: "5505", name: "Megarine", nameAr: "المقارين", communes: [
        { name: "Megarine", nameAr: "المقارين" },
        { name: "Sidi Slimane", nameAr: "سيدي سليمان" }
      ]}
    ]
  },
  {
    code: "56",
    name: "Djanet",
    nameAr: "جانت",
    dairas: [
      { code: "5601", name: "Djanet", nameAr: "جانت", communes: [
        { name: "Djanet", nameAr: "جانت" },
        { name: "Bordj El Haouass", nameAr: "برج الحواس" }
      ]}
    ]
  },
  {
    code: "57",
    name: "El Meghaier",
    nameAr: "المغير",
    dairas: [
      { code: "5701", name: "El Meghaier", nameAr: "المغير", communes: [
        { name: "El Meghaier", nameAr: "المغير" },
        { name: "Oum Touyour", nameAr: "أم الطيور" },
        { name: "Sidi Khelil", nameAr: "سيدي خليل" },
        { name: "Still", nameAr: "سطيل" }
      ]},
      { code: "5702", name: "Djamaa", nameAr: "جامعة", communes: [
        { name: "Djamaa", nameAr: "جامعة" },
        { name: "M'rara", nameAr: "المرارة" },
        { name: "Sidi Amrane", nameAr: "سيدي عمران" },
        { name: "Tenedla", nameAr: "تندلة" }
      ]}
    ]
  },
  {
    code: "58",
    name: "El Menia",
    nameAr: "المنيعة",
    dairas: [
      { code: "5801", name: "El Menia", nameAr: "المنيعة", communes: [
        { name: "El Menia", nameAr: "المنيعة" },
        { name: "Hassi Gara", nameAr: "حاسي القارة" }
      ]},
      { code: "5802", name: "Mansourah", nameAr: "المنصورة", communes: [
        { name: "Hassi Fehal", nameAr: "حاسي الفحل" }
      ]}
    ]
  }
];

// دالة للحصول على الدوائر حسب الولاية
export function getDairasByWilaya(wilayaCode: string): Daira[] {
  const wilaya = WILAYAS.find(w => w.code === wilayaCode);
  return wilaya?.dairas || [];
}

// دالة للحصول على البلديات حسب الدائرة
export function getCommunesByDaira(wilayaCode: string, dairaCode: string): Commune[] {
  const wilaya = WILAYAS.find(w => w.code === wilayaCode);
  const daira = wilaya?.dairas.find(d => d.code === dairaCode);
  return daira?.communes || [];
}

// دالة للحصول على اسم الولاية بالعربية
export function getWilayaNameAr(wilayaCode: string): string {
  const wilaya = WILAYAS.find(w => w.code === wilayaCode);
  return wilaya?.nameAr || "";
}

// دالة للحصول على اسم الدائرة بالعربية
export function getDairaNameAr(wilayaCode: string, dairaCode: string): string {
  const wilaya = WILAYAS.find(w => w.code === wilayaCode);
  const daira = wilaya?.dairas.find(d => d.code === dairaCode);
  return daira?.nameAr || "";
}

// دالة للحصول على جميع البلديات حسب الولاية (بدون الدائرة)
export function getCommunesByWilaya(wilayaCode: string): Commune[] {
  const wilaya = WILAYAS.find(w => w.code === wilayaCode);
  if (!wilaya) return [];
  
  // جمع جميع البلديات من جميع الدوائر
  const allCommunes: Commune[] = [];
  wilaya.dairas.forEach(daira => {
    allCommunes.push(...daira.communes);
  });
  
  // إزالة التكرارات وترتيب أبجدياً
  const uniqueCommunes = allCommunes.filter((commune, index, self) =>
    index === self.findIndex(c => c.name === commune.name)
  );
  
  return uniqueCommunes.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
}

// قائمة الولايات للعرض في القائمة المنسدلة
export const WILAYA_OPTIONS = WILAYAS.map(w => ({
  code: w.code,
  name: w.name,
  nameAr: w.nameAr,
  label: `${w.nameAr} (${w.name})`
}));
