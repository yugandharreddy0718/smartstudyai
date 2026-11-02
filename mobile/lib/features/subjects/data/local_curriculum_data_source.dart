import '../domain/curriculum_repository.dart';
import '../domain/subject_model.dart';
import '../domain/chapter_model.dart';
import '../domain/lesson_model.dart';
import '../domain/book_model.dart';

class LocalCurriculumDataSource implements CurriculumRepository {
  static const Map<String, Map<String, List<Map<String, String>>>> _curriculumData = {
    'maths': {
      '6': [
        {'id': 'g6-maths-c1', 'title': 'Knowing Our Numbers', 'desc': 'Comparing large numbers, place values, estimation, brackets, and Roman numerals.'},
        {'id': 'g6-maths-c2', 'title': 'Whole Numbers', 'desc': 'Natural numbers, whole numbers, number line, and properties of operations.'},
        {'id': 'g6-maths-c3', 'title': 'Playing with Numbers', 'desc': 'Factors, multiples, prime & composite numbers, divisibility rules, HCF & LCM.'},
        {'id': 'g6-maths-c4', 'title': 'Basic Geometrical Ideas', 'desc': 'Points, line segments, rays, curves, polygons, angles, triangles, and circles.'},
        {'id': 'g6-maths-c5', 'title': 'Understanding Elementary Shapes', 'desc': 'Measuring line segments, angles, perpendicular lines, triangles, and 3D shapes.'},
        {'id': 'g6-maths-c6', 'title': 'Integers', 'desc': 'Negative numbers, number line representation, addition and subtraction of integers.'},
        {'id': 'g6-maths-c7', 'title': 'Fractions', 'desc': 'Proper, improper, mixed fractions, equivalent fractions, and operations.'},
        {'id': 'g6-maths-c8', 'title': 'Decimals', 'desc': 'Tenths, hundredths, place value, comparing, converting, and operations on decimals.'},
        {'id': 'g6-maths-c9', 'title': 'Data Handling', 'desc': 'Recording data, organization, pictographs, and bar graphs.'},
        {'id': 'g6-maths-c10', 'title': 'Mensuration', 'desc': 'Perimeter of plane figures and area of rectangles and squares.'},
        {'id': 'g6-maths-c11', 'title': 'Algebra', 'desc': 'Introduction to variables, matchstick patterns, expressions, and equations.'},
        {'id': 'g6-maths-c12', 'title': 'Ratio and Proportion', 'desc': 'Understanding ratios, equivalent ratios, proportion, and unitary method.'}
      ],
      '7': [
        {'id': 'g7-maths-c1', 'title': 'Integers', 'desc': 'Properties of addition, subtraction, multiplication, and division of integers.'},
        {'id': 'g7-maths-c2', 'title': 'Fractions and Decimals', 'desc': 'Multiplication and division of fractions and decimal numbers.'},
        {'id': 'g7-maths-c3', 'title': 'Data Handling', 'desc': 'Mean, median, mode, double bar graphs, and chance/probability.'},
        {'id': 'g7-maths-c4', 'title': 'Simple Equations', 'desc': 'Setting up equations, solving by transposing, and real-life applications.'},
        {'id': 'g7-maths-c5', 'title': 'Lines and Angles', 'desc': 'Complementary, supplementary, adjacent, vertically opposite angles, and parallel lines.'},
        {'id': 'g7-maths-c6', 'title': 'The Triangle and Its Properties', 'desc': 'Medians, altitudes, exterior angle property, angle sum property, and Pythagoras theorem.'},
        {'id': 'g7-maths-c7', 'title': 'Comparing Quantities', 'desc': 'Percentages, ratios, profit and loss, and simple interest.'},
        {'id': 'g7-maths-c8', 'title': 'Rational Numbers', 'desc': 'Need for rational numbers, positive & negative, number line, and operations.'},
        {'id': 'g7-maths-c9', 'title': 'Perimeter and Area', 'desc': 'Area of parallelogram, triangle, circumference & area of circle.'},
        {'id': 'g7-maths-c10', 'title': 'Algebraic Expressions', 'desc': 'Terms, factors, coefficients, monomials, binomials, addition, subtraction, and formulas.'},
        {'id': 'g7-maths-c11', 'title': 'Exponents and Powers', 'desc': 'Laws of exponents, express numbers in scientific standard form.'}
      ],
      '8': [
        {'id': 'g8-maths-c1', 'title': 'Rational Numbers', 'desc': 'Properties of rational numbers, representation on number line, finding numbers between.'},
        {'id': 'g8-maths-c2', 'title': 'Linear Equations in One Variable', 'desc': 'Solving equations with variables on one and both sides, applications.'},
        {'id': 'g8-maths-c3', 'title': 'Understanding Quadrilaterals', 'desc': 'Polygons, angle sum property, types of quadrilaterals (trapezium, parallelogram, rhombus).'},
        {'id': 'g8-maths-c4', 'title': 'Data Handling', 'desc': 'Organizing data, pie charts, probability concepts.'},
        {'id': 'g8-maths-c5', 'title': 'Square and Square Roots', 'desc': 'Properties of square numbers, finding square roots by prime factorization & division.'},
        {'id': 'g8-maths-c6', 'title': 'Cube and Cube Roots', 'desc': 'Cubes of numbers, prime factorization method for cube roots.'},
        {'id': 'g8-maths-c7', 'title': 'Comparing Quantities', 'desc': 'Discount, sales tax, compound interest formula and applications.'},
        {'id': 'g8-maths-c8', 'title': 'Algebraic Expressions and Identities', 'desc': 'Multiplying polynomials, standard algebraic identities.'},
        {'id': 'g8-maths-c9', 'title': 'Mensuration', 'desc': 'Area of trapezium, general quadrilateral, surface area & volume of cube, cuboid, cylinder.'},
        {'id': 'g8-maths-c10', 'title': 'Exponents and Powers', 'desc': 'Negative exponents, laws of exponents, standard form.'},
        {'id': 'g8-maths-c11', 'title': 'Direct and Inverse Proportions', 'desc': 'Direct proportion, inverse proportion, problem solving.'},
        {'id': 'g8-maths-c12', 'title': 'Factorisation', 'desc': 'Factorization using common factors, regrouping, identities, division of polynomials.'},
        {'id': 'g8-maths-c13', 'title': 'Introduction to Graphs', 'desc': 'Bar graph, pie chart, line graph, Cartesian coordinates.'}
      ],
      '9': [
        {'id': 'g9-maths-c1', 'title': 'Number Systems', 'desc': 'Irrational numbers, real numbers, decimal expansions, rationalising denominator, laws of exponents.'},
        {'id': 'g9-maths-c2', 'title': 'Polynomials', 'desc': 'Degrees, zeroes, Remainder theorem, Factor theorem, algebraic identities.'},
        {'id': 'g9-maths-c3', 'title': 'Coordinate Geometry', 'desc': 'Cartesian plane, axes, origin, quadrants, plotting points.'},
        {'id': 'g9-maths-c4', 'title': 'Linear Equations in Two Variables', 'desc': 'Standard form ax+by+c=0, solutions, graph of linear equation.'},
        {'id': 'g9-maths-c5', 'title': 'Introduction to Euclid Geometry', 'desc': 'Definitions, axioms, postulates, Euclid fifth postulate.'},
        {'id': 'g9-maths-c6', 'title': 'Lines and Angles', 'desc': 'Intersecting lines, parallel lines & transversal, angle sum property of triangle.'},
        {'id': 'g9-maths-c7', 'title': 'Triangles', 'desc': 'Congruence criteria (SAS, ASA, SSS, RHS), properties of isosceles triangles.'},
        {'id': 'g9-maths-c8', 'title': 'Quadrilaterals', 'desc': 'Properties of parallelograms, Mid-point theorem.'},
        {'id': 'g9-maths-c9', 'title': 'Circles', 'desc': 'Angle subtended by chord, perpendicular from center, cyclic quadrilaterals.'},
        {'id': 'g9-maths-c10', 'title': 'Heron Formula', 'desc': 'Area of triangle using Heron formula s(s-a)(s-b)(s-c).'},
        {'id': 'g9-maths-c11', 'title': 'Surface Areas and Volumes', 'desc': 'Surface area & volume of right circular cone, sphere, hemisphere.'},
        {'id': 'g9-maths-c12', 'title': 'Statistics', 'desc': 'Graphical representation: bar graphs, histograms, frequency polygons.'}
      ],
      '10': [
        {'id': 'g10-maths-c1', 'title': 'Real Numbers', 'desc': 'Fundamental Theorem of Arithmetic, proving irrationality of sqrt(2), sqrt(3).'},
        {'id': 'g10-maths-c2', 'title': 'Polynomials', 'desc': 'Geometrical meaning of zeroes, relationship between zeroes and coefficients.'},
        {'id': 'g10-maths-c3', 'title': 'Pair of Linear Equations in Two Variables', 'desc': 'Graphical method, substitution method, elimination method.'},
        {'id': 'g10-maths-c4', 'title': 'Quadratic Equations', 'desc': 'Standard form, factorization, quadratic formula, nature of roots.'},
        {'id': 'g10-maths-c5', 'title': 'Arithmetic Progressions', 'desc': 'n-th term of AP, sum of first n terms.'},
        {'id': 'g10-maths-c6', 'title': 'Triangles', 'desc': 'Similar figures, Basic Proportionality Theorem (Thales), AAA, SAS, SSS similarity.'},
        {'id': 'g10-maths-c7', 'title': 'Coordinate Geometry', 'desc': 'Distance formula, Section formula.'},
        {'id': 'g10-maths-c8', 'title': 'Introduction to Trigonometry', 'desc': 'Trigonometric ratios, values at 0, 30, 45, 60, 90, trigonometric identities.'},
        {'id': 'g10-maths-c9', 'title': 'Some Applications of Trigonometry', 'desc': 'Heights and distances, line of sight, angle of elevation, angle of depression.'},
        {'id': 'g10-maths-c10', 'title': 'Circles', 'desc': 'Tangent to a circle, length of tangents from external point.'},
        {'id': 'g10-maths-c11', 'title': 'Areas Related to Circles', 'desc': 'Area of sector and segment of circle.'},
        {'id': 'g10-maths-c12', 'title': 'Surface Areas and Volumes', 'desc': 'Surface area and volume of combinations of solids.'},
        {'id': 'g10-maths-c13', 'title': 'Statistics', 'desc': 'Mean (Direct, Assumed Mean methods), Mode, Median of grouped data.'},
        {'id': 'g10-maths-c14', 'title': 'Probability', 'desc': 'Classical approach, theoretical probability, complementary events.'}
      ]
    },
    'physics': {
      '6': [
        {'id': 'g6-physics-c1', 'title': 'Motion and Measurement of Distances', 'desc': 'Story of transport, SI units, standard measurements, types of motion.'},
        {'id': 'g6-physics-c2', 'title': 'Light, Shadows and Reflections', 'desc': 'Transparent, translucent, opaque objects, shadow formation, pinhole camera, reflection.'},
        {'id': 'g6-physics-c3', 'title': 'Electricity and Circuits', 'desc': 'Electric cell, bulb, electric circuit, switch, conductors & insulators.'}
      ],
      '7': [
        {'id': 'g7-physics-c1', 'title': 'Heat and Temperature', 'desc': 'Clinical & laboratory thermometers, modes of heat transfer (conduction, convection, radiation).'},
        {'id': 'g7-physics-c2', 'title': 'Motion and Time', 'desc': 'Slow or fast motion, speed formula, simple pendulum, distance-time graphs.'},
        {'id': 'g7-physics-c3', 'title': 'Electric Current and Its Effects', 'desc': 'Heating effect, fuse, magnetic effect, electromagnet, electric bell.'},
        {'id': 'g7-physics-c4', 'title': 'Light', 'desc': 'Rectilinear propagation, concave & convex mirrors, concave & convex lenses, rainbow.'}
      ],
      '8': [
        {'id': 'g8-physics-c1', 'title': 'Force and Pressure', 'desc': 'Push & pull, contact & non-contact forces, atmospheric pressure.'},
        {'id': 'g8-physics-c2', 'title': 'Friction', 'desc': 'Factors affecting friction, static, sliding, rolling friction, advantages & disadvantages.'},
        {'id': 'g8-physics-c3', 'title': 'Sound', 'desc': 'Production of sound, human voice box, propagation medium, amplitude, frequency, pitch.'},
        {'id': 'g8-physics-c4', 'title': 'Chemical Effects of Electric Current', 'desc': 'Conductors & insulators in liquids, electroplating.'},
        {'id': 'g8-physics-c5', 'title': 'Some Natural Phenomena', 'desc': 'Static electric charge, lightning conductor, earthquakes, Richter scale, seismograph.'},
        {'id': 'g8-physics-c6', 'title': 'Light', 'desc': 'Laws of reflection, multiple reflection, human eye structure, vision defects, Braille system.'}
      ],
      '9': [
        {'id': 'g9-physics-c1', 'title': 'Motion', 'desc': 'Distance vs Displacement, speed, velocity, acceleration, uniform motion, equations of motion.'},
        {'id': 'g9-physics-c2', 'title': 'Force and Laws of Motion', 'desc': 'Balanced & unbalanced forces, Newton first, second, third laws of motion, momentum.'},
        {'id': 'g9-physics-c3', 'title': 'Gravitation', 'desc': 'Universal law of gravitation, free fall, acceleration due to gravity g, mass vs weight, buoyancy.'},
        {'id': 'g9-physics-c4', 'title': 'Work and Energy', 'desc': 'Work done by force, kinetic energy, potential energy, law of conservation of energy, power.'},
        {'id': 'g9-physics-c5', 'title': 'Sound', 'desc': 'Production & propagation of sound waves, longitudinal vs transverse, speed, echo, reverberation, ultrasound.'}
      ],
      '10': [
        {'id': 'g10-physics-c1', 'title': 'Light - Reflection and Refraction', 'desc': 'Reflection by spherical mirrors, mirror formula, magnification, Snell law, refractive index, lens formula.'},
        {'id': 'g10-physics-c2', 'title': 'The Human Eye and Colorful World', 'desc': 'Eye structure, accommodation, myopia, hypermetropia, atmospheric refraction, dispersion.'},
        {'id': 'g10-physics-c3', 'title': 'Electricity', 'desc': 'Electric current, potential difference, Ohm law, resistance, resistivity, series & parallel circuits, Joule heating.'},
        {'id': 'g10-physics-c4', 'title': 'Magnetic Effects of Electric Current', 'desc': 'Magnetic field lines, Oersted experiment, solenoid, Fleming left-hand rule, electric motor, domestic circuits.'}
      ]
    },
    'chemistry': {
      '6': [
        {'id': 'g6-chem-c1', 'title': 'Sorting Materials into Groups', 'desc': 'Appearance, hardness, solubility, buoyancy, transparency.'},
        {'id': 'g6-chem-c2', 'title': 'Separation of Substances', 'desc': 'Handpicking, winnowing, sieving, sedimentation, decantation, filtration, evaporation.'},
        {'id': 'g6-chem-c3', 'title': 'Changes Around Us', 'desc': 'Reversible and irreversible changes, physical and chemical changes.'}
      ],
      '7': [
        {'id': 'g7-chem-c1', 'title': 'Acids, Bases and Salts', 'desc': 'Natural indicators (litmus, turmeric), neutralization reaction.'},
        {'id': 'g7-chem-c2', 'title': 'Physical and Chemical Changes', 'desc': 'Rusting of iron, crystallization, chemical equations.'},
        {'id': 'g7-chem-c3', 'title': 'Water: A Precious Resource', 'desc': 'Water cycle, groundwater, water management, rainwater harvesting.'}
      ],
      '8': [
        {'id': 'g8-chem-c1', 'title': 'Synthetic Fibres and Plastics', 'desc': 'Rayon, nylon, polyester, acrylic, thermoplastics & thermosetting plastics.'},
        {'id': 'g8-chem-c2', 'title': 'Materials: Metals and Non-Metals', 'desc': 'Malleability, ductility, reactivity with oxygen & water, displacement reactions.'},
        {'id': 'g8-chem-c3', 'title': 'Coal and Petroleum', 'desc': 'Fossil fuels, refining petroleum, CNG, LPG, conservation.'},
        {'id': 'g8-chem-c4', 'title': 'Combustion and Flame', 'desc': 'Ignition temperature, types of combustion, structure of flame, calorific value.'}
      ],
      '9': [
        {'id': 'g9-chem-c1', 'title': 'Matter in Our Surroundings', 'desc': 'States of matter (solid, liquid, gas), evaporation, latent heat.'},
        {'id': 'g9-chem-c2', 'title': 'Is Matter Around Us Pure', 'desc': 'Elements, compounds, mixtures, solutions, suspensions, colloids.'},
        {'id': 'g9-chem-c3', 'title': 'Atoms and Molecules', 'desc': 'Law of conservation of mass, Dalton atomic theory, valency, molecular mass.'},
        {'id': 'g9-chem-c4', 'title': 'Structure of the Atom', 'desc': 'Thomson, Rutherford, Bohr models, subatomic particles, isotopes, isobars.'}
      ],
      '10': [
        {'id': 'g10-chem-c1', 'title': 'Chemical Reactions and Equations', 'desc': 'Combination, decomposition, displacement, double displacement, oxidation-reduction.'},
        {'id': 'g10-chem-c2', 'title': 'Acids, Bases and Salts', 'desc': 'pH scale, preparation & uses of Bleaching Powder, Baking Soda, Washing Soda, POP.'},
        {'id': 'g10-chem-c3', 'title': 'Metals and Non-Metals', 'desc': 'Ionic bonding, metallurgy, roasting, calcination, corrosion prevention.'},
        {'id': 'g10-chem-c4', 'title': 'Carbon and Its Compounds', 'desc': 'Covalent bonding, allotropes, homologous series, functional groups, saponification.'}
      ]
    },
    'biology': {
      '6': [
        {'id': 'g6-bio-c1', 'title': 'Components of Food', 'desc': 'Carbohydrates, proteins, fats, vitamins, minerals, deficiency diseases.'},
        {'id': 'g6-bio-c2', 'title': 'Getting to Know Plants', 'desc': 'Herbs, shrubs, trees, venation, photosynthesis, root types, flower structure.'},
        {'id': 'g6-bio-c3', 'title': 'Body Movements', 'desc': 'Human skeleton, joints (ball-and-socket, hinge, pivot), locomotion in animals.'},
        {'id': 'g6-bio-c4', 'title': 'The Living Organisms — Characteristics and Habitats', 'desc': 'Habitats (terrestrial, aquatic), adaptations, excretion, respiration.'}
      ],
      '7': [
        {'id': 'g7-bio-c1', 'title': 'Nutrition in Plants', 'desc': 'Autotrophic nutrition, photosynthesis, saprotrophs, symbiosis.'},
        {'id': 'g7-bio-c2', 'title': 'Nutrition in Animals', 'desc': 'Human digestive system, digestion in ruminants, Amoeba feeding.'},
        {'id': 'g7-bio-c3', 'title': 'Respiration in Organisms', 'desc': 'Aerobic & anaerobic respiration, human respiratory system, breathing in animals.'},
        {'id': 'g7-bio-c4', 'title': 'Transportation in Animals and Plants', 'desc': 'Circulatory system, heart, blood vessels, xylem, phloem, transpiration.'},
        {'id': 'g7-bio-c5', 'title': 'Reproduction in Plants', 'desc': 'Vegetative propagation, budding, fragmentation, spore formation, pollination, fertilization.'},
        {'id': 'g7-bio-c6', 'title': 'Forests: Our Lifeline', 'desc': 'Crown, canopy, decomposers, food web, forest conservation.'}
      ],
      '8': [
        {'id': 'g8-bio-c1', 'title': 'Crop Production and Management', 'desc': 'Agricultural practices: tilling, sowing, irrigation, weeding, harvesting, storage.'},
        {'id': 'g8-bio-c2', 'title': 'Microorganisms: Friend and Foe', 'desc': 'Bacteria, fungi, protozoa, algae, food preservation, nitrogen cycle.'},
        {'id': 'g8-bio-c3', 'title': 'Conservation of Plants and Animals', 'desc': 'Deforestation, biosphere reserves, Red Data Book, endemic species.'},
        {'id': 'g8-bio-c4', 'title': 'Cell — Structure and Functions', 'desc': 'Cell wall, membrane, nucleus, cytoplasm, organelles, plant vs animal cell.'},
        {'id': 'g8-bio-c5', 'title': 'Reproduction in Animals', 'desc': 'Sexual & asexual reproduction, fertilization (internal/external), metamorphosis.'},
        {'id': 'g8-bio-c6', 'title': 'Reaching the Age of Adolescence', 'desc': 'Puberty, hormones, endocrine glands, secondary sexual characters, reproductive health.'}
      ],
      '9': [
        {'id': 'g9-bio-c1', 'title': 'The Fundamental Unit of Life', 'desc': 'Plasma membrane, osmosis, diffusion, nucleus, ER, Golgi, lysosomes, mitochondria, plastids.'},
        {'id': 'g9-bio-c2', 'title': 'Tissues', 'desc': 'Plant tissues (meristematic, permanent), animal tissues (epithelial, connective, muscular, nervous).'},
        {'id': 'g9-bio-c3', 'title': 'Improvement in Food Resources', 'desc': 'Crop variety improvement, crop protection, animal husbandry, poultry, fish production.'}
      ],
      '10': [
        {'id': 'g10-bio-c1', 'title': 'Life Processes', 'desc': 'Nutrition, respiration, internal transport (circulatory), excretion in humans & plants.'},
        {'id': 'g10-bio-c2', 'title': 'Control and Coordination', 'desc': 'Nervous system, reflex arc, brain structure, plant hormones (auxins, gibberellins), human endocrine system.'},
        {'id': 'g10-bio-c3', 'title': 'How do Organisms Reproduce', 'desc': 'Fission, fragmentation, regeneration, vegetative propagation, human reproductive systems, STI prevention.'},
        {'id': 'g10-bio-c4', 'title': 'Heredity and Evolution', 'desc': 'Mendel laws of inheritance, monohybrid & dihybrid cross, sex determination.'},
        {'id': 'g10-bio-c5', 'title': 'Our Environment', 'desc': 'Ecosystem components, food chains, trophic levels, 10% law, ozone depletion, waste management.'}
      ]
    },
    'history': {
      '6': [
        {'id': 'g6-hist-c1', 'title': 'What, Where, How and When?', 'desc': 'Dates, manuscripts, inscriptions, archaeology, early river valley civilizations.'},
        {'id': 'g6-hist-c2', 'title': 'From Gathering to Growing Food', 'desc': 'Hunter-gatherers, domestication of plants & animals, early farming villages (Neolithic).'},
        {'id': 'g6-hist-c3', 'title': 'In the Earliest Cities', 'desc': 'Harappan civilization: town planning, drainage, seals, trade, craft.'},
        {'id': 'g6-hist-c4', 'title': 'What Books and Burials Tell Us', 'desc': 'Vedas, Rigveda hymns, Megaliths, burials, social differences.'},
        {'id': 'g6-hist-c5', 'title': 'Kingdoms, Kings and an Early Republic', 'desc': 'Janapadas, Mahajanapadas, Magadha, Vajji republic, taxation, varna system.'},
        {'id': 'g6-hist-c6', 'title': 'New Questions and Ideas', 'desc': 'Upanishads, Buddha teachings, Jainism, Vardhamana Mahavira, Sangha, Monasteries.'},
        {'id': 'g6-hist-c7', 'title': 'Ashoka, The Emperor Who Gave Up War', 'desc': 'Mauryan empire, Chandragupta, Kalinga war, Ashoka Dhamma, edicts, pillars.'},
        {'id': 'g6-hist-c8', 'title': 'Vital Villages, Thriving Towns', 'desc': 'Iron tools, agriculture, guilds, Arikamedu port, punch-marked coins.'},
        {'id': 'g6-hist-c9', 'title': 'Traders, Kings and Pilgrims', 'desc': 'Silk Route, Sangam poems, Cholas, Cheras, Pandyas, Bhakti movement, Fa Xian, Xuan Zang.'},
        {'id': 'g6-hist-c10', 'title': 'New Empires and Kingdoms', 'desc': 'Gupta dynasty, Samudragupta Prashasti, Harsha, Pallavas, Chalukyas, Pulakeshin II.'},
        {'id': 'g6-hist-c11', 'title': 'Buildings, Paintings and Books', 'desc': 'Iron pillar of Mehrauli, Stupas (Sanchi), cave paintings (Ajanta), Epics (Silappadikaram, Mahabharata).'}
      ],
      '7': [
        {'id': 'g7-hist-c1', 'title': 'Tracing Changes Through a Thousand Years', 'desc': 'Cartography, new social groups (Rajputs), jatis, region & empire.'},
        {'id': 'g7-hist-c2', 'title': 'New Kings and Kingdoms', 'desc': 'Emergence of new dynasties (Gurjara-Pratiharas, Rashtrakutas, Palas), Chola administration.'},
        {'id': 'g7-hist-c3', 'title': 'Delhi: 12th to 15th Century', 'desc': 'Delhi Sultanate: Tomaras, Chauhans, Slave dynasty, Khalji, Tughlaq, Sayyid, Lodi dynasties.'},
        {'id': 'g7-hist-c4', 'title': 'The Mughals: 16th to 17th Century', 'desc': 'Babur, Humayun, Akbar, Jahangir, Shah Jahan, Aurangzeb, Mansabdari & Jagirdari.'},
        {'id': 'g7-hist-c5', 'title': 'Tribes, Nomads and Settled Communities', 'desc': 'Varna-based society, Ahoms of Assam, Gonds of central India.'},
        {'id': 'g7-hist-c6', 'title': 'Devotional Paths to the Divine', 'desc': 'Bhakti movement: Nayanars, Alvars, Shankara, Ramanuja, Kabir, Guru Nanak, Sufism.'},
        {'id': 'g7-hist-c7', 'title': 'The Making of Regional Cultures', 'desc': 'Jagannatha cult, Kathak dance, Rajput miniature paintings, Bengali language growth.'},
        {'id': 'g7-hist-c8', 'title': '18th-Century Political Formations', 'desc': 'Decline of Mughal empire, successor states (Awadh, Bengal, Hyderabad), Marathas, Sikhs, Jats.'}
      ],
      '8': [
        {'id': 'g8-hist-c1', 'title': 'How, When and Where', 'desc': 'Periodization of Indian history, official records, surveys.'},
        {'id': 'g8-hist-c2', 'title': 'From Trade to Territory', 'desc': 'East India Company, Battle of Plassey (1757), Battle of Buxar, Subsidiary Alliance, Doctrine of Lapse.'},
        {'id': 'g8-hist-c3', 'title': 'Ruling the Countryside', 'desc': 'Permanent Settlement, Mahalwari system, Ryotwari system, Indigo rebellion (Blue Mutiny).'},
        {'id': 'g8-hist-c4', 'title': 'Tribals, Dikus and the Vision of a Golden Age', 'desc': 'Birsa Munda revolt, forest laws, impact on tribal livelihoods.'},
        {'id': 'g8-hist-c5', 'title': 'When People Rebel — 1857 and After', 'desc': 'Revolt of 1857: causes, Bahadur Shah Zafar, Rani Lakshmibai, suppressions, Queen Victoria Proclamation.'},
        {'id': 'g8-hist-c6', 'title': 'Civilising the Native, Educating the Nation', 'desc': 'Macaulay Minute (1835), Wood Despatch (1854), Rabindranath Tagore Shantiniketan.'},
        {'id': 'g8-hist-c7', 'title': 'Women, Caste and Reform', 'desc': 'Raja Ram Mohan Roy, Ishwar Chandra Vidyasagar, Jyotirao Phule, Swami Vivekananda, B.R. Ambedkar.'},
        {'id': 'g8-hist-c8', 'title': 'The Making of the National Movement: 1870s–1947', 'desc': 'INC formation (1885), Moderates vs Extremists, Partition of Bengal, Gandhi Swadeshi, Non-Cooperation, Civil Disobedience, Quit India.'}
      ],
      '9': [
        {'id': 'g9-hist-c1', 'title': 'The French Revolution', 'desc': 'Estate system, Storming of Bastille, Declaration of Rights of Man, Reign of Terror (Robespierre), Napoleon.'},
        {'id': 'g9-hist-c2', 'title': 'Socialism in Europe and the Russian Revolution', 'desc': 'Liberals, Radicals, Conservatives, Karl Marx, Tsar Nicholas II, 1905 Revolution, October Revolution (Lenin, Bolsheviks).'},
        {'id': 'g9-hist-c3', 'title': 'Nazism and the Rise of Hitler', 'desc': 'Weimar Republic, Treaty of Versailles, Hitler rise to power, Nazi ideology, Holocaust.'},
        {'id': 'g9-hist-c4', 'title': 'Forest Society and Colonialism', 'desc': 'Deforestation under British rule, Dietrich Brandis, Scientific Forestry, Bastar rebellion, Java forest revolts.'},
        {'id': 'g9-hist-c5', 'title': 'Pastoralists in the Modern World', 'desc': 'Gaddi, Gujjar, Maasai pastoralists, impact of colonial borders & grazing laws.'}
      ],
      '10': [
        {'id': 'g10-hist-c1', 'title': 'The Rise of Nationalism in Europe', 'desc': 'French Revolution, Napoleon Code, Liberalism, Zollverein, Revolutions of 1848, Unification of Italy & Germany.'},
        {'id': 'g10-hist-c2', 'title': 'Nationalism in India', 'desc': 'First World War impact, Satyagraha, Rowlatt Act, Jallianwala Bagh, Non-Cooperation, Salt March, Poona Pact.'},
        {'id': 'g10-hist-c3', 'title': 'The Making of a Global World', 'desc': 'Silk Routes, Conquest & Disease (Smallpox), Indentured labour, Great Depression (1929), Bretton Woods system.'},
        {'id': 'g10-hist-c4', 'title': 'The Age of Industrialisation', 'desc': 'Proto-industrialization, Steam engine (James Watt), Factory system, Hand labour vs Steam power, Indian textiles.'},
        {'id': 'g10-hist-c5', 'title': 'Print Culture and the Modern World', 'desc': 'Woodblock printing (China), Gutenberg Press, Print Revolution, Reading Mania, Censorship.'}
      ]
    },
    'geography': {
      '6': [
        {'id': 'g6-geo-c1', 'title': 'The Earth in the Solar System', 'desc': 'Celestial bodies, stars, constellations, pole star, planets, asteroids, meteoroids, moon phases.'},
        {'id': 'g6-geo-c2', 'title': 'Globe: Latitudes and Longitudes', 'desc': 'Equator, tropics, heat zones, meridians of longitude, prime meridian, standard time zones.'},
        {'id': 'g6-geo-c3', 'title': 'Motions of the Earth', 'desc': 'Rotation, revolution, orbital plane, circle of illumination, summer/winter solstice, equinox.'},
        {'id': 'g6-geo-c4', 'title': 'Maps', 'desc': 'Physical, political, thematic maps, distance, direction (cardinal points), symbols, scale.'},
        {'id': 'g6-geo-c5', 'title': 'Major Domains of the Earth', 'desc': 'Lithosphere, Atmosphere (layers), Hydrosphere, Biosphere.'},
        {'id': 'g6-geo-c6', 'title': 'Our Country — India', 'desc': 'Location, neighbors, physical divisions (Himalayas, Northern Plains, Great Indian Desert, Peninsular Plateau, Coasts, Islands).'}
      ],
      '7': [
        {'id': 'g7-geo-c1', 'title': 'Environment', 'desc': 'Natural & human environment, ecosystem, biotic & abiotic components.'},
        {'id': 'g7-geo-c2', 'title': 'Inside Our Earth', 'desc': 'Crust, mantle, core, igneous, sedimentary, metamorphic rocks, rock cycle.'},
        {'id': 'g7-geo-c3', 'title': 'Our Changing Earth', 'desc': 'Lithospheric plates, earthquakes, volcanoes, weathering, erosion by rivers, sea waves, glaciers, wind.'},
        {'id': 'g7-geo-c4', 'title': 'Air', 'desc': 'Composition of atmosphere, layers (Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere), temperature, pressure, wind, moisture.'},
        {'id': 'g7-geo-c5', 'title': 'Water', 'desc': 'Water cycle, distribution of water, ocean circulation: waves, tides, ocean currents (Gulf Stream, Labrador).'},
        {'id': 'g7-geo-c6', 'title': 'Human Environment Interactions', 'desc': 'Amazon basin life (tropical), Ganga-Brahmaputra basin life (subtropical).'},
        {'id': 'g7-geo-c7', 'title': 'Life in the Deserts', 'desc': 'Hot desert (Sahara), cold desert (Ladakh): climate, flora, fauna, people.'}
      ],
      '8': [
        {'id': 'g8-geo-c1', 'title': 'Resources', 'desc': 'Utility, value, natural, human-made, human resources, sustainable development.'},
        {'id': 'g8-geo-c2', 'title': 'Land, Soil, Water, Natural Vegetation and Wildlife Resources', 'desc': 'Land degradation, soil profile, soil erosion, water scarcity, vegetation types, conservation.'},
        {'id': 'g8-geo-c3', 'title': 'Agriculture', 'desc': 'Subsistence vs commercial farming, major crops (rice, wheat, maize, cotton, jute, coffee, tea).'},
        {'id': 'g8-geo-c4', 'title': 'Industries', 'desc': 'Secondary activities, classification, factors affecting location, Iron & Steel (Jamshedpur, Pittsburgh), Information Technology (Bengaluru, Silicon Valley).'},
        {'id': 'g8-geo-c5', 'title': 'Human Resources', 'desc': 'Population distribution, density, factors affecting distribution, population change, composition (pyramid).'}
      ],
      '9': [
        {'id': 'g9-geo-c1', 'title': 'India — Size and Location', 'desc': 'Latitudinal & longitudinal extent, Standard Meridian (82°30 E), strategic location, neighboring countries.'},
        {'id': 'g9-geo-c2', 'title': 'Physical Features of India', 'desc': 'Tectonic plates, Himalayan mountains, Northern plains, Peninsular plateau, Indian desert, Coastal plains, Islands.'},
        {'id': 'g9-geo-c3', 'title': 'Drainage', 'desc': 'Himalayan rivers (Indus, Ganga, Brahmaputra), Peninsular rivers (Narmada, Tapi, Godavari, Krishna, Kaveri), lakes, river pollution.'},
        {'id': 'g9-geo-c4', 'title': 'Climate', 'desc': 'Monsoon mechanism, factors affecting climate, seasons (cold, hot, advancing monsoon, retreating monsoon), rainfall distribution.'},
        {'id': 'g9-geo-c5', 'title': 'Natural Vegetation and Wildlife', 'desc': 'Tropical evergreen, deciduous, thorn forests, montane, mangrove, wildlife reserves, Project Tiger.'},
        {'id': 'g9-geo-c6', 'title': 'Population', 'desc': 'Population size, density, growth, migration, age structure, sex ratio, literacy, National Population Policy.'}
      ],
      '10': [
        {'id': 'g10-geo-c1', 'title': 'Resources and Development', 'desc': 'Classification of resources, resource planning, land utilization, soil types of India, soil erosion & conservation.'},
        {'id': 'g10-geo-c2', 'title': 'Forest and Wildlife Resources', 'desc': 'Biodiversity, flora & fauna depletion, reserved, protected, unclassed forests, Joint Forest Management (JFM).'},
        {'id': 'g10-geo-c3', 'title': 'Water Resources', 'desc': 'Water scarcity, multi-purpose river projects, dams (pros & cons), rainwater harvesting (Rooftop, Bamboo drip).'},
        {'id': 'g10-geo-c4', 'title': 'Agriculture', 'desc': 'Types of farming (Primitive, Intensive, Commercial), cropping seasons (Rabi, Kharif, Zaid), major food & non-food crops, Bhoodan movement.'},
        {'id': 'g10-geo-c5', 'title': 'Minerals and Energy Resources', 'desc': 'Metallic & non-metallic minerals, conventional (Coal, Petroleum, Natural Gas) & non-conventional (Solar, Wind, Nuclear, Tidal) energy.'},
        {'id': 'g10-geo-c6', 'title': 'Manufacturing Industries', 'desc': 'Importance of manufacturing, Agro-based (Textiles, Sugar) & Mineral-based (Iron & Steel, Aluminium, Chemical, Fertilizer, Auto, IT) industries, industrial pollution.'},
        {'id': 'g10-geo-c7', 'title': 'Lifelines of National Economy', 'desc': 'Transport: Roadways (Golden Quadrilateral), Railways, Waterways, Airways, Pipelines, Communication, International Trade, Tourism.'}
      ]
    }
  };

