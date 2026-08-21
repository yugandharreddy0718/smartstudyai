import { CLASS10_MATHS_CONTENT } from './class10MathsContent';
import { CLASS10_PHYSICS_CONTENT } from './class10PhysicsContent';
import { CLASS10_CHEMISTRY_CONTENT } from './class10ChemistryContent';
import { CLASS10_BIOLOGY_CONTENT } from './class10BiologyContent';
import { CLASS10_HISTORY_CONTENT } from './class10HistoryContent';
import { CLASS10_GEOGRAPHY_CONTENT } from './class10GeographyContent';
import { CLASS9_MATHS_CONTENT } from './class9MathsContent';
import { CLASS9_PHYSICS_CONTENT } from './class9PhysicsContent';
import { CLASS9_CHEMISTRY_CONTENT } from './class9ChemistryContent';
import { CLASS9_BIOLOGY_CONTENT } from './class9BiologyContent';
import { CLASS9_HISTORY_CONTENT } from './class9HistoryContent';
import { CLASS9_GEOGRAPHY_CONTENT } from './class9GeographyContent';
import { CLASS8_MATHS_CONTENT } from './class8MathsContent';
import { CLASS8_PHYSICS_CONTENT } from './class8PhysicsContent';
import { CLASS8_CHEMISTRY_CONTENT } from './class8ChemistryContent';
import { CLASS8_BIOLOGY_CONTENT } from './class8BiologyContent';
import { CLASS8_HISTORY_CONTENT } from './class8HistoryContent';
import { CLASS8_GEOGRAPHY_CONTENT } from './class8GeographyContent';
import { CLASS7_MATHS_CONTENT } from './class7MathsContent';
import { CLASS7_PHYSICS_CONTENT } from './class7PhysicsContent';
import { CLASS7_CHEMISTRY_CONTENT } from './class7ChemistryContent';
import { CLASS7_BIOLOGY_CONTENT } from './class7BiologyContent';
import { CLASS7_HISTORY_CONTENT } from './class7HistoryContent';
import { CLASS7_GEOGRAPHY_CONTENT } from './class7GeographyContent';
import { CLASS6_HISTORY_CONTENT } from './class6HistoryContent';
import { CLASS6_GEOGRAPHY_CONTENT } from './class6GeographyContent';
import { CLASS6_BIOLOGY_CONTENT } from './class6BiologyContent';
import { CLASS6_CHEMISTRY_CONTENT } from './class6ChemistryContent';
import { CLASS6_PHYSICS_CONTENT } from './class6PhysicsContent';
import { CLASS6_MATHS_CONTENT } from './class6MathsContent';
// Central curriculum database for SmartStudy AI (Grades 6 to 10)
// Complete 178 Non-Duplicate Chapters across 6 Active Subject Streams

export interface CurriculumChapter {
  id: string; // e.g. g6-maths-c1-l1 or g6-maths-c1
  chapterId?: string; // e.g. g6-maths-c1
  subjectId: string;
  grade: string; // "6" to "10"
  title: string;
  desc: string;
  lessons: number;
  content: string;
  fileUrl?: string;
}

