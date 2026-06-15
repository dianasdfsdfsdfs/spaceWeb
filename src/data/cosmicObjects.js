// Exotic deep-space objects. They are NOT on an orbit — each sits at a fixed
// scattered position in space. Clicking one flies the camera in until it nearly
// fills the screen (focus); everything else recedes into the background.
//
// `position`   : where it floats in the scene
// `focusDist`  : how close the camera gets when focused (smaller = bigger)
// `type`       : which procedural 3D component renders it
// info fields  : facts {}, funFacts [], sections [{ heading, text }]

export const COSMIC = [
  {
    id: 'blackhole',
    type: 'blackhole',
    name: 'Black Hole',
    subtitle: 'Gravitational Singularity',
    accent: '#ff7a2f',
    position: [-1, 1.5, -8],
    focusDist: 4.5,
    facts: {
      Type: 'Stellar / supermassive black hole',
      'Escape velocity': 'Greater than the speed of light',
      'Event horizon': 'The point of no return',
      Density: 'Effectively infinite at the singularity',
      'Nearest known': 'Gaia BH1 — ~1,560 light-years away',
      'Largest known': 'TON 618 — ~66 billion solar masses',
    },
    funFacts: [
      'Nothing — not even light — can escape once it crosses the event horizon.',
      'Time slows down near a black hole: hover at the edge and years pass outside for your minutes.',
      'The first ever image of a black hole (M87*) was released in 2019.',
      'Supermassive black holes sit at the centre of almost every large galaxy, including ours (Sagittarius A*).',
    ],
    sections: [
      {
        heading: 'How it forms',
        text: 'When a massive star runs out of fuel, its core collapses under gravity. If it is heavy enough, nothing can stop the collapse and it shrinks to an infinitely dense point — a singularity — wrapped in an event horizon.',
      },
      {
        heading: 'The glowing disk',
        text: 'Gas spiraling inward forms a superheated accretion disk that glows white-hot. The black hole’s gravity bends light so strongly that you can see the far side of the disk arcing over the top — the iconic look from Interstellar.',
      },
      {
        heading: 'Mystery & theories',
        text: 'What happens inside is unknown — general relativity and quantum physics break down there. Ideas range from wormholes and white holes to gateways to other universes. Stephen Hawking showed they very slowly evaporate over unimaginable timescales.',
      },
    ],
  },
  {
    id: 'quasar',
    type: 'quasar',
    image: '/textures/cosmic/quasar.jpg',
    photoSize: 3.8,
    photoKey: { lo: 0.05, hi: 0.26, inner: 0.42, outer: 0.68 },
    name: 'Quasar',
    subtitle: 'Blazing Galactic Core',
    accent: '#ff9a4d',
    position: [-15, 6.5, -15],
    focusDist: 4.0,
    facts: {
      Type: 'Active galactic nucleus',
      'Powered by': 'A feeding supermassive black hole',
      Luminosity: 'Up to 1,000× an entire galaxy',
      'Nearest': 'Markarian 231 — ~581 million light-years',
      'Most distant': 'Seen as they were in the early universe',
    },
    funFacts: [
      'Quasars are the brightest sustained objects in the universe.',
      'A single quasar can outshine 100 billion stars combined.',
      'They are so far away we see them as they were billions of years ago.',
      'The name comes from “quasi-stellar radio source” — they looked like stars but weren’t.',
    ],
    sections: [
      {
        heading: 'How it forms',
        text: 'When a supermassive black hole at a galaxy’s centre devours huge amounts of gas, the in-falling matter heats to millions of degrees and blasts out colossal jets of light and particles at nearly light-speed.',
      },
      {
        heading: 'Why it matters',
        text: 'Quasars act as cosmic lighthouses, letting astronomers probe the most distant, earliest eras of the universe — a glimpse of cosmic dawn.',
      },
    ],
  },
  {
    id: 'pulsar',
    type: 'pulsar',
    name: 'Pulsar',
    subtitle: 'Spinning Neutron Star',
    accent: '#7fd0ff',
    position: [14, 5, -13],
    focusDist: 3.1,
    facts: {
      Type: 'Rotating neutron star',
      Diameter: 'Only ~20 km across',
      Density: 'A teaspoon weighs ~1 billion tonnes',
      Rotation: 'Up to 700 times per second',
      'Magnetic field': 'Trillions of times Earth’s',
    },
    funFacts: [
      'A pulsar’s beam sweeps like a lighthouse — we see a “pulse” each rotation.',
      'The fastest pulsars spin hundreds of times per second.',
      'A sugar-cube of neutron-star material would weigh as much as a mountain.',
      'The first pulsar was nicknamed “LGM-1” (Little Green Men) — briefly mistaken for aliens.',
    ],
    sections: [
      {
        heading: 'How it forms',
        text: 'When a massive star explodes as a supernova, its core is crushed into a city-sized ball of pure neutrons. It keeps the star’s spin but shrinks enormously, so it rotates incredibly fast.',
      },
      {
        heading: 'Cosmic clocks',
        text: 'Their pulses are so regular they rival atomic clocks, and are used to test gravity, hunt for gravitational waves, and could one day navigate spacecraft across the galaxy.',
      },
    ],
  },
  {
    id: 'kilonova',
    type: 'kilonova',
    image: '/textures/cosmic/kilonova.jpg',
    photoSize: 3.4,
    photoKey: { lo: 0.07, hi: 0.28, inner: 0.34, outer: 0.56 },
    name: 'Kilonova',
    subtitle: 'Neutron Star Collision',
    accent: '#9ad6ff',
    position: [-13, -7, -16],
    focusDist: 3.6,
    facts: {
      Type: 'Merger of two neutron stars',
      Brightness: '~1,000× a normal nova',
      Creates: 'Gold, platinum & heavy elements',
      'First seen': 'GW170817 — 17 August 2017',
      Aftermath: 'A black hole or massive neutron star',
    },
    funFacts: [
      'Most of the gold and platinum in the universe — and in your jewellery — was forged in kilonovae.',
      'In 2017 one was detected by both gravitational waves AND light at once, opening “multi-messenger” astronomy.',
      'A single kilonova can create several Earth-masses of pure gold.',
      'The collision warps spacetime itself, sending ripples across the universe.',
    ],
    sections: [
      {
        heading: 'How it happens',
        text: 'Two neutron stars locked in orbit spiral closer over millions of years, then merge in a catastrophic collision — flinging out a cloud of neutron-rich matter that builds the heaviest elements.',
      },
      {
        heading: 'Why it matters',
        text: 'Kilonovae are the universe’s gold factories and a key source of gravitational waves — confirming Einstein’s century-old prediction.',
      },
    ],
  },
  {
    id: 'magnetar',
    type: 'magnetar',
    image: '/textures/cosmic/magnetar.jpg',
    photoSize: 3.9,
    photoKey: { lo: 0.08, hi: 0.3, inner: 0.28, outer: 0.5 },
    name: 'Magnetar',
    subtitle: 'Magnetic Monster Star',
    accent: '#4aa8ff',
    position: [15, -6, -19],
    focusDist: 4.1,
    facts: {
      Type: 'Ultra-magnetic neutron star',
      'Magnetic field': 'The strongest in the universe',
      Strength: '~1,000× a normal pulsar',
      'Star-quakes': 'Trigger giant flares of radiation',
      Lifespan: 'Magnetism fades over ~10,000 years',
    },
    funFacts: [
      'A magnetar’s field is so strong it would erase your credit card from halfway to the Moon.',
      'Get within 1,000 km and its magnetism would tear apart the atoms in your body.',
      'A single magnetar flare in 2004 briefly affected Earth’s atmosphere from 50,000 light-years away.',
      'Only about 30 magnetars are known in our galaxy.',
    ],
    sections: [
      {
        heading: 'How it forms',
        text: 'A rare type of neutron star born from a supernova, a magnetar winds up with a magnetic field quadrillions of times stronger than Earth’s — the most powerful magnets known to exist.',
      },
      {
        heading: 'Star-quakes',
        text: 'Stress in the crust occasionally cracks it, releasing flares so intense they outshine entire galaxies in gamma rays for a fraction of a second.',
      },
    ],
  },
  {
    id: 'nebula',
    type: 'nebula',
    image: '/textures/cosmic/nebula.jpg',
    photoSize: 6.1,
    spin: 0.04,
    name: 'Ring Nebula',
    subtitle: 'A Dying Star’s Shell',
    accent: '#ff8a3d',
    position: [4, -9, -21],
    focusDist: 6.4,
    facts: {
      Type: 'Planetary nebula',
      Distance: '~2,600 light-years away',
      Size: '~1 light-year across',
      'Created by': 'A dying Sun-like star',
      'Expanding at': '~20–30 km per second',
    },
    funFacts: [
      'Despite the name, planetary nebulae have nothing to do with planets — early astronomers thought they looked planet-like.',
      'The glowing colours map different gases: orange-red hydrogen, teal oxygen.',
      'This is roughly what our Sun will create in ~5 billion years.',
      'At the centre is the exposed core of the dead star — a white dwarf.',
    ],
    sections: [
      {
        heading: 'How it forms',
        text: 'A dying Sun-like star puffs off its outer layers into space. The exposed hot core lights up the expanding shell of gas, making it glow in vivid colours for a few thousand years.',
      },
      {
        heading: 'A glimpse of our future',
        text: 'Nebulae like this seed space with the elements for new stars and planets — and show the fate awaiting our own Sun.',
      },
    ],
  },
]