  static const List<Map<String, String>> _subjectsMeta = [
    {'id': 'maths', 'name': 'Mathematics', 'desc': 'Concepts, Worked Problems, Formulas, Step-by-Step Solutions', 'icon': 'assets/icons/math.png'},
    {'id': 'physics', 'name': 'Physics', 'desc': 'Motion, Forces, Light, Electricity, Energy & Sound', 'icon': 'assets/icons/science.png'},
    {'id': 'chemistry', 'name': 'Chemistry', 'desc': 'Matter, Atoms, Chemical Reactions, Acids & Carbon', 'icon': 'assets/icons/science.png'},
    {'id': 'biology', 'name': 'Biology', 'desc': 'Life Processes, Cells, Genetics, Reproduction & Ecosystems', 'icon': 'assets/icons/science.png'},
    {'id': 'history', 'name': 'History & Civics', 'desc': 'Civilizations, Empires, Freedom Struggle & Constitution', 'icon': 'assets/icons/history.png'},
    {'id': 'geography', 'name': 'Geography & Economics', 'desc': 'Earth, Climate, Resources, Population & Economic Development', 'icon': 'assets/icons/history.png'},
  ];

  @override
  Future<List<SubjectModel>> getSubjects(String classId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    return _subjectsMeta.map((s) {
      final key = s['id']!;
      final count = _curriculumData[key]?[cleanGrade]?.length ?? 0;
      return SubjectModel(
        id: key,
        classId: cleanGrade,
        name: s['name']!,
        description: s['desc']!,
        iconUrl: s['icon']!,
        totalChapters: count,
        order: _subjectsMeta.indexOf(s) + 1,
      );
    }).toList();
  }