const CURRICULUM_TEMPLATES: Record<string, Record<string, { id: string; title: string; desc: string }[]>> = {
  "maths": {
    "6": [
      {
        "id": "g6-maths-c1",
        "title": "Knowing Our Numbers",
        "desc": "Comparing large numbers, place values, estimation, brackets, and Roman numerals."
      },
      {
        "id": "g6-maths-c2",
        "title": "Whole Numbers",
        "desc": "Predecessors, successors, number line operations, and properties of whole numbers."
      },
      {
        "id": "g6-maths-c3",
        "title": "Playing with Numbers",
        "desc": "Factors, multiples, prime/composite numbers, divisibility rules, HCF, and LCM."
      },
      {
        "id": "g6-maths-c4",
        "title": "Basic Geometrical Ideas",
        "desc": "Points, lines, rays, curves, polygons, angles, triangles, quadrilaterals, and circles."
      },
      {
        "id": "g6-maths-c5",
        "title": "Understanding Elementary Shapes",
        "desc": "Measuring segments, angle types, classification of triangles and quadrilaterals, and 3D shapes."
      },
      {
        "id": "g6-maths-c6",
        "title": "Integers",
        "desc": "Positive and negative whole numbers, number line representation, and integer math."
      },
      {
        "id": "g6-maths-c7",
        "title": "Fractions",
        "desc": "Proper, improper, mixed, and equivalent fractions, plus addition and subtraction."
      },
      {
        "id": "g6-maths-c8",
        "title": "Decimals",
        "desc": "Tenths, hundredths, thousandths, decimal place values, and money/length operations."
      },
      {
        "id": "g6-maths-c9",
        "title": "Data Handling",
        "desc": "Data collection, organization using tally marks, pictographs, and bar graphs."
      },
      {
        "id": "g6-maths-c10",
        "title": "Mensuration",
        "desc": "Perimeter and area of squares, rectangles, and regular polygons."
      },
      {
        "id": "g6-maths-c11",
        "title": "Algebra",
        "desc": "Variables, matchstick geometric patterns, expressions, and solving simple equations."
      },
      {
        "id": "g6-maths-c12",
        "title": "Ratio and Proportion",
        "desc": "Comparison by division, proportions, and the unitary method."
      },
      {
        "id": "g6-maths-c13",
        "title": "Symmetry",
        "desc": "Reflection symmetry, line of symmetry, and architectural patterns."
      },
      {
        "id": "g6-maths-c14",
        "title": "Practical Geometry",
        "desc": "Construction of circles, line segments, perpendicular bisectors, and special angles."
      }
    ],
    "7": [
      {
        "id": "g7-maths-c1",
        "title": "Integers",
        "desc": "Properties of integer addition, subtraction, multiplication, and division rules."
      },
      {
        "id": "g7-maths-c2",
        "title": "Fractions and Decimals",
        "desc": "Multiplication and division of fractions and decimals."
      },
      {
        "id": "g7-maths-c3",
        "title": "Data Handling",
        "desc": "Arithmetic mean, mode, median, double bar graphs, and chance/probability."
      },
      {
        "id": "g7-maths-c4",
        "title": "Simple Equations",
        "desc": "Setting up and solving equations by transposition and word problems."
      },
      {
        "id": "g7-maths-c5",
        "title": "Lines and Angles",
        "desc": "Complementary, supplementary, linear pair, and parallel line transversal angles."
      },
      {
        "id": "g7-maths-c6",
        "title": "The Triangle and Its Properties",
        "desc": "Medians, altitudes, exterior angle property, angle sum property, and Pythagoras theorem."
      },
      {
        "id": "g7-maths-c7",
        "title": "Comparing Quantities",
        "desc": "Ratios, percentages, profit, loss, and simple interest calculations."
      },
      {
        "id": "g7-maths-c8",
        "title": "Rational Numbers",
        "desc": "Positive/negative rational values, number line placement, and four arithmetic operations."
      },
      {
        "id": "g7-maths-c9",
        "title": "Perimeter and Area",
        "desc": "Area of parallelograms, triangles, circles, and unit conversions."
      },
      {
        "id": "g7-maths-c10",
        "title": "Algebraic Expressions",
        "desc": "Terms, factors, coefficients, like/unlike terms, and expression operations."
      },
      {
        "id": "g7-maths-c11",
        "title": "Exponents and Powers",
        "desc": "Exponential forms, laws of exponents, and scientific standard notation."
      },
      {
        "id": "g7-maths-c12",
        "title": "Symmetry",
        "desc": "Line symmetry and rotational symmetry order in 2D shapes."
      },
      {
        "id": "g7-maths-c13",
        "title": "Visualising Solid Shapes",
        "desc": "Plane figures, 3D solids, nets for 3D shapes, and isometric sketches."
      }
    ],
    "8": [
      {
        "id": "g8-maths-c1",
        "title": "Rational Numbers",
        "desc": "Properties of rational numbers, number line representation, and finding rational values."
      },
      {
        "id": "g8-maths-c2",
        "title": "Linear Equations in One Variable",
        "desc": "Solving linear equations with variables on both sides and applications."
      },
      {
        "id": "g8-maths-c3",
        "title": "Understanding Quadrilaterals",
        "desc": "Polygons, sum of exterior angles, and properties of parallelograms."
      },
      {
        "id": "g8-maths-c4",
        "title": "Data Handling",
        "desc": "Grouped frequency tables, histograms, pie charts, and probability."
      },
      {
        "id": "g8-maths-c5",
        "title": "Squares and Square Roots",
        "desc": "Properties of squares, prime factorization, and long division square roots."
      },
      {
        "id": "g8-maths-c6",
        "title": "Cubes and Cube Roots",
        "desc": "Cube numbers, prime factorization, and estimating cube roots."
      },
      {
        "id": "g8-maths-c7",
        "title": "Comparing Quantities",
        "desc": "Discounts, GST calculations, profit/loss, and compound interest formulas."
      },
      {
        "id": "g8-maths-c8",
        "title": "Algebraic Expressions and Identities",
        "desc": "Multiplying polynomials, concept of identities, and standard identities."
      },
      {
        "id": "g8-maths-c9",
        "title": "Mensuration",
        "desc": "Area of trapeziums, surface area and volume of cubes, cuboids, and cylinders."
      },
      {
        "id": "g8-maths-c10",
        "title": "Exponents and Powers",
        "desc": "Negative exponents, laws of exponents, and scientific notation."
      },
      {
        "id": "g8-maths-c11",
        "title": "Direct and Inverse Proportions",
        "desc": "Direct proportion, inverse proportion, and real-world word problems."
      },
      {
        "id": "g8-maths-c12",
        "title": "Factorisation",
        "desc": "Factorisation by common factors, regrouping, algebraic identities, and division."
      },
      {
        "id": "g8-maths-c13",
        "title": "Introduction to Graphs",
        "desc": "Bar graphs, pie charts, line graphs, linear graphs, and Cartesian coordinates."
      }
    ],
    "9": [
      {
        "id": "g9-maths-c1",
        "title": "Number Systems",
        "desc": "Irrational numbers, real number scale, rationalizing denominators, and real exponents."
      },
      {
        "id": "g9-maths-c2",
        "title": "Polynomials",
        "desc": "Degree, zeroes, remainder theorem, factor theorem, and algebraic identities."
      },
      {
        "id": "g9-maths-c3",
        "title": "Coordinate Geometry",
        "desc": "Cartesian plane, coordinate axes, quadrants, and plotting coordinates."
      },
      {
        "id": "g9-maths-c4",
        "title": "Linear Equations in Two Variables",
        "desc": "Standard form ax + by + c = 0, solutions, and 2D linear graphing."
      },
      {
        "id": "g9-maths-c5",
        "title": "Introduction to Euclid's Geometry",
        "desc": "Euclid's definitions, axioms, postulates, and Fifth Postulate history."
      },
      {
        "id": "g9-maths-c6",
        "title": "Lines and Angles",
        "desc": "Intersecting lines, linear pairs, parallel line transversal theorems, and triangle angle sum."
      },
      {
        "id": "g9-maths-c7",
        "title": "Triangles",
        "desc": "Congruence criteria (SAS, ASA, SSS, RHS), isosceles properties, and inequalities."
      },
      {
        "id": "g9-maths-c8",
        "title": "Quadrilaterals",
        "desc": "Properties of parallelograms, rectangle/square proofs, and the Mid-Point Theorem."
      },
      {
        "id": "g9-maths-c9",
        "title": "Circles",
        "desc": "Chords, perpendicular from centre, subtended angles, and cyclic quadrilaterals."
      },
      {
        "id": "g9-maths-c10",
        "title": "Heron's Formula",
        "desc": "Calculating area of scalene triangles and quadrilateral applications."
      },
      {
        "id": "g9-maths-c11",
        "title": "Surface Areas and Volumes",
        "desc": "Surface area and volume of right circular cones, spheres, and hemispheres."
      },
      {
        "id": "g9-maths-c12",
        "title": "Statistics",
        "desc": "Collection of data, bar graphs, histograms of varying widths, and frequency polygons."
      }
    ],
    "10": [
      {
        "id": "g10-maths-c1",
        "title": "Real Numbers",
        "desc": "Euclid's division lemma, fundamental theorem of arithmetic, and irrationality proofs."
      },
      {
        "id": "g10-maths-c2",
        "title": "Polynomials",
        "desc": "Geometrical meaning of zeroes, zeroes-coefficient relationships, and division algorithm."
      },
      {
        "id": "g10-maths-c3",
        "title": "Pair of Linear Equations in Two Variables",
        "desc": "Graphical method, substitution, elimination, and cross-multiplication methods."
      },
      {
        "id": "g10-maths-c4",
        "title": "Quadratic Equations",
        "desc": "Standard form, factorization, completing the square, quadratic formula, and discriminant."
      },
      {
        "id": "g10-maths-c5",
        "title": "Arithmetic Progressions",
        "desc": "Understanding APs, nth term formula, and sum of first n terms."
      },
      {
        "id": "g10-maths-c6",
        "title": "Triangles",
        "desc": "Similar figures, Thales basic proportionality theorem, similarity criteria, and Pythagoras proof."
      },
      {
        "id": "g10-maths-c7",
        "title": "Coordinate Geometry",
        "desc": "Distance formula, section formula, midpoint formula, and area of coordinate triangles."
      },
      {
        "id": "g10-maths-c8",
        "title": "Introduction to Trigonometry",
        "desc": "Trigonometric ratios, values for specific angles (0°-90°), and identities."
      },
      {
        "id": "g10-maths-c9",
        "title": "Some Applications of Trigonometry",
        "desc": "Line of sight, angle of elevation, angle of depression, and heights and distances."
      },
      {
        "id": "g10-maths-c10",
        "title": "Circles",
        "desc": "Tangents to a circle, point of contact, and tangent length theorems."
      },
      {
        "id": "g10-maths-c11",
        "title": "Areas Related to Circles",
        "desc": "Perimeter and area of sector and segment of a circle."
      },
      {
        "id": "g10-maths-c12",
        "title": "Surface Areas and Volumes",
        "desc": "Surface area and volume of combinations of solids and shape conversions."
      },
      {
        "id": "g10-maths-c13",
        "title": "Statistics",
        "desc": "Mean (direct/assumed/step-deviation), mode, median of grouped data, and ogive graphs."
      },
      {
        "id": "g10-maths-c14",
        "title": "Probability",
        "desc": "Theoretical probability, elementary/complementary events, and dice/card problems."
      }
    ]
  },
  "physics": {
    "6": [
      {
        "id": "g6-physics-c1",
        "title": "Motion and Measurement of Distances",
        "desc": "History of transport, SI standard units, and rectilinear/circular/periodic motion."
      },
      {
        "id": "g6-physics-c2",
        "title": "Light, Shadows and Reflections",
        "desc": "Transparent, translucent, opaque materials, shadow formation, and pinhole cameras."
      },
      {
        "id": "g6-physics-c3",
        "title": "Electricity and Circuits",
        "desc": "Electric cells, bulb anatomy, open/closed circuits, switches, conductors, and insulators."
      }
    ],
    "7": [
      {
        "id": "g7-physics-c1",
        "title": "Heat and Temperature",
        "desc": "Hotness, clinical and laboratory thermometers, conduction, convection, and radiation."
      },
      {
        "id": "g7-physics-c2",
        "title": "Motion and Time",
        "desc": "Speed calculation, simple pendulum, time measurement tools, and distance-time graphs."
      },
      {
        "id": "g7-physics-c3",
        "title": "Electric Current and Its Effects",
        "desc": "Circuit symbols, heating effect of current, electric fuses, and electromagnets."
      }
    ],
    "8": [
      {
        "id": "g8-physics-c1",
        "title": "Force and Pressure",
        "desc": "Contact and non-contact forces, pressure formula, liquid pressure, and atmospheric pressure."
      },
      {
        "id": "g8-physics-c2",
        "title": "Friction",
        "desc": "Factors affecting friction, static/sliding/rolling friction, lubricants, and fluid drag."
      },
      {
        "id": "g8-physics-c3",
        "title": "Sound",
        "desc": "Vibrations, medium propagation, human ear, frequency, amplitude, and noise pollution."
      },
      {
        "id": "g8-physics-c4",
        "title": "Light & Chemical Effects of Current",
        "desc": "Laws of reflection, plane mirrors, kaleidoscope, human eye structure, and electroplating."
      }
    ],
    "9": [
      {
        "id": "g9-physics-c1",
        "title": "Motion",
        "desc": "Distance, displacement, speed, velocity, acceleration, and graphical equations of motion."
      },
      {
        "id": "g9-physics-c2",
        "title": "Force and Laws of Motion",
        "desc": "Inertia, Newton's first, second, and third laws of motion, and momentum conservation."
      },
      {
        "id": "g9-physics-c3",
        "title": "Gravitation & Floatation",
        "desc": "Universal law of gravitation, acceleration due to gravity (g), thrust, pressure, and Archimedes principle."
      },
      {
        "id": "g9-physics-c4",
        "title": "Work, Energy, Power & Sound",
        "desc": "Work done, kinetic/potential energy, conservation of energy, power, and sound waves."
      }
    ],
    "10": [
      {
        "id": "g10-physics-c1",
        "title": "Light – Reflection and Refraction",
        "desc": "Spherical mirrors, mirror formula, refraction, Snell's law, lens formula, and power."
      },
      {
        "id": "g10-physics-c2",
        "title": "The Human Eye and the Colorful World",
        "desc": "Eye structure, vision defects (myopia/hypermetropia), prism dispersion, and atmospheric refraction."
      },
      {
        "id": "g10-physics-c3",
        "title": "Electricity",
        "desc": "Electric current, potential difference, Ohm's law, series/parallel resistors, and Joule's heating."
      },
      {
        "id": "g10-physics-c4",
        "title": "Magnetic Effects of Electric Current",
        "desc": "Magnetic field lines, solenoid fields, Fleming's left-hand rule, and domestic circuits."
      }
    ]
  },
  "chemistry": {
    "6": [
      {
        "id": "g6-chemistry-c1",
        "title": "Sorting Materials into Groups",
        "desc": "Appearance, hardness, solubility, density, and transparency of materials."
      },
      {
        "id": "g6-chemistry-c2",
        "title": "Separation of Substances",
        "desc": "Handpicking, threshing, winnowing, sieving, sedimentation, filtration, and evaporation."
      }
    ],
    "7": [
      {
        "id": "g7-chemistry-c1",
        "title": "Acids, Bases and Salts",
        "desc": "Natural indicators, litmus testing, properties of acids and bases, and neutralization."
      },
      {
        "id": "g7-chemistry-c2",
        "title": "Physical and Chemical Changes",
        "desc": "Reversible physical changes, chemical reactions, rusting of iron, and crystallization."
      }
    ],
    "8": [
      {
        "id": "g8-chemistry-c1",
        "title": "Coal and Petroleum",
        "desc": "Exhaustible resources, formation of coal, petroleum refining, and natural gas."
      },
      {
        "id": "g8-chemistry-c2",
        "title": "Combustion and Flame",
        "desc": "Combustion conditions, ignition temperature, fire control, flame zones, and fuel efficiency."
      }
    ],
    "9": [
      {
        "id": "g9-chemistry-c1",
        "title": "Matter in Our Surroundings",
        "desc": "States of matter, temperature/pressure interconversion, kinetic theory, and evaporation."
      },
      {
        "id": "g9-chemistry-c2",
        "title": "Is Matter Around Us Pure",
        "desc": "Elements, compounds, mixtures, solutions, suspensions, colloids, and separation methods."
      },
      {
        "id": "g9-chemistry-c3",
        "title": "Atoms and Molecules",
        "desc": "Laws of chemical combination, Dalton's atomic theory, atomic mass, ions, and chemical formulas."
      },
      {
        "id": "g9-chemistry-c4",
        "title": "Structure of the Atom",
        "desc": "Protons, electrons, neutrons, Thomson/Rutherford/Bohr models, valency, and isotopes."
      }
    ],
    "10": [
      {
        "id": "g10-chemistry-c1",
        "title": "Chemical Reactions and Equations",
        "desc": "Chemical equations, balancing, combination, decomposition, displacement, redox, and corrosion."
      },
      {
        "id": "g10-chemistry-c2",
        "title": "Acids, Bases and Salts",
        "desc": "Chemical properties of acids/bases, pH scale in daily life, and baking/washing soda synthesis."
      },
      {
        "id": "g10-chemistry-c3",
        "title": "Metals and Non-Metals",
        "desc": "Physical/chemical properties, reactivity series, ionic bonding, metallurgy, and refining."
      },
      {
        "id": "g10-chemistry-c4",
        "title": "Carbon and Its Compounds",
        "desc": "Covalent bonding, tetravalency, homologous series, ethanol, ethanoic acid, and soaps."
      }
    ]
  },
  "biology": {
    "6": [
      {
        "id": "g6-biology-c1",
        "title": "Components of Food",
        "desc": "Carbohydrates, proteins, fats, vitamins, minerals, balanced diet, and deficiency diseases."
      },
      {
        "id": "g6-biology-c2",
        "title": "Getting to Know Plants",
        "desc": "Herbs, shrubs, trees, stem/leaf functions, tap/fibrous roots, and flower structure."
      },
      {
        "id": "g6-biology-c3",
        "title": "Body Movements & Living Organisms",
        "desc": "Human skeleton, joints, cartilage, animal movement, habitats, and adaptations."
      }
    ],
    "7": [
      {
        "id": "g7-biology-c1",
        "title": "Nutrition in Plants",
        "desc": "Autotrophic photosynthesis, chlorophyll, heterotrophic parasites, and saprotrophs."
      },
      {
        "id": "g7-biology-c2",
        "title": "Nutrition in Animals",
        "desc": "Human digestive system organs, teeth, stomach, intestine, and ruminant digestion."
      },
      {
        "id": "g7-biology-c3",
        "title": "Respiration in Organisms",
        "desc": "Cellular respiration, aerobic vs anaerobic, human lungs, and gas exchange."
      },
      {
        "id": "g7-biology-c4",
        "title": "Transportation & Reproduction in Plants",
        "desc": "Xylem/phloem transport, excretory system, asexual modes, and pollination/seeds."
      }
    ],
    "8": [
      {
        "id": "g8-biology-c1",
        "title": "Crop Production and Management",
        "desc": "Soil preparation, sowing, manures, fertilizers, irrigation, harvesting, and storage."
      },
      {
        "id": "g8-biology-c2",
        "title": "Microorganisms: Friend and Foe",
        "desc": "Bacteria, fungi, protozoa, viruses, fermentation, antibiotics, and food preservation."
      },
      {
        "id": "g8-biology-c3",
        "title": "Reproduction in Animals",
        "desc": "Male/female reproductive systems, fertilization, zygote development, and asexual modes."
      },
      {
        "id": "g8-biology-c4",
        "title": "Reaching the Age of Adolescence",
        "desc": "Puberty changes, secondary sexual traits, endocrine hormones, and reproductive health."
      }
    ],
    "9": [
      {
        "id": "g9-biology-c1",
        "title": "The Fundamental Unit of Life (Cell)",
        "desc": "Cell discovery, plasma membrane, cell wall, nucleus, and cytoplasm organelles."
      },
      {
        "id": "g9-biology-c2",
        "title": "Tissues",
        "desc": "Plant meristematic/permanent tissues and animal epithelial, connective, muscle, nervous tissues."
      },
      {
        "id": "g9-biology-c3",
        "title": "Improvement in Food Resources",
        "desc": "Crop variety improvement, nutrient management, manures, fertilizers, and animal husbandry."
      }
    ],
    "10": [
      {
        "id": "g10-biology-c1",
        "title": "Life Processes",
        "desc": "Nutrition, respiration, circulation (heart/blood vessels), and excretion (kidney/nephron)."
      },
      {
        "id": "g10-biology-c2",
        "title": "Control and Coordination",
        "desc": "Nervous system, neurons, reflex arcs, human brain, plant tropisms, and animal hormones."
      },
      {
        "id": "g10-biology-c3",
        "title": "How do Organisms Reproduce?",
        "desc": "Asexual reproduction, flower reproduction, human reproductive system, and health."
      },
      {
        "id": "g10-biology-c4",
        "title": "Heredity and Evolution",
        "desc": "Variation accumulation, Mendelian genetics, monohybrid/dihybrid crosses, and sex determination."
      }
    ]
  },
  "history": {
    "6": [
      {
        "id": "g6-history-c1",
        "title": "What, Where, How and When?",
        "desc": "Historical sources, manuscripts, inscriptions, archaeology, and dates."
      },
      {
        "id": "g6-history-c2",
        "title": "From Gathering to Growing Food",
        "desc": "Paleolithic nomads, domestication of plants/animals, and early farming villages."
      },
      {
        "id": "g6-history-c3",
        "title": "In the Earliest Cities (Indus Valley)",
        "desc": "Discovery of Harappa and Mohenjo-Daro, city layout, Great Bath, and crafts."
      },
      {
        "id": "g6-history-c4",
        "title": "What Books and Burials Tell Us",
        "desc": "Vedas, Rigveda hymns, cattle, horses, chariots, and Megalithic burial customs."
      },
      {
        "id": "g6-history-c5",
        "title": "Kingdoms, Kings and an Early Republic",
        "desc": "Rajas, Janapadas, Mahajanapadas, taxation, agriculture, and Magadha/Vajji."
      },
      {
        "id": "g6-history-c6",
        "title": "Diversity and Discrimination (Civics)",
        "desc": "Understanding diversity, prejudice, stereotypes, and constitutional equality."
      },
      {
        "id": "g6-history-c7",
        "title": "What is Government? & Democracy (Civics)",
        "desc": "Role of government, democratic governance, voting rights, and key features."
      }
    ],
    "7": [
      {
        "id": "g7-history-c1",
        "title": "Tracing Changes Through a Thousand Years",
        "desc": "Historical terminology changes, sources, and social/political groupings."
      },
      {
        "id": "g7-history-c2",
        "title": "New Kings and Kingdoms",
        "desc": "Emergence of new dynasties, Prashastis, land grants, and Chola administration."
      },
      {
        "id": "g7-history-c3",
        "title": "Delhi 12th to 15th Century",
        "desc": "Delhi Sultans, administration under Khiljis and Tughluqs, and garrison towns."
      },
      {
        "id": "g7-history-c4",
        "title": "The Mughals 16th to 17th Century",
        "desc": "Babur, Humayun, Akbar, Jahangir, Shah Jahan, Mansabdars, and Akbar's policies."
      },
      {
        "id": "g7-history-c5",
        "title": "Tribes, Nomads and Settled Communities",
        "desc": "Tribal societies, pastoral nomads, Gonds, Ahoms, and social changes."
      },
      {
        "id": "g7-history-c6",
        "title": "On Equality (Civics)",
        "desc": "Equal right to vote, civil rights movement, and government equality schemes."
      },
      {
        "id": "g7-history-c7",
        "title": "Role of Government in Health (Civics)",
        "desc": "Public and private healthcare services, healthcare equality, and Kerala case study."
      }
    ],
    "8": [
      {
        "id": "g8-history-c1",
        "title": "How, When and Where",
        "desc": "Importance of historical dates, periodisation, and British official records."
      },
      {
        "id": "g8-history-c2",
        "title": "From Trade to Territory",
        "desc": "East India Company, Battles of Plassey and Buxar, and Subsidiary Alliance."
      },
      {
        "id": "g8-history-c3",
        "title": "Ruling the Countryside",
        "desc": "Permanent, Mahalwari, and Ryotwari settlement systems and Indigo cultivation."
      },
      {
        "id": "g8-history-c4",
        "title": "Tribals, Dikus and Birsa Munda",
        "desc": "Tribal livelihoods, British forest laws impact, and Birsa Munda movement."
      },
      {
        "id": "g8-history-c5",
        "title": "When People Rebel: 1857 and After",
        "desc": "Causes of 1857 revolt, spread from Meerut to Delhi, suppression, and changes."
      },
      {
        "id": "g8-history-c6",
        "title": "The Indian Constitution (Civics)",
        "desc": "Need for a Constitution, key features, federalism, separation of powers, and fundamental rights."
      },
      {
        "id": "g8-history-c7",
        "title": "Understanding Secularism & Judiciary (Civics)",
        "desc": "Indian secularism principles, structure of courts, and access to justice."
      }
    ],
    "9": [
      {
        "id": "g9-history-c1",
        "title": "The French Revolution",
        "desc": "Old Regime French society, storming of Bastille, constitutional monarchy, and Jacobins."
      },
      {
        "id": "g9-history-c2",
        "title": "Socialism in Europe and Russian Revolution",
        "desc": "Age of social change, 1905 Russian Revolution, October Revolution 1917, and Stalin."
      },
      {
        "id": "g9-history-c3",
        "title": "Nazism and the Rise of Hitler",
        "desc": "Weimar Republic collapse, Hitler's rise to power, Nazi worldview, and Holocaust."
      },
      {
        "id": "g9-history-c4",
        "title": "What is Democracy? Why Democracy? (Civics)",
        "desc": "Definition of democracy, features of democracy, and arguments for/against."
      },
      {
        "id": "g9-history-c5",
        "title": "Constitutional Design & Electoral Politics (Civics)",
        "desc": "Making of Indian Constitution, why elections, and democratic election system."
      }
    ],
    "10": [
      {
        "id": "g10-history-c1",
        "title": "The Rise of Nationalism in Europe",
        "desc": "French Revolution legacy, Unification of Germany and Italy, and Balkan nationalism."
      },
      {
        "id": "g10-history-c2",
        "title": "Nationalism in India",
        "desc": "Non-Cooperation Movement, Civil Disobedience Movement, Dandi March, and sense of belonging."
      },
      {
        "id": "g10-history-c3",
        "title": "Power Sharing & Federalism (Civics)",
        "desc": "Belgium and Sri Lanka power sharing, forms of power sharing, and Indian federalism."
      },
      {
        "id": "g10-history-c4",
        "title": "Gender, Religion and Caste (Civics)",
        "desc": "Gender division in politics, communalism, secular state, and caste in Indian politics."
      },
      {
        "id": "g10-history-c5",
        "title": "Outcomes of Democracy (Civics)",
        "desc": "Accountable, responsive, legitimate government, economic growth, and dignity of citizens."
      }
    ]
  },
  "geography": {
    "6": [
      {
        "id": "g6-geography-c1",
        "title": "The Earth in the Solar System",
        "desc": "Celestial bodies, solar system, sun, earth, moon, asteroids, and meteoroids."
      },
      {
        "id": "g6-geography-c2",
        "title": "Globe: Latitudes and Longitudes",
        "desc": "Equator, parallels of latitude, heat zones, longitudes, and standard time zones."
      },
      {
        "id": "g6-geography-c3",
        "title": "Motions of the Earth",
        "desc": "Earth rotation, revolution, day/night cycle, seasons, and solstices."
      },
      {
        "id": "g6-geography-c4",
        "title": "Maps",
        "desc": "Physical, political, thematic maps, distance scale, direction compass, and symbols."
      },
      {
        "id": "g6-geography-c5",
        "title": "Major Domains of the Earth",
        "desc": "Lithosphere, continents, hydrosphere, oceans, atmosphere, and biosphere."
      },
      {
        "id": "g6-geography-c6",
        "title": "Our Country – India",
        "desc": "Locational setting, physical divisions, Himalayas, plains, plateau, and islands."
      }
    ],
    "7": [
      {
        "id": "g7-geography-c1",
        "title": "Environment",
        "desc": "Components of environment, natural environment, ecosystems, and human environment."
      },
      {
        "id": "g7-geography-c2",
        "title": "Inside Our Earth",
        "desc": "Crust, mantle, core layers, igneous/sedimentary/metamorphic rocks, and rock cycle."
      },
      {
        "id": "g7-geography-c3",
        "title": "Our Changing Earth",
        "desc": "Lithospheric plates, volcanoes, earthquakes, and landform creation by rivers/ice/wind."
      },
      {
        "id": "g7-geography-c4",
        "title": "Air",
        "desc": "Atmosphere composition, layers, temperature, pressure, wind systems, and rainfall."
      },
      {
        "id": "g7-geography-c5",
        "title": "Water",
        "desc": "Water distribution, water cycle, ocean waves, tsunamis, tides, and ocean currents."
      },
      {
        "id": "g7-geography-c6",
        "title": "Human Environment Interactions",
        "desc": "Life in Amazon tropical basin, Ganga-Brahmaputra basin, and Sahara/Ladakh deserts."
      }
    ],
    "8": [
      {
        "id": "g8-geography-c1",
        "title": "Resources",
        "desc": "Types of resources: natural, human-made, human, resource conservation, and sustainability."
      },
      {
        "id": "g8-geography-c2",
        "title": "Land, Soil, Water, Natural Vegetation & Wildlife",
        "desc": "Land degradation, soil formation/conservation, water management, and forests."
      },
      {
        "id": "g8-geography-c3",
        "title": "Agriculture",
        "desc": "Subsistence and commercial farming, major food/fiber crops, and agricultural development."
      },
      {
        "id": "g8-geography-c4",
        "title": "Industries",
        "desc": "Classification of industries, industrial location factors, and iron/steel & cotton textiles."
      },
      {
        "id": "g8-geography-c5",
        "title": "Human Resources",
        "desc": "Population distribution, density, factors affecting growth, and population pyramids."
      }
    ],
    "9": [
      {
        "id": "g9-geography-c1",
        "title": "India – Size and Location",
        "desc": "Latitudinal/longitudinal extent, India and the world, and strategic neighbors."
      },
      {
        "id": "g9-geography-c2",
        "title": "Physical Features of India",
        "desc": "Plate tectonics, Himalayas, Northern Plains, Peninsular Plateau, Desert, Coasts, Islands."
      },
      {
        "id": "g9-geography-c3",
        "title": "Drainage (Rivers & Lakes)",
        "desc": "Himalayan vs Peninsular river systems, lakes, economic role, and river pollution."
      },
      {
        "id": "g9-geography-c4",
        "title": "Climate",
        "desc": "Monsoon mechanism, climatic controls, winter/summer/monsoon seasons, and rainfall."
      },
      {
        "id": "g9-geography-c5",
        "title": "Natural Vegetation and Wildlife",
        "desc": "Factors affecting flora/fauna, forest types of India, and wildlife conservation."
      },
      {
        "id": "g9-geography-c6",
        "title": "The Story of Village Palampur (Economics)",
        "desc": "Production factors: land, labor, physical capital, human capital, and farming."
      },
      {
        "id": "g9-geography-c7",
        "title": "People as Resource & Poverty (Economics)",
        "desc": "Human capital investment, education/health, unemployment, and poverty lines."
      }
    ],
    "10": [
      {
        "id": "g10-geography-c1",
        "title": "Resources and Development",
        "desc": "Classification of resources, resource planning, soil types, and soil erosion control."
      },
      {
        "id": "g10-geography-c2",
        "title": "Forest and Wildlife Resources",
        "desc": "Flora and fauna loss, conservation projects, Project Tiger, and community conservation."
      },
      {
        "id": "g10-geography-c3",
        "title": "Water Resources",
        "desc": "Water scarcity, multi-purpose river projects, dams, and rainwater harvesting."
      },
      {
        "id": "g10-geography-c4",
        "title": "Agriculture",
        "desc": "Farming types, cropping pattern (Rabi/Kharif/Zaid), major crops, and technological reforms."
      },
      {
        "id": "g10-geography-c5",
        "title": "Minerals and Energy Resources",
        "desc": "Occurrence of minerals, metallic/non-metallic minerals, and conventional/non-conventional energy."
      },
      {
        "id": "g10-geography-c6",
        "title": "Development (Economics)",
        "desc": "What development promises, income and other goals, national development, and HDI."
      },
      {
        "id": "g10-geography-c7",
        "title": "Sectors of the Indian Economy & Money and Credit (Economics)",
        "desc": "Primary, secondary, tertiary sectors, organized vs unorganized, and credit systems."
      }
    ]
  }
};

