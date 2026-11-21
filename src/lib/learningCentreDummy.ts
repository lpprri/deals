// DUMMY — ganti data asli. Learning Path Learning Centre (Pusbangkom
// Penyiaran Radio LPP RRI) — 9 bidang keilmuan RRI (arahan pengguna
// 2026-11-21 15:15 WIB: topik & tema sesuai keilmuan RRI, BUKAN kategori
// platform belajar lain). Struktur: Learning Path → Topik → Materi
// (video). Tiap materi: judul, durasi mm:ss (contoh), mentor dummy
// ("RRI Trainer"), deskripsi singkat, 3 hasil belajar. 1–2 materi
// ditandai selesai: true sebagai contoh tampilan progres + sertifikat.
// Rating 4,5–4,9 dan jumlah peserta dummy. TIDAK ADA foto: kartu memakai
// blok gradien biru RRI + ikon (tanpa foto stok). Harga TIDAK ada di file
// ini — harga hanya tarif KB PP 68/2020 atau "Price on request" di
// halaman (langganan video belum ada tarif KB-nya).

/** Satu materi video (dummy). */
export interface MateriDummy {
  /** Id stabil, mis. 'sejarah-radio'. */
  id: string;
  /** Judul materi, mis. 'A Brief History of Radio'. */
  judul: string;
  /** Durasi video, 'mm:ss' (DUMMY — contoh). */
  durasi: string;
  /** Mentor (DUMMY — contoh). */
  mentor: string;
  /** Deskripsi singkat (DUMMY — contoh). */
  deskripsi: string;
  /** Hasil belajar (DUMMY — contoh). */
  hasil: string[];
  /** Contoh tampilan: materi sudah selesai (progres + sertifikat). */
  selesai?: boolean;
}

/** Satu topik dalam sebuah Learning Path (dummy). */
export interface TopikDummy {
  /** Id stabil, mis. 'dasar-penyiaran'. */
  id: string;
  /** Judul topik, mis. 'Broadcasting Fundamentals'. */
  judul: string;
  /** Materi video dalam topik ini. */
  materi: MateriDummy[];
}

/** Satu Learning Path (dummy). */
export interface LearningPathDummy {
  /** Id stabil, mis. 'penyiaran-radio'. */
  id: string;
  /** Judul path, mis. 'Penyiaran Radio'. */
  judul: string;
  /** Bidang keilmuan RRI, mis. 'Broadcasting'. */
  bidang: string;
  /** Deskripsi singkat path (DUMMY — contoh). */
  deskripsi: string;
  /** Rating (DUMMY — contoh, 4,5–4,9). */
  rating: number;
  /** Jumlah peserta (DUMMY — contoh). */
  peserta: number;
  /** Topik dalam path ini. */
  topik: TopikDummy[];
}