  @override
  Future<List<ChapterModel>> getChapters(String classId, String subjectId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    final chaptersList = _curriculumData[subjectId]?[cleanGrade] ?? [];

    return chaptersList.asMap().entries.map((entry) {
      final idx = entry.key;
      final ch = entry.value;
      return ChapterModel(
        id: ch['id']!,
        subjectId: subjectId,
        title: ch['title']!,
        description: ch['desc']!,
        order: idx + 1,
        totalLessons: 3,
        estimatedMinutes: 45,
      );
    }).toList();
  }

  @override
  Future<List<LessonModel>> getLessons(String classId, String subjectId, String chapterId) async {
    // Each chapter contains 3 sub-lessons: l1, l2, l3
    return [
      LessonModel(
        id: '$chapterId-l1',
        chapterId: chapterId,
        title: 'Core Concept & Fundamental Theory',
        contentMarkdown: _generate13SectionContent(chapterId, 'Core Concept & Fundamental Theory', 1),
        order: 1,
        estimatedMinutes: 15,
      ),
      LessonModel(
        id: '$chapterId-l2',
        chapterId: chapterId,
        title: 'Worked Examples & Practical Applications',
        contentMarkdown: _generate13SectionContent(chapterId, 'Worked Examples & Practical Applications', 2),
        order: 2,
        estimatedMinutes: 15,
      ),
      LessonModel(
        id: '$chapterId-l3',
        chapterId: chapterId,
        title: 'Advanced Problems & Quick Revision',
        contentMarkdown: _generate13SectionContent(chapterId, 'Advanced Problems & Quick Revision', 3),
        order: 3,
        estimatedMinutes: 15,
      ),
    ];
  }

