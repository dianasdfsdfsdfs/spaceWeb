// All distances/sizes are real values shown in the info panel.
// `visualRadius` is a compressed size used only for the 3D carousel so every
// body fits nicely on screen while still hinting at relative scale.

export const BODIES = [
  {
    id: 'sun',
    name: 'The Sun',
    subtitle: 'G-type main-sequence star',
    isStar: true,
    texture: '/textures/4k_sun.jpg',
    color: '#ffae42',
    visualRadius: 2.4,
    rotationSpeed: 0.06,
    axialTilt: 0.126,
    facts: {
      Type: 'Yellow dwarf star (G2V)',
      Diameter: '1,392,700 km (109 × Earth)',
      Mass: '99.86% of the entire Solar System',
      'Surface temp.': '~5,500 °C (15 million °C at the core)',
      'Distance from Earth': '149.6 million km (1 AU)',
      'Light travel time': '8 minutes 20 seconds to reach Earth',
      'Rotation': '~25 days at the equator',
      Composition: '~73% hydrogen, ~25% helium',
    },
    funFacts: [
      'The Sun makes up about 99.86% of all the mass in the Solar System.',
      'Every second it converts ~600 million tons of hydrogen into helium.',
      'A piece of the Sun’s core the size of a pinhead would emit enough heat to kill a person from 150 km away.',
      'The Sun is roughly halfway through its life and will shine for about 5 billion more years.',
    ],
    mythology:
      'Worshipped across nearly every ancient culture: Ra in Egypt, Helios and Sol in Greece and Rome, Surya in India, and Amaterasu in Japan. Solstices and countless temples were aligned to its path.',
    mystery:
      'The Sun’s corona is mysteriously ~200 times hotter than its surface — a puzzle physicists are still solving. Fringe theories even imagine the Sun as hollow or electrically powered, but the evidence is overwhelmingly nuclear fusion.',
    life: 'No life possible on the Sun itself, yet it is the single source of energy that makes life on Earth possible.',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    subtitle: 'The Swift Planet',
    texture: '/textures/4k_mercury.jpg',
    color: '#b1adab',
    visualRadius: 0.5,
    rotationSpeed: 0.04,
    axialTilt: 0.0006,
    facts: {
      Type: 'Terrestrial planet',
      Diameter: '4,879 km (0.38 × Earth)',
      'Distance from Sun': '57.9 million km (0.39 AU)',
      'Distance from Earth': '77–222 million km (varies)',
      'Travel time from Earth': '~3.5 months by fast probe (MESSENGER took 6.5 years via flybys)',
      'Day length': '176 Earth days (one solar day)',
      'Year length': '88 Earth days',
      Moons: 'None',
      'Surface temp.': '−180 °C to +430 °C',
    },
    funFacts: [
      'A year on Mercury (88 days) is shorter than two of its own days.',
      'Despite being closest to the Sun, it is NOT the hottest planet — Venus is.',
      'It has a comet-like tail of sodium atoms streaming away from the Sun.',
      'Its huge iron core makes up about 85% of its radius.',
    ],
    mythology:
      'Named after the Roman messenger god Mercury (Greek Hermes) for the swift way it darts around the Sun — the fastest-moving planet in our sky.',
    mystery:
      'Mercury’s core seems far too large and iron-rich for its size. One leading idea: a giant ancient impact stripped away its rocky outer layers, leaving the metal heart behind.',
    life: 'Effectively zero chance of life — no real atmosphere and brutal temperature swings, though ice may hide in permanently shadowed polar craters.',
  },
  {
    id: 'venus',
    name: 'Venus',
    subtitle: "Earth's Twin Gone Wrong",
    texture: '/textures/2k_venus_atmosphere.jpg', // Venus is permanently cloud-covered
    color: '#e8c37e',
    atmosphere: { color: '#ffce80', intensity: 0.5, power: 2.8, scale: 1.04 },
    visualRadius: 0.78,
    rotationSpeed: 0.06, // with the ~177° axial tilt this renders retrograde (east->west)
    axialTilt: 3.096, // ~177.4° — almost upside down
    facts: {
      Type: 'Terrestrial planet',
      Diameter: '12,104 km (0.95 × Earth)',
      'Distance from Sun': '108.2 million km (0.72 AU)',
      'Distance from Earth': '38–261 million km (our closest neighbour)',
      'Travel time from Earth': '~3.5–4 months by probe',
      'Day length': '243 Earth days (longer than its year!)',
      'Year length': '225 Earth days',
      Moons: 'None',
      'Surface temp.': '~465 °C (hot enough to melt lead)',
    },
    funFacts: [
      'Venus is the only planet that rotates east-to-west (retrograde) — so the Sun rises in the west. A giant ancient impact and the tidal drag of its ultra-dense atmosphere likely reversed its spin.',
      'A day on Venus is longer than a year on Venus.',
      'Its thick CO₂ atmosphere creates a runaway greenhouse effect, making it the hottest planet.',
      'Surface pressure is ~92× Earth’s — like being 900 m underwater.',
    ],
    mythology:
      'Named after the Roman goddess of love and beauty (Greek Aphrodite) because it is the brightest natural object in the night sky after the Moon. Ancient cultures often saw it as two objects: a “morning star” and an “evening star.”',
    mystery:
      'In 2020 scientists reported possible phosphine in Venus’s clouds — a gas linked to life on Earth. The claim is hotly debated, but it revived the idea that microbes could float in the temperate upper cloud layer.',
    life: 'Surface: impossible. But ~50 km up, temperatures and pressures are Earth-like, so airborne microbial life is a long-shot hypothesis taken seriously by some scientists.',
  },
  {
    id: 'earth',
    name: 'Earth',
    subtitle: 'The Pale Blue Dot',
    texture: '/textures/4k_earth_daymap.jpg',
    clouds: '/textures/4k_earth_clouds.jpg',
    color: '#4f7cff',
    atmosphere: { color: '#7fb8ff', intensity: 0.95, power: 2.4, scale: 1.05 },
    visualRadius: 0.82,
    rotationSpeed: 0.085,
    axialTilt: 0.409, // 23.4°
    facts: {
      Type: 'Terrestrial planet (our home)',
      Diameter: '12,742 km',
      'Distance from Sun': '149.6 million km (1 AU, by definition)',
      'Distance from Earth': '0 km — you are here',
      'Day length': '23h 56m',
      'Year length': '365.25 days',
      Moons: '1 (the Moon)',
      'Surface temp.': '−88 °C to +58 °C (avg ~15 °C)',
    },
    funFacts: [
      'Earth is the only planet not named after a Greek or Roman god.',
      'It is the densest planet in the Solar System.',
      '71% of the surface is covered by water, yet it’s only ~0.02% of Earth’s mass.',
      'Earth’s rotation is gradually slowing — days get ~1.7 ms longer per century.',
    ],
    mythology:
      'Its name comes from Old English “eorþe,” simply meaning ground or soil. Nearly every culture has an Earth-mother deity — Gaia (Greek), Terra (Roman), Prithvi (Hindu).',
    mystery:
      'How life began here remains one of science’s biggest open questions. Earth is also the only place in the universe where we have confirmed life — so far.',
    life: '100% — the only world known to host life, from deep-sea vents to the upper atmosphere.',
  },
  {
    id: 'mars',
    name: 'Mars',
    subtitle: 'The Red Planet',
    texture: '/textures/4k_mars.jpg',
    color: '#c1440e',
    visualRadius: 0.58,
    rotationSpeed: 0.115,
    axialTilt: 0.439, // 25.2°
    facts: {
      Type: 'Terrestrial planet',
      Diameter: '6,779 km (0.53 × Earth)',
      'Distance from Sun': '227.9 million km (1.52 AU)',
      'Distance from Earth': '55–401 million km',
      'Travel time from Earth': '~7–9 months with current rockets',
      'Day length': '24h 37m (a “sol”)',
      'Year length': '687 Earth days',
      Moons: '2 (Phobos & Deimos)',
      'Surface temp.': '−140 °C to +20 °C',
    },
    funFacts: [
      'Home to Olympus Mons, the tallest volcano in the Solar System — ~22 km high, 3× Everest.',
      'Its red colour comes from iron oxide — literally rust — on the surface.',
      'Mars has seasons like Earth because of a similar axial tilt.',
      'Valles Marineris is a canyon system as long as the entire USA.',
    ],
    mythology:
      'Named after the Roman god of war (Greek Ares) because of its blood-red colour. Its two moons are named Phobos (fear) and Deimos (dread), the sons of Ares.',
    mystery:
      'The “face on Mars” in Cygonia fuelled decades of conspiracy theories about ancient Martian civilizations — until sharper images revealed an ordinary eroded mesa. The real mystery: occasional methane spikes that could be geological… or biological.',
    life: 'The top candidate for past or present microbial life. Ancient Mars had rivers, lakes and a thicker atmosphere; briny water may still exist underground.',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    subtitle: 'King of the Planets',
    texture: '/textures/4k_jupiter.jpg',
    color: '#d8ca9d',
    visualRadius: 1.7,
    rotationSpeed: 0.1,
    axialTilt: 0.0546, // 3.1°
    facts: {
      Type: 'Gas giant',
      Diameter: '139,820 km (11 × Earth)',
      'Distance from Sun': '778.5 million km (5.2 AU)',
      'Distance from Earth': '588–968 million km',
      'Travel time from Earth': '~2 years by probe (Juno took ~5 years via a gravity assist)',
      'Day length': '~9h 56m (fastest spin of any planet)',
      'Year length': '11.9 Earth years',
      Moons: '95+ known (incl. Io, Europa, Ganymede, Callisto)',
      'Cloud-top temp.': '~−145 °C',
    },
    funFacts: [
      'Jupiter is so massive it could swallow all the other planets combined — twice.',
      'The Great Red Spot is a storm bigger than Earth that has raged for centuries.',
      'It has the shortest day of any planet despite being the largest.',
      'Its moon Ganymede is the largest moon in the Solar System — bigger than Mercury.',
    ],
    mythology:
      'Named after the king of the Roman gods (Greek Zeus), fitting for the largest planet. Its four big moons are named after Zeus’s lovers and were the first objects seen orbiting another world (Galileo, 1610).',
    mystery:
      'Jupiter may have no solid surface at all — pressure simply increases until hydrogen becomes a metallic liquid. We still don’t fully know if it has a true core.',
    life: 'Jupiter itself is hostile, but its icy moon Europa hides a vast subsurface ocean — one of the best places to search for alien life.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    subtitle: 'The Ringed Jewel',
    texture: '/textures/4k_saturn.jpg',
    ring: '/textures/2k_saturn_ring_alpha.png',
    color: '#e3cda0',
    visualRadius: 1.45,
    rotationSpeed: 0.12,
    axialTilt: 0.466, // 26.7°
    facts: {
      Type: 'Gas giant',
      Diameter: '116,460 km (9 × Earth)',
      'Distance from Sun': '1.43 billion km (9.5 AU)',
      'Distance from Earth': '1.2–1.7 billion km',
      'Travel time from Earth': '~3 years by direct probe (Cassini took ~7 years)',
      'Day length': '~10h 33m',
      'Year length': '29.5 Earth years',
      Moons: '146+ known (incl. Titan & Enceladus)',
      'Cloud-top temp.': '~−178 °C',
    },
    funFacts: [
      'Saturn is the only planet less dense than water — it would float in a giant bathtub.',
      'Its rings are made of billions of ice and rock chunks, yet are often under 1 km thick.',
      'Titan is the only moon with a thick atmosphere and liquid (methane) lakes.',
      'Saturn’s rings may be a temporary feature — they’re slowly raining into the planet.',
    ],
    mythology:
      'Named after the Roman god of agriculture and time (Greek Cronus), father of Jupiter. The day “Saturday” is named after it.',
    mystery:
      'A bizarre, near-perfect hexagonal storm circles Saturn’s north pole — a six-sided jet stream wide enough to fit four Earths, with no agreed explanation.',
    life: 'Saturn is lifeless, but Enceladus shoots water-ice geysers from a hidden ocean, and Titan’s organic chemistry makes both prime astrobiology targets.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    subtitle: 'The Sideways Ice Giant',
    texture: '/textures/2k_uranus.jpg',
    color: '#9fe3e0',
    atmosphere: { color: '#bdf3ef', intensity: 0.4, power: 3.0, scale: 1.04 },
    visualRadius: 1.05,
    rotationSpeed: -0.1, // retrograde
    axialTilt: 1.706, // 97.8° — rolls on its side
    facts: {
      Type: 'Ice giant',
      Diameter: '50,724 km (4 × Earth)',
      'Distance from Sun': '2.87 billion km (19.2 AU)',
      'Distance from Earth': '2.6–3.2 billion km',
      'Travel time from Earth': '~9.5 years (Voyager 2 is the only visitor)',
      'Day length': '~17h 14m',
      'Year length': '84 Earth years',
      Moons: '28 known',
      'Cloud-top temp.': '~−224 °C (coldest planetary atmosphere)',
    },
    funFacts: [
      'Uranus is tipped over ~98° — it essentially orbits the Sun on its side.',
      'Each pole gets ~42 years of continuous sunlight, then ~42 years of darkness.',
      'It was the first planet discovered with a telescope (Herschel, 1781).',
      'It has the coldest atmosphere of any planet despite not being the farthest out.',
    ],
    mythology:
      'The only planet named after a Greek (not Roman) deity — Ouranos, the primordial god of the sky and father of Cronus (Saturn).',
    mystery:
      'Why is Uranus tipped on its side? The leading idea is a colossal collision — or several — with Earth-sized bodies in the early Solar System knocked it over for good.',
    life: 'No known prospect for life — a frigid, mostly hydrogen/helium/methane world with a slushy icy mantle.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    subtitle: 'The Windiest World',
    texture: '/textures/2k_neptune.jpg',
    color: '#3b5bdb',
    atmosphere: { color: '#5b86ff', intensity: 0.5, power: 2.9, scale: 1.04 },
    visualRadius: 1.02,
    rotationSpeed: 0.11,
    axialTilt: 0.494, // 28.3°
    facts: {
      Type: 'Ice giant',
      Diameter: '49,244 km (3.9 × Earth)',
      'Distance from Sun': '4.5 billion km (30.1 AU)',
      'Distance from Earth': '4.3–4.7 billion km',
      'Travel time from Earth': '~12 years (Voyager 2 took 12 years to reach it)',
      'Day length': '~16h 6m',
      'Year length': '165 Earth years',
      Moons: '16 known (incl. Triton)',
      'Cloud-top temp.': '~−214 °C',
    },
    funFacts: [
      'Neptune has the fastest winds in the Solar System — up to 2,100 km/h.',
      'It was discovered by mathematics first, then telescope — predicted from Uranus’s wobble (1846).',
      'It has only completed one full orbit of the Sun since its discovery (in 2011).',
      'Its largest moon, Triton, orbits backwards and may be a captured dwarf planet.',
    ],
    mythology:
      'Named after the Roman god of the sea (Greek Poseidon) for its deep ocean-blue colour, caused by methane in its atmosphere.',
    mystery:
      'Neptune radiates ~2.6× more heat than it receives from the distant Sun. Where this internal energy comes from — powering those supersonic winds — is still not fully understood.',
    life: 'No realistic prospect of life on this frozen, storm-wracked giant; interest focuses instead on its odd moon Triton.',
  },
]