export const LEARNING_PATH_DUMMY: LearningPathDummy[] = [
  {
    id: 'penyiaran-radio',
    judul: 'Penyiaran Radio',
    bidang: 'Broadcasting',
    deskripsi:
      'The foundations of radio broadcasting: how a station works, how programmes are planned, and the rules that govern the airwaves.',
    rating: 4.8,
    peserta: 8400,
    topik: [
      {
        id: 'dasar-penyiaran',
        judul: 'Broadcasting Fundamentals',
        materi: [
          {
            id: 'sejarah-radio',
            judul: 'A Brief History of Radio',
            durasi: '10:24',
            mentor: 'RRI Trainer',
            deskripsi:
              'How radio began and how RRI became the national broadcaster.',
            hasil: [
              'Trace the history of radio',
              'Explain RRI’s role as a public broadcaster',
              'Name the key milestones of Indonesian radio',
            ],
            selesai: true,
          },
          {
            id: 'cara-kerja-stasiun',
            judul: 'How a Radio Station Works',
            durasi: '14:05',
            mentor: 'RRI Trainer',
            deskripsi:
              'Studios, transmitters, and the people behind a broadcast day.',
            hasil: [
              'Describe the broadcast chain',
              'Identify studio roles',
              'Follow a broadcast day from planning to air',
            ],
          },
          {
            id: 'hari-siaran',
            judul: 'The Broadcast Day',
            durasi: '09:47',
            mentor: 'RRI Trainer',
            deskripsi:
              'How a station plans its daily schedule from sign-on to sign-off.',
            hasil: [
              'Read a daily programme schedule',
              'Plan a balanced broadcast day',
              'Handle schedule changes on air',
            ],
          },
        ],
      },
      {
        id: 'programa-jadwal',
        judul: 'Programmes & Schedules',
        materi: [
          {
            id: 'format-programa',
            judul: 'Programme Formats',
            durasi: '12:18',
            mentor: 'RRI Trainer',
            deskripsi:
              'News, music, talk, and drama: the formats that fill the schedule.',
            hasil: [
              'Compare programme formats',
              'Match a format to its audience',
              'Plan a weekly format grid',
            ],
          },
          {
            id: 'menyusun-jadwal',
            judul: 'Building a Programme Schedule',
            durasi: '15:32',
            mentor: 'RRI Trainer',
            deskripsi:
              'From audience habits to the clock: assembling a schedule that works.',
            hasil: [
              'Analyse audience habits',
              'Build a daily schedule',
              'Balance prime time and off-peak slots',
            ],
          },
          {
            id: 'prime-regular',
            judul: 'Prime Time and Regular Time',
            durasi: '11:09',
            mentor: 'RRI Trainer',
            deskripsi:
              'How prime and regular slots are set, and what they mean for programming.',
            hasil: [
              'Define prime and regular time',
              'Place programmes in the right slots',
              'Explain slot rules to partners',
            ],
          },
        ],
      },
      {
        id: 'regulasi-penyiaran',
        judul: 'Broadcasting Regulation',
        materi: [
          {
            id: 'dasar-hukum-siaran',
            judul: 'Broadcasting Law Basics',
            durasi: '13:41',
            mentor: 'RRI Trainer',
            deskripsi:
              'The legal framework every broadcaster must follow.',
            hasil: [
              'Name the key broadcasting laws',
              'Explain licensing basics',
              'Spot content that needs clearance',
            ],
          },
          {
            id: 'standar-konten',
            judul: 'Content Standards on Air',
            durasi: '10:58',
            mentor: 'RRI Trainer',
            deskripsi:
              'What may and may not be broadcast, and who decides.',
            hasil: [
              'Apply content standards',
              'Handle sensitive topics on air',
              'Document editorial decisions',
            ],
          },
          {
            id: 'prinsip-penyiaran-publik',
            judul: 'Public Broadcasting Principles',
            durasi: '12:26',
            mentor: 'RRI Trainer',
            deskripsi:
              'Independence, public service, and accountability in public radio.',
            hasil: [
              'Explain public service principles',
              'Balance independence and accountability',
              'Apply the principles in daily work',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'jurnalistik-radio',
    judul: 'Jurnalistik Radio',
    bidang: 'Radio Journalism',
    deskripsi:
      'Journalism for the ear: writing, reporting, and ethics for radio news.',
    rating: 4.9,
    peserta: 7200,
    topik: [
      {
        id: 'penulisan-berita',
        judul: 'News Writing',
        materi: [
          {
            id: 'menulis-untuk-telinga',
            judul: 'Writing for the Ear',
            durasi: '11:32',
            mentor: 'RRI Trainer',
            deskripsi:
              'Short sentences, spoken rhythm, and clarity for listeners.',
            hasil: [
              'Write in spoken style',
              'Keep sentences short and clear',
              'Read copy aloud for rhythm',
            ],
            selesai: true,
          },
          {
            id: 'lead-5w1h',
            judul: 'The 5W+1H Lead',
            durasi: '09:15',
            mentor: 'RRI Trainer',
            deskripsi:
              'Building a lead that answers what listeners need first.',
            hasil: [
              'Write a strong lead',
              'Order facts by importance',
              'Cut a lead to one breath',
            ],
          },
          {
            id: 'buletin-headline',
            judul: 'Bulletins and Headlines',
            durasi: '13:04',
            mentor: 'RRI Trainer',
            deskripsi:
              'Structuring a news bulletin and writing headlines that land.',
            hasil: [
              'Structure a bulletin',
              'Write radio headlines',
              'Time a bulletin to the clock',
            ],
          },
        ],
      },
      {
        id: 'peliputan-berita',
        judul: 'Reporting',
        materi: [
          {
            id: 'menemukan-berita',
            judul: 'Finding the Story',
            durasi: '12:47',
            mentor: 'RRI Trainer',
            deskripsi:
              'Where radio stories come from and how to judge them.',
            hasil: [
              'Spot a radio story',
              'Judge newsworthiness',
              'Plan coverage before going out',
            ],
          },
          {
            id: 'wawancara-berita',
            judul: 'Interviewing for News',
            durasi: '14:22',
            mentor: 'RRI Trainer',
            deskripsi:
              'Questions that get answers, and listening that finds the quote.',
            hasil: [
              'Prepare interview questions',
              'Listen for the key quote',
              'Keep an interview on track',
            ],
          },
          {
            id: 'reportase-lapangan',
            judul: 'Reporting from the Field',
            durasi: '10:38',
            mentor: 'RRI Trainer',
            deskripsi:
              'Gathering sound, facts, and colour on location.',
            hasil: [
              'Record clean field audio',
              'Gather facts on location',
              'File a field report on deadline',
            ],
          },
        ],
      },
      {
        id: 'etika-jurnalistik',
        judul: 'Journalism Ethics',
        materi: [
          {
            id: 'akurasi-verifikasi',
            judul: 'Accuracy and Verification',
            durasi: '11:56',
            mentor: 'RRI Trainer',
            deskripsi:
              'Checking facts before they go on air.',
            hasil: [
              'Verify a fact before air',
              'Handle unconfirmed reports',
              'Correct errors on air',
            ],
          },
          {
            id: 'adil-berimbang',
            judul: 'Fairness and Balance',
            durasi: '09:29',
            mentor: 'RRI Trainer',
            deskripsi:
              'Giving every side a fair hearing.',
            hasil: [
              'Present all sides fairly',
              'Avoid loaded language',
              'Handle complaints about coverage',
            ],
          },
          {
            id: 'kode-etik-jurnalis',
            judul: 'The Journalist’s Code of Ethics',
            durasi: '12:11',
            mentor: 'RRI Trainer',
            deskripsi:
              'The code that guides every editorial decision.',
            hasil: [
              'Explain the code of ethics',
              'Apply the code to real cases',
              'Defend an editorial decision',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'announcing',
    judul: 'Announcing / Presenting',
    bidang: 'Announcing',
    deskripsi:
      'Voice, presence, and live delivery: the craft of the radio announcer.',
    rating: 4.7,
    peserta: 5100,
    topik: [
      {
        id: 'teknik-suara',
        judul: 'Voice Techniques',
        materi: [
          {
            id: 'pernapasan-diksi',
            judul: 'Breathing and Diction',
            durasi: '10:12',
            mentor: 'RRI Trainer',
            deskripsi:
              'Breath control and clear diction for long hours on air.',
            hasil: [
              'Control breathing on air',
              'Improve diction and clarity',
              'Warm up the voice before a show',
            ],
          },
          {
            id: 'suara-on-air',
            judul: 'Finding Your On-Air Voice',
            durasi: '12:45',
            mentor: 'RRI Trainer',
            deskripsi:
              'Tone, pace, and personality in your delivery.',
            hasil: [
              'Find a natural on-air tone',
              'Control pace and pauses',
              'Sound confident on the microphone',
            ],
          },
          {
            id: 'membaca-nyaring',
            judul: 'Reading Aloud with Confidence',
            durasi: '09:58',
            mentor: 'RRI Trainer',
            deskripsi:
              'Sight-reading scripts smoothly, without stumbling.',
            hasil: [
              'Sight-read a script smoothly',
              'Recover from a stumble',
              'Mark a script for reading',
            ],
          },
        ],
      },
      {
        id: 'presenting',
        judul: 'Presenting',
        materi: [
          {
            id: 'membawakan-musik',
            judul: 'Hosting a Music Programme',
            durasi: '13:27',
            mentor: 'RRI Trainer',
            deskripsi:
              'Linking songs, talking to listeners, and keeping the flow.',
            hasil: [
              'Link songs with natural talk',
              'Address listeners directly',
              'Keep a show flowing',
            ],
          },
          {
            id: 'talkshow-dialog',
            judul: 'Talk Shows and Dialogue',
            durasi: '14:51',
            mentor: 'RRI Trainer',
            deskripsi:
              'Guiding a conversation on air with guests and callers.',
            hasil: [
              'Guide a live conversation',
              'Handle guests on air',
              'Take caller questions smoothly',
            ],
          },
          {
            id: 'membawakan-berita',
            judul: 'Presenting the News',
            durasi: '11:36',
            mentor: 'RRI Trainer',
            deskripsi:
              'Authority and clarity when reading the news.',
            hasil: [
              'Read news with authority',
              'Pace a bulletin correctly',
              'Handle breaking news calmly',
            ],
          },
        ],
      },
      {
        id: 'wawancara',
        judul: 'Interviewing',
        materi: [
          {
            id: 'persiapan-wawancara',
            judul: 'Preparing an Interview',
            durasi: '10:44',
            mentor: 'RRI Trainer',
            deskripsi:
              'Research, questions, and the arc of a good interview.',
            hasil: [
              'Research a guest',
              'Plan an interview arc',
              'Write questions that open up',
            ],
          },
          {
            id: 'wawancara-live',
            judul: 'Live Interviews',
            durasi: '13:19',
            mentor: 'RRI Trainer',
            deskripsi:
              'Keeping a live interview moving, even when it stalls.',
            hasil: [
              'Keep a live interview moving',
              'Follow up on surprising answers',
              'Close an interview cleanly',
            ],
          },
          {
            id: 'wawancara-lokasi',
            judul: 'Interviewing on Location',
            durasi: '12:03',
            mentor: 'RRI Trainer',
            deskripsi:
              'Interviews outside the studio: sound, setting, and spontaneity.',
            hasil: [
              'Set up a location interview',
              'Record clean location sound',
              'Use the setting in the story',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'produksi-program',
    judul: 'Produksi Program Radio',
    bidang: 'Radio Production',
    deskripsi:
      'From idea to air: planning, producing, and editing radio programmes.',
    rating: 4.6,
    peserta: 3900,
    topik: [
      {
        id: 'perencanaan-program',
        judul: 'Programme Planning',
        materi: [
          {
            id: 'ide-ke-format',
            judul: 'From Idea to Format',
            durasi: '11:48',
            mentor: 'RRI Trainer',
            deskripsi:
              'Turning an idea into a programme format with an audience in mind.',
            hasil: [
              'Turn an idea into a format',
              'Define a target audience',
              'Pitch a programme idea',
            ],
          },
          {
            id: 'menulis-rundown',
            judul: 'Writing a Rundown',
            durasi: '09:37',
            mentor: 'RRI Trainer',
            deskripsi:
              'The rundown: the minute-by-minute plan of a programme.',
            hasil: [
              'Write a rundown',
              'Time each segment',
              'Adjust a rundown live',
            ],
          },
          {
            id: 'merencanakan-serial',
            judul: 'Planning a Series',
            durasi: '12:29',
            mentor: 'RRI Trainer',
            deskripsi:
              'Arcs, episodes, and consistency across a series.',
            hasil: [
              'Plan a series arc',
              'Keep episodes consistent',
              'Schedule a series run',
            ],
          },
        ],
      },
      {
        id: 'produksi',
        judul: 'Production',
        materi: [
          {
            id: 'produksi-talkshow',
            judul: 'Producing a Talk Programme',
            durasi: '14:16',
            mentor: 'RRI Trainer',
            deskripsi:
              'Guests, callers, music, and timing in a live talk show.',
            hasil: [
              'Produce a live talk show',
              'Coordinate guests and callers',
              'Keep a live show on time',
            ],
          },
          {
            id: 'produksi-feature',
            judul: 'Producing a Feature',
            durasi: '13:52',
            mentor: 'RRI Trainer',
            deskripsi:
              'Sound-rich features: scripting, recording, and layering.',
            hasil: [
              'Script a feature',
              'Record and layer sound',
              'Mix narration and actuality',
            ],
          },
          {
            id: 'siaran-luar',
            judul: 'Outside Broadcasts',
            durasi: '12:41',
            mentor: 'RRI Trainer',
            deskripsi:
              'Taking the station to an event: planning and logistics.',
            hasil: [
              'Plan an outside broadcast',
              'Coordinate a remote team',
              'Handle technical surprises live',
            ],
          },
        ],
      },
      {
        id: 'editing-audio',
        judul: 'Audio Editing',
        materi: [
          {
            id: 'dasar-editing',
            judul: 'Editing Basics',
            durasi: '10:26',
            mentor: 'RRI Trainer',
            deskripsi:
              'Cutting, fading, and cleaning audio for broadcast.',
            hasil: [
              'Cut and fade audio',
              'Clean up recordings',
              'Export broadcast-ready audio',
            ],
          },
          {
            id: 'mixing-musik-suara',
            judul: 'Mixing Music and Voice',
            durasi: '11:54',
            mentor: 'RRI Trainer',
            deskripsi:
              'Levels, balance, and the mix that sounds right on air.',
            hasil: [
              'Balance voice and music',
              'Set levels for broadcast',
              'Use fades and ducking',
            ],
          },
          {
            id: 'desain-suara',
            judul: 'Sound Design for Radio',
            durasi: '13:08',
            mentor: 'RRI Trainer',
            deskripsi:
              'Effects, beds, and sound pictures that serve the story.',
            hasil: [
              'Choose sound effects',
              'Build a sound bed',
              'Use sound to tell the story',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'penulisan-naskah',
    judul: 'Penulisan Naskah Siaran',
    bidang: 'Broadcast Writing',
    deskripsi:
      'Scripts that sound right: news, features, and advertising copy for radio.',
    rating: 4.8,
    peserta: 4600,
    topik: [
      {
        id: 'naskah-berita',
        judul: 'News Scripts',
        materi: [
          {
            id: 'naskah-berita-radio',
            judul: 'The Radio News Script',
            durasi: '10:59',
            mentor: 'RRI Trainer',
            deskripsi:
              'Structure, length, and language of a news script.',
            hasil: [
              'Structure a news script',
              'Write for a 60-second slot',
              'Check a script for air',
            ],
          },
          {
            id: 'intro-outro',
            judul: 'Writing Intros and Outros',
            durasi: '09:22',
            mentor: 'RRI Trainer',
            deskripsi:
              'Intros that hook and outros that land.',
            hasil: [
              'Write a strong intro',
              'Close a story cleanly',
              'Match intro and story tone',
            ],
          },
          {
            id: 'naskah-buletin',
            judul: 'Scripts for Bulletins',
            durasi: '12:14',
            mentor: 'RRI Trainer',
            deskripsi:
              'A full bulletin script, from first story to sign-off.',
            hasil: [
              'Assemble a bulletin script',
              'Order stories by weight',
              'Time the full bulletin',
            ],
          },
        ],
      },
      {
        id: 'naskah-feature',
        judul: 'Feature Scripts',
        materi: [
          {
            id: 'menulis-feature',
            judul: 'Writing a Feature Script',
            durasi: '13:33',
            mentor: 'RRI Trainer',
            deskripsi:
              'Narrative, scenes, and sound in a feature script.',
            hasil: [
              'Write a feature narrative',
              'Script scenes and sound',
              'Keep a feature moving',
            ],
          },
          {
            id: 'drama-bercerita',
            judul: 'Drama and Storytelling',
            durasi: '14:07',
            mentor: 'RRI Trainer',
            deskripsi:
              'Dialogue and pacing in radio drama.',
            hasil: [
              'Write radio dialogue',
              'Pace a drama scene',
              'Direct actors from a script',
            ],
          },
          {
            id: 'naskah-dokumenter',
            judul: 'Documentary Scripts',
            durasi: '12:58',
            mentor: 'RRI Trainer',
            deskripsi:
              'Research, structure, and voice in a radio documentary.',
            hasil: [
              'Structure a documentary',
              'Weave interviews and narration',
              'Write a documentary voice-over',
            ],
          },
        ],
      },
      {
        id: 'naskah-iklan',
        judul: 'Advertising Scripts',
        materi: [
          {
            id: 'menulis-spot',
            judul: 'Writing a Radio Spot',
            durasi: '10:41',
            mentor: 'RRI Trainer',
            deskripsi:
              'Thirty seconds that sell: the radio spot.',
            hasil: [
              'Write a 30-second spot',
              'Put the message first',
              'Time a spot to the second',
            ],
          },
          {
            id: 'adlibs',
            judul: 'Adlibs That Work',
            durasi: '09:49',
            mentor: 'RRI Trainer',
            deskripsi:
              'Live reads that sound natural, not scripted.',
            hasil: [
              'Write a natural live read',
              'Keep an adlib on message',
              'Deliver an adlib confidently',
            ],
          },
          {
            id: 'jingle-logo-suara',
            judul: 'Jingles and Sound Logos',
            durasi: '11:17',
            mentor: 'RRI Trainer',
            deskripsi:
              'Short, memorable sound that carries a brand.',
            hasil: [
              'Brief a jingle',
              'Judge a sound logo',
              'Place sound branding in a break',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'reportase',
    judul: 'Reportase & Liputan',
    bidang: 'Reporting',
    deskripsi:
      'Out in the field: gathering stories, reporting live, and mobile journalism.',
    rating: 4.7,
    peserta: 3800,
    topik: [
      {
        id: 'reportase-lapangan',
        judul: 'Field Reporting',
        materi: [
          {
            id: 'persiapan-lapangan',
            judul: 'Preparing for the Field',
            durasi: '10:33',
            mentor: 'RRI Trainer',
            deskripsi:
              'Kit, contacts, and a plan before you leave the station.',
            hasil: [
              'Pack a field kit',
              'Line up contacts',
              'Plan a field day',
            ],
          },
          {
            id: 'suara-lokasi',
            judul: 'Gathering Sound on Location',
            durasi: '12:26',
            mentor: 'RRI Trainer',
            deskripsi:
              'Interviews, ambience, and actuality in the field.',
            hasil: [
              'Record clean interviews',
              'Capture ambience',
              'Log sound in the field',
            ],
          },
          {
            id: 'menulis-laporan-lapangan',
            judul: 'Writing the Field Report',
            durasi: '11:02',
            mentor: 'RRI Trainer',
            deskripsi:
              'Turning field notes into a broadcast report.',
            hasil: [
              'Turn notes into a report',
              'Write to your recorded sound',
              'File under deadline pressure',
            ],
          },
        ],
      },
      {
        id: 'reportase-live',
        judul: 'Live Reporting',
        materi: [
          {
            id: 'laporan-live',
            judul: 'The Live Report',
            durasi: '09:44',
            mentor: 'RRI Trainer',
            deskripsi:
              'Reporting live: structure, calm, and clarity under pressure.',
            hasil: [
              'Structure a live report',
              'Stay calm on a live hit',
              'Handle a breaking update',
            ],
          },
          {
            id: 'live-dari-acara',
            judul: 'Live from an Event',
            durasi: '13:15',
            mentor: 'RRI Trainer',
            deskripsi:
              'Covering events live: what to say when things change.',
            hasil: [
              'Cover an event live',
              'Adapt when plans change',
              'Hand back to the studio cleanly',
            ],
          },
          {
            id: 'two-way-qa',
            judul: 'Two-Ways and Q&A',
            durasi: '10:57',
            mentor: 'RRI Trainer',
            deskripsi:
              'Answering the studio’s questions live from the scene.',
            hasil: [
              'Answer live questions',
              'Keep answers tight',
              'Bridge back to the studio',
            ],
          },
        ],
      },
      {
        id: 'jurnalisme-mobile',
        judul: 'Mobile Journalism',
        materi: [
          {
            id: 'reportase-telepon',
            judul: 'Reporting with a Phone',
            durasi: '11:29',
            mentor: 'RRI Trainer',
            deskripsi:
              'The phone as a studio: recording, editing, and filing.',
            hasil: [
              'Record with a phone',
              'Edit audio on a phone',
              'File from the field',
            ],
          },
          {
            id: 'video-untuk-radio',
            judul: 'Shooting Video for Radio',
            durasi: '12:48',
            mentor: 'RRI Trainer',
            deskripsi:
              'Short video that supports a radio story online.',
            hasil: [
              'Shoot a short video',
              'Frame for social media',
              'Pair video with audio',
            ],
          },
          {
            id: 'dasar-live-streaming',
            judul: 'Live Streaming Basics',
            durasi: '10:19',
            mentor: 'RRI Trainer',
            deskripsi:
              'Going live from the field on digital platforms.',
            hasil: [
              'Set up a live stream',
              'Present to a live audience',
              'Handle stream problems',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'etika-hukum',
    judul: 'Etika dan Hukum Pers / Penyiaran',
    bidang: 'Media Ethics & Law',
    deskripsi:
      'The rules of the craft: ethics, press law, and broadcasting law.',
    rating: 4.5,
    peserta: 2900,
    topik: [
      {
        id: 'kode-etik-jurnalistik',
        judul: 'Journalism Code of Ethics',
        materi: [
          {
            id: 'kode-etik',
            judul: 'The Code of Ethics',
            durasi: '11:41',
            mentor: 'RRI Trainer',
            deskripsi:
              'The principles every journalist agrees to follow.',
            hasil: [
              'Explain the code of ethics',
              'Apply the code to daily work',
              'Recognise an ethical dilemma',
            ],
          },
          {
            id: 'akurasi-adil-berimbang',
            judul: 'Accuracy, Fairness, and Balance',
            durasi: '12:36',
            mentor: 'RRI Trainer',
            deskripsi:
              'The three tests every story must pass.',
            hasil: [
              'Test a story for accuracy',
              'Check fairness and balance',
              'Correct mistakes openly',
            ],
          },
          {
            id: 'privasi-kepentingan-publik',
            judul: 'Privacy and Public Interest',
            durasi: '10:28',
            mentor: 'RRI Trainer',
            deskripsi:
              'When privacy gives way to the public’s right to know.',
            hasil: [
              'Balance privacy and public interest',
              'Handle sensitive sources',
              'Decide what to publish',
            ],
          },
        ],
      },
      {
        id: 'hukum-pers',
        judul: 'Press Law',
        materi: [
          {
            id: 'dasar-hukum-pers',
            judul: 'Press Law Basics',
            durasi: '13:22',
            mentor: 'RRI Trainer',
            deskripsi:
              'The press law and what it protects.',
            hasil: [
              'Explain press law basics',
              'Use the right of reply',
              'Avoid defamation',
            ],
          },
          {
            id: 'pencemaran-hak-jawab',
            judul: 'Defamation and the Right of Reply',
            durasi: '12:09',
            mentor: 'RRI Trainer',
            deskripsi:
              'What counts as defamation and how the right of reply works.',
            hasil: [
              'Spot defamation risks',
              'Offer a right of reply',
              'Document a disputed story',
            ],
          },
          {
            id: 'perlindungan-narasumber',
            judul: 'Source Protection',
            durasi: '11:47',
            mentor: 'RRI Trainer',
            deskripsi:
              'Protecting sources and confidential information.',
            hasil: [
              'Protect a confidential source',
              'Handle leaked material',
              'Resist pressure to reveal sources',
            ],
          },
        ],
      },
      {
        id: 'hukum-penyiaran',
        judul: 'Broadcasting Law',
        materi: [
          {
            id: 'regulasi-penyiaran-hukum',
            judul: 'Broadcasting Regulation',
            durasi: '12:54',
            mentor: 'RRI Trainer',
            deskripsi:
              'The laws and regulators behind the airwaves.',
            hasil: [
              'Name the broadcasting regulators',
              'Explain licensing rules',
              'Follow content regulations',
            ],
          },
          {
            id: 'aturan-konten-sanksi',
            judul: 'Content Rules and Sanctions',
            durasi: '10:16',
            mentor: 'RRI Trainer',
            deskripsi:
              'What the rules require, and what happens when they are broken.',
            hasil: [
              'Apply content rules',
              'Understand sanctions',
              'Respond to a regulator’s notice',
            ],
          },
          {
            id: 'pemilu-masa-sensitif',
            judul: 'Elections and Sensitive Periods',
            durasi: '13:31',
            mentor: 'RRI Trainer',
            deskripsi:
              'Fair coverage during elections and sensitive moments.',
            hasil: [
              'Cover elections fairly',
              'Apply blackout rules',
              'Handle political advertising',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'manajemen-media',
    judul: 'Manajemen Media & Lembaga Penyiaran',
    bidang: 'Media Management',
    deskripsi:
      'Running a station: organisation, media business, and public finance.',
    rating: 4.6,
    peserta: 2400,
    topik: [
      {
        id: 'manajemen-stasiun',
        judul: 'Station Management',
        materi: [
          {
            id: 'menjalankan-stasiun',
            judul: 'Running a Radio Station',
            durasi: '12:18',
            mentor: 'RRI Trainer',
            deskripsi:
              'Organisation, people, and the daily operation of a station.',
            hasil: [
              'Describe a station’s structure',
              'Plan daily operations',
              'Coordinate teams across units',
            ],
          },
          {
            id: 'memimpin-tim-siaran',
            judul: 'Leading a Broadcast Team',
            durasi: '11:05',
            mentor: 'RRI Trainer',
            deskripsi:
              'Managing presenters, producers, and journalists.',
            hasil: [
              'Lead a broadcast team',
              'Give useful feedback',
              'Handle on-air mistakes',
            ],
          },
          {
            id: 'evaluasi-programa',
            judul: 'Programme Evaluation',
            durasi: '10:52',
            mentor: 'RRI Trainer',
            deskripsi:
              'Measuring what works and improving the schedule.',
            hasil: [
              'Evaluate a programme',
              'Read audience feedback',
              'Improve a weak slot',
            ],
          },
        ],
      },
      {
        id: 'pemasaran-media',
        judul: 'Media Marketing',
        materi: [
          {
            id: 'memasarkan-stasiun',
            judul: 'Marketing a Radio Station',
            durasi: '13:44',
            mentor: 'RRI Trainer',
            deskripsi:
              'Audiences, advertisers, and the station’s brand.',
            hasil: [
              'Define a station brand',
              'Plan a marketing campaign',
              'Measure campaign results',
            ],
          },
          {
            id: 'menjual-waktu-siar',
            judul: 'Selling Airtime',
            durasi: '12:31',
            mentor: 'RRI Trainer',
            deskripsi:
              'Spots, adlibs, and sponsorships: the commercial side of radio.',
            hasil: [
              'Explain airtime products',
              'Price a campaign',
              'Keep editorial and commercial separate',
            ],
          },
          {
            id: 'kemitraan-kerja-sama',
            judul: 'Partnerships and Cooperation',
            durasi: '11:23',
            mentor: 'RRI Trainer',
            deskripsi:
              'Working with partners, clients, and communities.',
            hasil: [
              'Build a partnership',
              'Manage a cooperation agreement',
              'Serve a community partner',
            ],
          },
        ],
      },
      {
        id: 'keuangan-publik',
        judul: 'Public Finance (PNBP)',
        materi: [
          {
            id: 'dasar-keuangan-publik',
            judul: 'Public Finance Basics',
            durasi: '12:07',
            mentor: 'RRI Trainer',
            deskripsi:
              'How a public broadcaster’s non-tax revenue works.',
            hasil: [
              'Explain non-tax revenue',
              'Name the main revenue types',
              'Follow the finance rules',
            ],
          },
          {
            id: 'perjanjian-kerja-sama',
            judul: 'Cooperation Agreements',
            durasi: '13:26',
            mentor: 'RRI Trainer',
            deskripsi:
              'Contracts, invoices, and receivables in media cooperation.',
            hasil: [
              'Read a cooperation contract',
              'Track invoices and payments',
              'Handle overdue receivables',
            ],
          },
          {
            id: 'pelaporan-akuntabilitas',
            judul: 'Reporting and Accountability',
            durasi: '11:58',
            mentor: 'RRI Trainer',
            deskripsi:
              'Monthly reports, audits, and public accountability.',
            hasil: [
              'Prepare a monthly report',
              'Reconcile revenue figures',
              'Answer an audit query',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teknologi-penyiaran',
    judul: 'Teknologi Penyiaran',
    bidang: 'Broadcast Technology',
    deskripsi:
      'The tools of the trade: studios, audio, and digital broadcasting.',
    rating: 4.7,
    peserta: 3100,
    topik: [
      {
        id: 'studio',
        judul: 'Studio',
        materi: [
          {
            id: 'di-dalam-studio',
            judul: 'Inside the Studio',
            durasi: '10:45',
            mentor: 'RRI Trainer',
            deskripsi:
              'Consoles, microphones, and the studio signal chain.',
            hasil: [
              'Name studio equipment',
              'Follow the signal chain',
              'Set up a studio session',
            ],
          },
          {
            id: 'mikrofon-akustik',
            judul: 'Microphones and Acoustics',
            durasi: '12:33',
            mentor: 'RRI Trainer',
            deskripsi:
              'Choosing microphones and treating a room for radio.',
            hasil: [
              'Choose the right microphone',
              'Improve room acoustics',
              'Avoid common mic mistakes',
            ],
          },
          {
            id: 'konsol-on-air',
            judul: 'The On-Air Console',
            durasi: '11:12',
            mentor: 'RRI Trainer',
            deskripsi:
              'Running the desk during a live programme.',
            hasil: [
              'Operate the console',
              'Ride levels live',
              'Recover from a technical fault',
            ],
          },
        ],
      },
      {
        id: 'audio',
        judul: 'Audio',
        materi: [
          {
            id: 'dasar-audio-digital',
            judul: 'Digital Audio Basics',
            durasi: '12:19',
            mentor: 'RRI Trainer',
            deskripsi:
              'Sampling, formats, and quality in digital audio.',
            hasil: [
              'Explain digital audio basics',
              'Choose the right format',
              'Keep quality through the chain',
            ],
          },
          {
            id: 'rekaman-editing',
            judul: 'Recording and Editing',
            durasi: '13:05',
            mentor: 'RRI Trainer',
            deskripsi:
              'Clean recordings and efficient editing workflows.',
            hasil: [
              'Record clean audio',
              'Edit efficiently',
              'Organise audio files',
            ],
          },
          {
            id: 'audio-untuk-streaming',
            judul: 'Audio for Streaming',
            durasi: '10:38',
            mentor: 'RRI Trainer',
            deskripsi:
              'Encoding and streaming audio online.',
            hasil: [
              'Encode audio for streaming',
              'Monitor stream quality',
              'Troubleshoot a stream',
            ],
          },
        ],
      },
      {
        id: 'digital',
        judul: 'Digital',
        materi: [
          {
            id: 'radio-di-platform-digital',
            judul: 'Radio on Digital Platforms',
            durasi: '11:54',
            mentor: 'RRI Trainer',
            deskripsi:
              'Streaming, podcasts, and social media for radio.',
            hasil: [
              'Publish a podcast',
              'Stream a programme',
              'Use social media for radio',
            ],
          },
          {
            id: 'produksi-podcast',
            judul: 'Podcast Production',
            durasi: '13:47',
            mentor: 'RRI Trainer',
            deskripsi:
              'Planning, recording, and publishing a podcast series.',
            hasil: [
              'Plan a podcast series',
              'Record and edit episodes',
              'Publish and promote a podcast',
            ],
          },
          {
            id: 'masa-depan-penyiaran',
            judul: 'The Future of Broadcasting',
            durasi: '12:26',
            mentor: 'RRI Trainer',
            deskripsi:
              'Where radio is heading, and how to stay ready.',
            hasil: [
              'Describe broadcast trends',
              'Prepare for new platforms',
              'Keep learning new tools',
            ],
          },
        ],
      },
    ],
  },
];
