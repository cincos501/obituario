import { Obituary } from '../types/memorial';

export const INITIAL_MEMORIALS: Obituary[] = [
  // 1. MEMORIAL PLAN HOMENAJE LEGADO ($49 USD) - El más popular
  {
    id: '1',
    slug: 'carlos-alberto-mendoza-1948',
    fullName: 'Dr. Carlos Alberto Mendoza Vega',
    nickname: 'Carlitos',
    birthDate: '1948-04-14',
    deathDate: '2026-03-18',
    birthPlace: 'Cochabamba, Bolivia',
    deathPlace: 'La Paz, Bolivia',
    epitaph: '«Tu vocación curó cuerpos, tu bondad abrigó almas. Tu luz vivirá siempre en cada vida que tocaste con amor.»',
    biography: `El Dr. Carlos Alberto Mendoza Vega dedicó más de cuatro décadas de su vida al servicio médico con profunda humanidad y devoción por los más necesitados. Hijo de maestros rurales, aprendió desde pequeño el valor del trabajo honrado, la empatía y la humildad.

Fundó el dispensario comunitario de su parroquia, donde atendió a miles de familias sin pedir nada a cambio. Fuera de su profesión médica, Carlos fue un apasionado lector de poesía clásica, amante de la música folclórica en charango y el guardián de las tradiciones familiares en cada reunión dominical.

Deja en sus hijos y nietos un legado imborrable de rectitud, ternura inagotable y un amor infinito por la vida y el prójimo.`,
    mainPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600',
    isPublic: true,
    candlesCount: 42,
    flowersCount: 28,
    planId: 'legado',
    moderationRequired: true,
    ownerEmail: 'legado@hobituario.com',
    ownerName: 'Mariana de Mendoza',
    fontFamily: 'serif-cormorant',
    themePreset: 'ivory-warm',
    primaryAccent: 'gold',
    services: [
      {
        id: 'srv-1',
        obituaryId: '1',
        serviceType: 'velatorio',
        title: 'Capilla Ardiente y Velatorio Familiar',
        locationName: 'Funeraria La Paz - Salón Los Olivos',
        address: 'Av. Arce esq. Cordero #2435, Zona San Jorge',
        date: '2026-03-27',
        time: '14:00 - 22:00',
        photoUrl: 'https://images.unsplash.com/photo-1548625361-165b6f7564d2?auto=format&fit=crop&q=80&w=600',
        googleMapsUrl: 'https://maps.google.com/?q=La+Paz+Bolivia',
        coordinatesLat: -16.5120,
        coordinatesLng: -68.1250,
        notes: 'Se celebrará una oración comunitaria a las 19:30. Se ruega vestimenta formal o tonos claros.'
      },
      {
        id: 'srv-2',
        obituaryId: '1',
        serviceType: 'misa_cuerpo_presente',
        title: 'Misa de Cuerpo Presente',
        locationName: 'Basílica de San Francisco',
        address: 'Plaza Mayor de San Francisco',
        date: '2026-03-28',
        time: '10:00',
        googleMapsUrl: 'https://maps.google.com/?q=Plaza+San+Francisco+La+Paz',
        coordinatesLat: -16.4960,
        coordinatesLng: -68.1370,
        livestreamUrl: 'https://youtube.com',
        notes: 'Habrá transmisión en vivo para los familiares que se encuentran en el exterior.'
      },
      {
        id: 'srv-3',
        obituaryId: '1',
        serviceType: 'sepelio',
        title: 'Traslado al Camposanto y Descanso Eterno',
        locationName: 'Cementerio Jardín - Pabellón Los Ángeles',
        address: 'Camino a Aranjuez Km 3.5, Zona Sur',
        date: '2026-03-28',
        time: '12:30',
        photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=600',
        googleMapsUrl: 'https://maps.google.com/?q=Cementerio+Jardin+La+Paz',
        coordinatesLat: -16.5350,
        coordinatesLng: -68.0890,
        notes: 'Cortejo fúnebre partirá de la Basílica a las 11:30.'
      }
    ],
    tributes: [
      {
        id: 'trib-1',
        obituaryId: '1',
        authorName: 'Dra. Elena Villarroel',
        relationship: 'Colega y Amiga',
        message: 'Gracias por enseñarme tanto, querido doctor. Su paciencia con cada paciente y su sonrisa afable en los turnos más difíciles quedarán grabadas en mi corazón por siempre.',
        tributeType: 'candle',
        candleColor: 'warm-gold',
        photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
        createdAt: '2026-03-24T10:15:00Z',
        isApproved: true,
        moderationStatus: 'approved'
      },
      {
        id: 'trib-2',
        obituaryId: '1',
        authorName: 'Familia Quispe Morales',
        relationship: 'Pacientes de la comunidad',
        message: 'Nunca olvidaremos que cuando nuestra madre enfermó, usted vino a verla sin cobrar un solo centavo. Dios lo tenga en su santa gloria.',
        tributeType: 'flower',
        flowerType: 'azucena',
        createdAt: '2026-03-25T14:40:00Z',
        isApproved: true,
        moderationStatus: 'approved'
      },
      {
        id: 'trib-3',
        obituaryId: '1',
        authorName: 'Martín y Sofía Mendoza',
        relationship: 'Nietos',
        message: 'Abuelito, gracias por los cuentos que nos inventabas y por enseñarnos a mirar las estrellas sin miedo. Te amaremos por siempre.',
        tributeType: 'candle',
        candleColor: 'soft-white',
        photoUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&q=80&w=500',
        createdAt: '2026-03-26T08:20:00Z',
        isApproved: true,
        moderationStatus: 'approved'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        obituaryId: '1',
        year: '1948',
        title: 'Nacimiento en Cochabamba',
        description: 'Nació en el seno de una familia de educadores con profunda vocación de servicio.',
        photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'tl-2',
        obituaryId: '1',
        year: '1974',
        title: 'Graduación con Honores de Medicina',
        description: 'Obtuvo su título de Médico Cirujano en la Universidad Mayor de San Andrés, iniciando su carrera en centros rurales.',
        photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'tl-3',
        obituaryId: '1',
        year: '1978',
        title: 'Matrimonio con Mariana Rocabado',
        description: 'Unión matrimonial con quien compartió 48 años de complicidad, respeto y tres hijos amados.',
        photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'tl-4',
        obituaryId: '1',
        year: '1995',
        title: 'Fundación del Dispensario Parroquial',
        description: 'Abrió voluntariamente un consultorio solidario que atendió a más de 12.000 pacientes vulnerables.'
      },
      {
        id: 'tl-5',
        obituaryId: '1',
        year: '2020',
        title: 'Homenaje a Toda una Vida de Vocación',
        description: 'Reconocido por el Colegio Médico por su intachable trayectoria ética y altruismo incondicional.'
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        obituaryId: '1',
        mediaUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800',
        caption: 'En su consultorio de siempre, siempre con una palabra de aliento.',
        authorName: 'Familia Mendoza',
        createdAt: '2026-03-24'
      }
    ]
  },

  // 2. MEMORIAL PLAN ESENCIAL ($19 USD) - Solo texto en hitos/velas, 3 ceremonias
  {
    id: '2',
    slug: 'antonio-roca-1955',
    fullName: 'Don Antonio Roca Suárez',
    nickname: 'Toño',
    birthDate: '1955-09-12',
    deathDate: '2026-02-10',
    birthPlace: 'Santa Cruz de la Sierra, Bolivia',
    deathPlace: 'Santa Cruz, Bolivia',
    epitaph: '«Tu sonrisa sincera, tu pasión por el campo y tu nobleza campesina serán nuestro refugio eterno.»',
    biography: `Don Antonio Roca Suárez fue un hombre trabajador de noble corazón, dedicado a la agricultura y a brindar siempre una mano amiga a sus vecinos y familiares. 

Padre ejemplar de cuatro hijos, enseñó que la honradez y la perseverancia son los bienes más preciados que una persona puede heredar. Amante de las guitarreadas familiares y las tardes bajo el tajibo en flor.`,
    mainPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1600',
    isPublic: true,
    candlesCount: 19,
    flowersCount: 12,
    planId: 'esencial',
    moderationRequired: true,
    ownerEmail: 'esencial@hobituario.com',
    ownerName: 'Familia Roca Suárez',
    fontFamily: 'serif-cinzel',
    themePreset: 'ivory-warm',
    primaryAccent: 'gold',
    services: [
      {
        id: 'srv-es-1',
        obituaryId: '2',
        serviceType: 'velatorio',
        title: 'Velatorio Comunitario',
        locationName: 'Salón Velatorio Las Misiones',
        address: '2do Anillo y Av. Bush, Santa Cruz',
        date: '2026-02-11',
        time: '16:00',
        coordinatesLat: -17.7833,
        coordinatesLng: -63.1821,
        notes: 'Recepción de amigos y allegados.'
      },
      {
        id: 'srv-es-2',
        obituaryId: '2',
        serviceType: 'sepelio',
        title: 'Entierro en el Parque Cementerio',
        locationName: 'Cementerio El Ceibo',
        address: 'Carretera al Norte Km 9',
        date: '2026-02-12',
        time: '11:00',
        coordinatesLat: -17.7200,
        coordinatesLng: -63.1600,
      }
    ],
    tributes: [
      {
        id: 'trib-es-1',
        obituaryId: '2',
        authorName: 'Carlos Roca (Hijo)',
        relationship: 'Hijo',
        message: 'Descansa en paz, papá querido. Gracias por todo tu esfuerzo por nosotros.',
        tributeType: 'candle',
        candleColor: 'warm-gold',
        createdAt: '2026-02-11T12:00:00Z',
        isApproved: true,
        moderationStatus: 'approved'
      }
    ],
    timeline: [
      {
        id: 'tl-es-1',
        obituaryId: '2',
        year: '1955',
        title: 'Nacimiento en Santa Cruz',
        description: 'Creció en una familia de agricultores honrados.'
      },
      {
        id: 'tl-es-2',
        obituaryId: '2',
        year: '1980',
        title: 'Matrimonio y primera cosecha',
        description: 'Fundó su hogar con Doña Carmen y comenzó su propio emprendimiento agrícola.'
      }
    ],
    gallery: []
  },

  // 3. MEMORIAL PLAN LEGADO INFINITO ($99 USD) - Todo multimedia, videos, streaming
  {
    id: '3',
    slug: 'beatriz-valdivia-1942',
    fullName: 'Dra. Beatriz Valdivia de Morales',
    nickname: 'Dra. Betty',
    birthDate: '1942-06-25',
    deathDate: '2026-01-15',
    birthPlace: 'Sucre, Bolivia',
    deathPlace: 'La Paz, Bolivia',
    epitaph: '«Tu sabiduría iluminó aulas, tu generosidad sembró futuros. Vivirás por siempre en la memoria de tus discípulos y familia.»',
    biography: `Pionera en la educación superior y catedrática universitaria emérita, la Dra. Beatriz Valdivia formó a generaciones de profesionales con excelencia, ternura y rectitud ética. 

Doctora en Letras y Filosofía, dedicó su existencia a la investigación humanística y al impulso de becas para estudiantes de provincias. Su legado intelectual perdurará como un faro para las generaciones venideras.`,
    mainPhotoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=800',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1600',
    isPublic: true,
    candlesCount: 68,
    flowersCount: 45,
    planId: 'infinito',
    moderationRequired: true,
    ownerEmail: 'infinito@hobituario.com',
    ownerName: 'Familia Valdivia Morales',
    fontFamily: 'serif-playfair',
    themePreset: 'ivory-warm',
    primaryAccent: 'gold',
    services: [
      {
        id: 'srv-inf-1',
        obituaryId: '3',
        serviceType: 'velatorio',
        title: 'Homenaje Póstumo y Capilla Ardiente',
        locationName: 'Paraninfo Universitario UMSA',
        address: 'Av. Villazón #1995, La Paz',
        date: '2026-01-16',
        time: '09:00 - 18:00',
        photoUrl: 'https://images.unsplash.com/photo-1548625361-165b6f7564d2?auto=format&fit=crop&q=80&w=600',
        coordinatesLat: -16.5040,
        coordinatesLng: -68.1300,
        livestreamUrl: 'https://youtube.com',
        notes: 'Guardia de honor del claustro docente.'
      },
      {
        id: 'srv-inf-2',
        obituaryId: '3',
        serviceType: 'sepelio',
        title: 'Ceremonia de Sepelio y Descanso Eterno',
        locationName: 'Mausoleo de Personalidades Ilustres',
        address: 'Cementerio General de La Paz',
        date: '2026-01-17',
        time: '11:00',
        photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=600',
        coordinatesLat: -16.4940,
        coordinatesLng: -68.1480,
      }
    ],
    tributes: [
      {
        id: 'trib-inf-1',
        obituaryId: '3',
        authorName: 'Lic. Gonzalo Arze',
        relationship: 'Exalumno y Decano',
        message: 'Maestra de vida, sus lecciones de ética nos acompañarán por siempre en el ejercicio profesional.',
        tributeType: 'candle',
        candleColor: 'warm-gold',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500',
        createdAt: '2026-01-16T10:00:00Z',
        isApproved: true,
        moderationStatus: 'approved'
      }
    ],
    timeline: [
      {
        id: 'tl-inf-1',
        obituaryId: '3',
        year: '1942',
        title: 'Nacimiento en la Ciudad Blanca de Sucre',
        description: 'Hija de letrados e historiadores chuquisaqueños.',
        photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'tl-inf-2',
        obituaryId: '3',
        year: '1968',
        title: 'Doctorado Cum Laude en Filosofía',
        description: 'Primera mujer de su departamento en obtener el máximo grado académico internacional.',
        photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'tl-inf-3',
        obituaryId: '3',
        year: '1985',
        title: 'Creación del Fondo de Becas para Jóvenes de Provincias',
        description: 'Permitió el egreso de más de 400 profesionales de áreas rurales.',
        photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600'
      }
    ],
    gallery: [
      {
        id: 'gal-inf-1',
        obituaryId: '3',
        mediaUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800',
        caption: 'En la biblioteca universitaria que hoy lleva su nombre con honor.',
        authorName: 'Comunidad Universitaria',
        createdAt: '2026-01-16'
      }
    ]
  }
];