export const DEFAULT_CHAPTER: CurriculumChapter = {
  id: 'g10-maths-c1-l1',
  chapterId: 'g10-maths-c1',
  subjectId: 'maths',
  grade: '10',
  title: 'Real Numbers & Primes',
  desc: 'Euclid\'s division lemma, fundamental theorem of arithmetic, and irrationality proofs.',
  lessons: 3,
  content: 'Real numbers consist of all points on a continuous line, including integers, rational fractions, and irrational values such as pi and root 2.'
};

export function getChaptersBySubject(subjectId: string, grade: string = '8'): CurriculumChapter[] {
  const cleanGrade = (grade || '8').toString().replace(/^(class_?)/i, '');
  const targetSubject = (subjectId || 'maths').toLowerCase();

  // Legacy fallback: if 'science' is requested, combine physics, chemistry, and biology chapters
  if (targetSubject === 'science') {
    const phys = getChaptersBySubject('physics', cleanGrade);
    const chem = getChaptersBySubject('chemistry', cleanGrade);
    const bio = getChaptersBySubject('biology', cleanGrade);
    return [...phys, ...chem, ...bio];
  }

  const subjectTemplates = CURRICULUM_TEMPLATES[targetSubject] || {};
  const gradeTemplates = subjectTemplates[cleanGrade] || subjectTemplates['8'] || [];

  if (cleanGrade === '6' && targetSubject === 'maths') {
    const keys = Object.keys(CLASS6_MATHS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS6_MATHS_CONTENT[k];
      return {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: 'maths',
        grade: '6',
        title: item.title,
        desc: item.desc,
        lessons: 1,
        content: item.content
      };
    });
  }

  if (cleanGrade === '6' && targetSubject === 'physics') {
    const keys = Object.keys(CLASS6_PHYSICS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS6_PHYSICS_CONTENT[k];
      return {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: 'physics',
        grade: '6',
        title: item.title,
        desc: item.desc,
        lessons: 1,
        content: item.content
      };
    });
  }

  if (cleanGrade === '6' && targetSubject === 'chemistry') {
    const keys = Object.keys(CLASS6_CHEMISTRY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS6_CHEMISTRY_CONTENT[k];
      return {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: 'chemistry',
        grade: '6',
        title: item.title,
        desc: item.desc,
        lessons: 1,
        content: item.content
      };
    });
  }

  if (cleanGrade === '6' && targetSubject === 'biology') {
    const keys = Object.keys(CLASS6_BIOLOGY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS6_BIOLOGY_CONTENT[k];
      return {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: 'biology',
        grade: '6',
        title: item.title,
        desc: item.desc,
        lessons: 1,
        content: item.content
      };
    });
  }

  if (cleanGrade === '6' && targetSubject === 'history') {
    const keys = Object.keys(CLASS6_HISTORY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS6_HISTORY_CONTENT[k];
      return {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: 'history',
        grade: '6',
        title: item.title,
        desc: item.desc,
        lessons: 1,
        content: item.content
      };
    });
  }

  if (cleanGrade === '6' && targetSubject === 'geography') {
    const keys = Object.keys(CLASS6_GEOGRAPHY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS6_GEOGRAPHY_CONTENT[k];
      return {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: 'geography',
        grade: '6',
        title: item.title,
        desc: item.desc,
        lessons: 1,
        content: item.content
      };
    });
  }

  // CLASS 7 SUBJECT RESOLVERS
  if (cleanGrade === '7' && targetSubject === 'maths') {
    const keys = Object.keys(CLASS7_MATHS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS7_MATHS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'maths', grade: '7', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '7' && targetSubject === 'physics') {
    const keys = Object.keys(CLASS7_PHYSICS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS7_PHYSICS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'physics', grade: '7', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '7' && targetSubject === 'chemistry') {
    const keys = Object.keys(CLASS7_CHEMISTRY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS7_CHEMISTRY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'chemistry', grade: '7', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '7' && targetSubject === 'biology') {
    const keys = Object.keys(CLASS7_BIOLOGY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS7_BIOLOGY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'biology', grade: '7', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '7' && targetSubject === 'history') {
    const keys = Object.keys(CLASS7_HISTORY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS7_HISTORY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'history', grade: '7', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '7' && targetSubject === 'geography') {
    const keys = Object.keys(CLASS7_GEOGRAPHY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS7_GEOGRAPHY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'geography', grade: '7', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }

  // CLASS 8 SUBJECT RESOLVERS
  if (cleanGrade === '8' && targetSubject === 'maths') {
    const keys = Object.keys(CLASS8_MATHS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS8_MATHS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'maths', grade: '8', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '8' && targetSubject === 'physics') {
    const keys = Object.keys(CLASS8_PHYSICS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS8_PHYSICS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'physics', grade: '8', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '8' && targetSubject === 'chemistry') {
    const keys = Object.keys(CLASS8_CHEMISTRY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS8_CHEMISTRY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'chemistry', grade: '8', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '8' && targetSubject === 'biology') {
    const keys = Object.keys(CLASS8_BIOLOGY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS8_BIOLOGY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'biology', grade: '8', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '8' && targetSubject === 'history') {
    const keys = Object.keys(CLASS8_HISTORY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS8_HISTORY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'history', grade: '8', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '8' && targetSubject === 'geography') {
    const keys = Object.keys(CLASS8_GEOGRAPHY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS8_GEOGRAPHY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'geography', grade: '8', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }

  // CLASS 9 SUBJECT RESOLVERS
  if (cleanGrade === '9' && targetSubject === 'maths') {
    const keys = Object.keys(CLASS9_MATHS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS9_MATHS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'maths', grade: '9', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '9' && targetSubject === 'physics') {
    const keys = Object.keys(CLASS9_PHYSICS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS9_PHYSICS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'physics', grade: '9', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '9' && targetSubject === 'chemistry') {
    const keys = Object.keys(CLASS9_CHEMISTRY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS9_CHEMISTRY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'chemistry', grade: '9', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '9' && targetSubject === 'biology') {
    const keys = Object.keys(CLASS9_BIOLOGY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS9_BIOLOGY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'biology', grade: '9', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '9' && targetSubject === 'history') {
    const keys = Object.keys(CLASS9_HISTORY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS9_HISTORY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'history', grade: '9', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '9' && targetSubject === 'geography') {
    const keys = Object.keys(CLASS9_GEOGRAPHY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS9_GEOGRAPHY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'geography', grade: '9', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }

  // CLASS 10 SUBJECT RESOLVERS
  if (cleanGrade === '10' && targetSubject === 'maths') {
    const keys = Object.keys(CLASS10_MATHS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS10_MATHS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'maths', grade: '10', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '10' && targetSubject === 'physics') {
    const keys = Object.keys(CLASS10_PHYSICS_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS10_PHYSICS_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'physics', grade: '10', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '10' && targetSubject === 'chemistry') {
    const keys = Object.keys(CLASS10_CHEMISTRY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS10_CHEMISTRY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'chemistry', grade: '10', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '10' && targetSubject === 'biology') {
    const keys = Object.keys(CLASS10_BIOLOGY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS10_BIOLOGY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'biology', grade: '10', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '10' && targetSubject === 'history') {
    const keys = Object.keys(CLASS10_HISTORY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS10_HISTORY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'history', grade: '10', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }
  if (cleanGrade === '10' && targetSubject === 'geography') {
    const keys = Object.keys(CLASS10_GEOGRAPHY_CONTENT).filter(k => k.includes('-l'));
    return keys.map(k => {
      const item = CLASS10_GEOGRAPHY_CONTENT[k];
      return { id: item.id, chapterId: item.chapterId, subjectId: 'geography', grade: '10', title: item.title, desc: item.desc, lessons: 1, content: item.content };
    });
  }

  return gradeTemplates.map((t, idx) => ({
    id: `${t.id}-l1`,
    chapterId: t.id,
    subjectId: targetSubject,
    grade: cleanGrade,
    title: t.title,
    desc: t.desc,
    lessons: 3,
    content: t.desc
  }));
}

export function getLessonById(lessonId: string, grade: string = '8'): CurriculumChapter {
  if (!lessonId) return DEFAULT_CHAPTER;

  // 1. Direct search across all template subjects and grades
  const cleanGrade = (grade || '8').toString().replace(/^(class_?)/i, '');
  
  // Try parsing lessonId format: e.g. g10-maths-c1-l1 or g10-maths-c1
  const match = lessonId.match(/^g(\d+)-([^-]+)-c(\d+)(?:-l(\d+))?$/);
  if (match) {
    const lGrade = match[1];
    const lSubj = match[2].toLowerCase();
    const cNum = match[3];
    const lNum = match[4] || '1';

    const chapters = getChaptersBySubject(lSubj, lGrade);
    const exact = chapters.find(c => c.id === lessonId);
    if (exact) return exact;

    const chapterMatch = chapters.find(c => c.chapterId === lessonId || c.id.startsWith(lessonId + '-l'));
    if (chapterMatch) return chapterMatch;
  }

  // 1b. Check Class 6 Maths rich content
  if (CLASS6_MATHS_CONTENT[lessonId]) {
    const item = CLASS6_MATHS_CONTENT[lessonId];
    return {
      id: item.id.endsWith('-l1') ? item.id : `${item.id}-l1`,
      chapterId: item.chapterId,
      subjectId: 'maths',
      grade: '6',
      title: item.title,
      desc: item.desc,
      lessons: 3,
      content: item.content
    };
  }

  // 2. Fallback scan across all subjects
  const allSubjects = Object.keys(CURRICULUM_TEMPLATES);
  for (const sub of allSubjects) {
    for (const g of ['6', '7', '8', '9', '10']) {
      const chapters = getChaptersBySubject(sub, g);
      const found = chapters.find(c => c.id === lessonId || c.chapterId === lessonId || lessonId.startsWith(c.chapterId || ''));
      if (found) return found;
    }
  }

  // 3. Fallback for legacy 'science' lesson IDs (e.g., g6-science-c1, g8-science-c1)
  if (lessonId.includes('-science-')) {
    const physChapters = getChaptersBySubject('physics', cleanGrade);
    if (physChapters.length > 0) return physChapters[0];
  }

  return DEFAULT_CHAPTER;
}

export function checkLessonLock(
  subjectId: string, 
  idx: number, 
  completedLessons: string[], 
  grade: string = '8'
): { isLocked: boolean; status: 'completed' | 'in-progress' | 'locked' } {
  const chapters = getChaptersBySubject(subjectId, grade);
  const chapter = chapters[idx];
  
  if (!chapter) {
    return { isLocked: true, status: 'locked' };
  }
  
  const isCompleted = completedLessons.some(cId => 
    cId === chapter.id || 
    cId === chapter.chapterId || 
    (chapter.chapterId && chapter.chapterId === cId) ||
    chapter.id.startsWith(cId + '-l')
  );

  if (isCompleted) {
    return { isLocked: false, status: 'completed' };
  }
  
  return { isLocked: false, status: 'in-progress' };
}

export function calculateSubjectProgress(
  subjectId: string, 
  completedLessons: string[], 
  grade: string = '8'
): number {
  const chapters = getChaptersBySubject(subjectId, grade);
  if (!chapters.length) return 0;
  
  const completedCount = chapters.filter(c => 
    completedLessons.some(cId => 
      cId === c.id || 
      cId === c.chapterId || 
      (c.chapterId && c.chapterId === cId) ||
      c.id.startsWith(cId + '-l')
    )
  ).length;

  return Math.round((completedCount / chapters.length) * 100);
}

export async function getFirestoreChapters(subjectId: string, grade: string = '8'): Promise<CurriculumChapter[]> {
  try {
    const { db } = await import('@smartstudy/firebase');
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');

    const cleanGrade = (grade || '8').toString().replace(/^(class_?)/i, '');
    const classDocId = `class_${cleanGrade}`;

    const chapColRef = collection(db, 'curriculum', classDocId, 'subjects', subjectId, 'chapters');
    const q = query(chapColRef, orderBy('order'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: data.id || `${docSnap.id}-l1`,
          chapterId: data.chapterId || docSnap.id,
          subjectId: data.subjectId || subjectId,
          grade: cleanGrade,
          title: data.title,
          desc: data.desc || '',
          lessons: data.totalLessons || 3,
          content: data.content || ''
        };
      });
    }
  } catch (err) {
    console.warn("Firestore curriculum fetch notice (using local fallback):", err);
  }

  return getChaptersBySubject(subjectId, grade);
}