  @override
  Future<LessonModel> getLessonDetails(String classId, String subjectId, String chapterId, String lessonId) async {
    final subNum = lessonId.endsWith('-l2') ? 2 : (lessonId.endsWith('-l3') ? 3 : 1);
    final title = subNum == 1 
      ? 'Core Concept & Fundamental Theory'
      : (subNum == 2 ? 'Worked Examples & Practical Applications' : 'Advanced Problems & Quick Revision');

    return LessonModel(
      id: lessonId,
      chapterId: chapterId,
      title: title,
      contentMarkdown: _generate13SectionContent(chapterId, title, subNum),
      order: subNum,
      estimatedMinutes: 15,
    );
  }

  @override
  Future<List<BookModel>> getBooks(String classId, {String? subjectId}) async {
    return [];
  }

  static String _generate13SectionContent(String chapterId, String title, int subNum) {
    return '''# $title ($chapterId)

## 1. Learning Objectives
- Master the fundamental concepts of $chapterId.
- Apply key formulas and principles in real-world scenarios.
- Understand step-by-step problem-solving methodologies.

## 2. Introduction
Welcome to this comprehensive study module. This lesson breaks down complex topics into clear, accessible concepts with practical examples.

## 3. Detailed Concept Explanation
Here we explore the theoretical foundations, underlying mechanics, and logical structure of the topic in depth.

## 4. Important Definitions
- **Key Term 1**: Fundamental definition and technical meaning.
- **Key Term 2**: Secondary rule or quantitative relationship.

## 5. Key Concepts
1. **First Principle**: Core underlying phenomenon.
2. **Second Principle**: Derived relationship and application.

## 6. Examples
- **Example A**: Basic real-world demonstration.
- **Example B**: Extended application case study.

## 7. Step-by-Step Explanation
1. State given values and known constants.
2. Select appropriate formula or theorem.
3. Substitute values and compute step by step.
4. Verify units and physical/mathematical logic.

## 8. Formulas / Rules
- \$E = m c^2\$
- \$F = m a\$
- \$a^2 + b^2 = c^2\$

## 9. Worked Problems
### Problem 1
**Question**: Calculate the value given standard parameters.
**Solution**:
1. Identify inputs: \$x = 10\$, \$y = 5\$.
2. Compute result: \$z = x + y = 15\$.

## 10. Try Yourself
1. Solve for \$x\$ when \$2x + 4 = 12\$.
2. Explain the physical significance of energy conservation.

## 11. Common Mistakes
- Confusing units between SI and CGS systems.
- Misapplying sign conventions during calculations.

## 12. Quick Revision & Key Takeaways
- Review all core equations before starting problem set.
- Ensure all final answers include appropriate units.
''';
  }
}
