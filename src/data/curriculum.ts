// Central curriculum database for SmartStudy AI (Grades 6 to 10)

export interface CurriculumChapter {
  id: string; // e.g. g10-maths-c1
  subjectId: string;
  grade: string; // "1" to "10"
  title: string;
  desc: string;
  lessons: number;
  content: string;
  fileUrl?: string;
}

// Generate rich, grade-specific lessons dynamically or statically
const CURRICULUM_TEMPLATES: Record<string, Record<string, { title: string; desc: string; content: string }[]>> = {
  // MATHEMATICS CURRICULUM BY GRADE
  maths: {
    "1": [
      {
        title: "Counting to 20 & Numbers",
        desc: "Learn to count, read, and write numbers from 1 to 20 with ease.",
        content: "Counting is the very foundation of mathematics. In Grade 1, we start by learning numbers 1 to 20. We count objects like apples, stars, and blocks. When we group objects, we can see numbers visually. For example, 5 stars plus 1 star makes 6 stars. We also explore sequential counting: what comes after 7? It's 8! What comes before 15? It's 14! Recognizing these numbers in words (one, two, three...) and symbols is our first superpower."
      },
      {
        title: "Basic Addition & Groups",
        desc: "Introduction to adding single digit numbers together.",
        content: "Addition is putting groups together to make a larger group! If you have 3 red balloons and your friend gives you 2 blue balloons, you now have 5 balloons altogether. We write this as: 3 + 2 = 5. The '+' sign means add, and the '=' sign means equals. We can use our fingers or draw lines on paper to count groups together. Let's master single-digit adding!"
      },
      {
        title: "Fun Shapes & Colors",
        desc: "Explore circles, squares, triangles, and simple patterns.",
        content: "Shapes are everywhere around us! A wheel is a circle (perfectly round, no corners). A textbook is a rectangle (four sides with square corners). A slice of pizza is a triangle (three sides and three corners). We learn to group shapes by their features and colors. We also look at patterns, like: red, blue, red, blue, what comes next? Correct, red! Spotting shapes and patterns is how we starts our geometry journey."
      }
    ],
    "2": [
      {
        title: "Numbers Up to 100",
        desc: "Master double-digit place values, tens, and ones.",
        content: "In Grade 2, we expand our minds to numbers up to 100! We learn about Place Values. In the number 45, the '4' is in the Tens place (meaning forty) and the '5' is in the Ones place (meaning five). So, 45 is 4 tens and 5 ones. Understanding Tens and Ones makes it easy to compare numbers. Is 52 bigger than 49? Yes, because 5 tens is more than 4 tens!"
      },
      {
        title: "Interactive Subtraction",
        desc: "Removing items from a group and learning the minus sign.",
        content: "Subtraction means taking away! If you have 8 cookies and you eat 3, you are left with 5 cookies. We write this as: 8 - 3 = 5. The '-' sign is called the minus sign. Subtraction is the opposite of addition. If 5 + 3 = 8, then 8 - 3 = 5! We can use number lines or tally marks to cross out numbers as we subtract."
      },
      {
        title: "Clocks and Time",
        desc: "Tell time by looking at the hour hand and minute hand.",
        content: "Clocks help us plan our day! A clock has numbers from 1 to 12. It has two main hands: the short hand (Hour hand) and the long hand (Minute hand). When the long hand points straight up at 12, it is a brand-new hour! If the short hand points at 4, it is 4 o'clock (4:00). When the long hand points at 6, it is half-past the hour (e.g., 4:30)."
      }
    ],
    "3": [
      {
        title: "Multiplication Tables",
        desc: "Learn skip counting and multiplication facts up to 10.",
        content: "Multiplication is repeated addition! Instead of adding 3 + 3 + 3 + 3 (which equals 12), we can just say 4 times 3 (4 x 3 = 12). Learning our multiplication tables represents a huge step in elementary math. We look at tables for 2, 5, and 10 first because they have fun patterns. For example, all numbers in the 5 table end in 0 or 5!"
      },
      {
        title: "Introduction to Fractions",
        desc: "Dividing shapes into halves, thirds, and quarters.",
        content: "Fractions represent parts of a whole! Imagine sharing a delicious pizza with your best friend. If you cut it into 2 equal parts, each part is one-half (1/2). If you share it with 4 friends, you cut it into quarters (1/4). The top number (numerator) is how many parts you have, and the bottom number (denominator) is the total number of equal parts."
      },
      {
        title: "Bar Graphs & Tallies",
        desc: "Collect classroom information and display it visually.",
        content: "Graphs help us make data easy to read! If we ask 10 students what their favorite fruit is (Apple, Banana, or Mango), we can record their answers with Tally Marks. Then, we can draw a Bar Graph where the height of each bar shows how many students chose that fruit. It lets us see immediately which fruit is the most popular!"
      }
    ],
    "4": [
      {
        title: "Long Division & Remainders",
        desc: "Divide larger numbers step-by-step with safety.",
        content: "Long division is a step-by-step method for dividing larger numbers. For example, to divide 75 by 4, we see how many times 4 goes into 7 (1 time, with 3 left over). We bring down the 5 to make 35. 4 goes into 35 exactly 8 times (8 x 4 = 32), leaving a remainder of 3. Our answer is 18 with a Remainder of 3 (18 R3). We master the acronym DMSB: Divide, Multiply, Subtract, Bring down!"
      },
      {
        title: "Fractions to Decimals",
        desc: "Convert halves and quarters into decimal placements.",
        content: "Fractions and Decimals are different ways to write the same values! One-half (1/2) is exactly 0.5 in decimals. Clean fractions like one-quarter (1/4) match 0.25, and three-quarters (3/4) match 0.75. We learn about the Decimal Point, which separates whole numbers from fractional parts."
      },
      {
        title: "Perimeter & Area Basics",
        desc: "Measure boundaries and surface areas of rectangular cards.",
        content: "Perimeter is the distance all the way around a flat shape. To find the perimeter of a rectangle, you add all four sides together: P = 2 x (Length + Width). Area is the size of the surface inside those boundaries. To find the area of a rectangle, you multiply the length by the width: Area = Length x Width."
      }
    ],
    "5": [
      {
        title: "Factors & Multiples",
        desc: "Finding lowest common multiples and highest common factors.",
        content: "Factors are numbers you multiply together to get another number. For example, the factors of 12 are 1, 2, 3, 4, 6, and 12. Multiples are what you get when you multiply a number by other numbers. Multiples of 3 are 3, 6, 9, 12, 15... The Least Common Multiple (LCM) of two numbers is the smallest multiple they share. The Highest Common Factor (HCF/GCF) is the largest factor they have in common."
      },
      {
        title: "Angles & Measuring Protractor",
        desc: "Identify acute, obtuse, right, and straight angles.",
        content: "An angle is formed when two straight lines meet at a point called the vertex. We measure angles in 'degrees' (°) using a protractor. A Right Angle is exactly 90° (like the corner of a paper). An Acute Angle is smaller than 90° (sharp, like a letter A). An Obtuse Angle is larger than 90° but smaller than 180°. A Straight Angle is exactly 180° (a straight line)."
      }
    ],
    "6": [
      {
        title: "Knowing Our Numbers",
        desc: "Comparing numbers, place values, estimation, rounding off, brackets expand, and Roman numerals.",
        content: "Numbers are essential for counting and comparing quantities. In this chapter, we explore large numbers up to crores and millions. Comparing numbers helps us find the greatest and smallest in a set, which is based on the number of digits and active place values (Thousands, lakhs, crores in the Indian system, or Millions, billions in the International System). We also cover number names, expanded forms, and estimating values by rounding them to the nearest tens, hundreds, or thousands."
      },
      {
        title: "Whole Numbers",
        desc: "Predecessors, successors, whole numbers, number line operations, and properties of numbers.",
        content: "Natural numbers are our counting numbers starting from 1. When we call 0 a predecessor to 1, we get the set of Whole Numbers starting from 0. On a number line, numbers increase as we move to the right and decrease to the left. We can perform operations like addition (jumping right), subtraction (jumping left), and multiplication (taking equal interval leaps) on the number line. Whole numbers enjoy closure, commutativity, and associativity under addition and multiplication, and the distributive property of multiplication over addition."
      },
      {
        title: "Playing with Numbers",
        desc: "Learn factors, multiples, prime/composite numbers, divisibility tests, HCF, and LCM.",
        content: "A factor of a number is an exact divisor of that number, while a multiple is a product of that number and any whole number. Numbers with exactly two factors (1 and itself) are called Prime Numbers, while numbers with more than two factors are Composite Numbers. The Sieve of Eratosthenes is a wonderful ancient method to find prime numbers. We also master quick divisibility tests (for 2, 3, 4, 5, 6, 8, 9, 10, 11) using digit patterns. Finally, we calculate the Highest Common Factor (HCF/GCD) and Least Common Multiple (LCM) to solve real-world grouping problems."
      },
      {
        title: "Basic Geometrical Ideas",
        desc: "Introduction to points, line segments, lines, rays, curves, polygons, and angles.",
        content: "Geometry is everywhere! We start with a Point, which designates a fixed location. A Line Segment is the shortest path connecting two points. When we extend a segment endlessly in both directions, we get a Line. A Ray has a single starting point and goes endlessly in one direction. We also study Curves (open and closed), Polygons (simple closed figures made of line segments), Angles (formed by two rays meeting at a vertex), Triangles (three-sided polygons), Quadrilaterals (four-sided polygons), and Circles with their unique parts like radius, diameter, chord, sector, and segment."
      },
      {
        title: "Understanding Elementary Shapes",
        desc: "Measuring line segments, angles classification, triangles/quadrilaterals, and 3D shapes.",
        content: "To compare shapes we must measure their attributes. We measure line segments using rulers or dividers to avoid parallax errors. We classify Angles based on their measures using a protractor: Acute (less than 90°), Right (exactly 90°), Obtuse (between 90° and 180°), Straight (180°), and Reflex (greater than 180°). Triangles are classified by their sides (Scalene, Isosceles, Equilateral) and angles (Acute-angled, Right-angled, Obtuse-angled). We also explore quadrilaterals (Rectangles, Squares, Parallelograms, Rhombuses, Trapeziums) and 3D shapes (Cubes, Cuboids, Cylinders, Cones, Spheres, Pyramids, Prisms)."
      },
      {
        title: "Integers",
        desc: "Understanding positive and negative whole numbers, ordering, and number line math.",
        content: "In daily life, we face opposite values like profit/loss, height above sea level/depth below sea level, or temperatures above/below 0°C. To denote these, we use Negative Numbers. The set of integers includes positive whole numbers, negative numbers, and zero. On an integer number line, moving right represents adding positive integers (or subtracting negative ones), and moving left represents subtracting positive integers (or adding negative ones). Adding an integer's additive inverse is equivalent to subtracting that integer."
      },
      {
        title: "Fractions",
        desc: "Understanding proper, improper, mixed, and equivalent fractions, plus fractional addition/subtraction.",
        content: "A fraction represents a part of a whole (or group). In a fraction a/b, 'a' is the numerator and 'b' is the denominator. Proper fractions have numerators less than denominators. Improper fractions have numerators larger than denominators, which we can write as Mixed Fractions combining a whole number and a fraction. Equivalent fractions represent the same portion of a whole and are obtained by multiplying or dividing the numerator and denominator by the same number. To add or subtract fractions, we must convert unlike fractions into like fractions using their Lowest Common Multiple (LCM) as the common denominator."
      },
      {
        title: "Decimals",
        desc: "Introduce place values below one (tenths, hundredths) and operations with decimals.",
        content: "Decimals are another elegant way of writing fractions. A decimal point separates the whole number from the fractional part. Moving to the right of the decimal point, the place values become Tenths (1/10), Hundredths (1/100), and Thousandths (1/1000). We can convert fractions to decimals (e.g., dividing or finding equivalent fractions with denominators of 10, 100, etc.) and write decimals as fractions. We also learn how to add and subtract decimal values by carefully aligning their decimal points and corresponding place values."
      },
      {
        title: "Data Handling",
        desc: "Data collection, organization using tally marks, pictographs, and bar graphs.",
        content: "Data is a collection of numbers gathered to give information. To analyze data quickly, we organize it into tables using Tally Marks (where a diagonal slate crosses a bundle of 4 lines to denote 5). We can display data visually using Pictographs, where icons represent specific quantities of items. We also learn about Bar Graphs (or bar charts), where bars of uniform width and equal spacing are drawn whose vertical (or horizontal) length is proportional to the values they represent, making comparison instant and effortless."
      },
      {
        title: "Mensuration",
        desc: "Calculate perimeter and area of squares, rectangles, and regular polygons.",
        content: "Mensuration is about measuring physical space. Perimeter is the distance covered along the boundary of a closed planar shape. For a rectangle, Perimeter = 2 × (Length + Breadth). For a square, Perimeter = 4 × length of a side. For regular polygons, the perimeter is sum of all equal sides (e.g., 3 × side for an equilateral triangle). Area is the size of the flat region enclosed by a boundary. For a rectangle, Area = Length × Breadth. For a square, Area = Side × Side."
      },
      {
        title: "Algebra",
        desc: "Variables, matchstick patterns, algebraic expressions, and solving simple equations.",
        content: "In arithmetic and geometry, we deal with fixed numbers. Algebra introduces Variables—letters like x, y, n, or l representing unknown quantities that can take various values. We study matchstick geometric patterns where the number of matchsticks required for a shape is written as a generalized algebraic rule (like 2n for 'L' patterns or 3n for 'C' patterns). We construct algebraic expressions using operations (e.g., x + 10, 2y - 5). An Equation is a mathematical statement of equality with a variable, which is satisfied only by a single unique solution found through inspection or trial-and-error."
      },
      {
        title: "Ratio and Proportion",
        desc: "Explore comparison by division (ratio), checking proportions, and the unitary method.",
        content: "Sometimes comparing two quantities by subtraction isn't meaningful; instead, we compare them by division, which is called a Ratio. Ratio is denoted by ':' and has no units (the quantities compared must be in the same unit). If two ratios are equal, they are in Proportion, denoted as a:b :: c:d (or a/b = c/d). The extreme terms are 'a' and 'd', and the middle terms are 'b' and 'c'. Finally, we master the Unitary Method in which we first find the value of a single unit and then multiply it to find the value of any required number of units."
      },
      {
        title: "Symmetry",
        desc: "Reflection symmetry, search for axes are symmetry, mirror reflection, and ink bloat loops.",
        content: "Symmetry is a beautiful property found extensively in nature, art, and architecture (like the Taj Mahal). A figure has Line Symmetry (or reflection symmetry) if a line can fold it into two identical halves that match exactly. That fold line is the Axis of Symmetry or mirror line. A shape can have zero, one (like an isosceles triangle), two (like a rectangle), or multiple lines of symmetry (like a square with 4 lines, or a circle which has infinite lines of symmetry). Symmetry is closely related to mirror reflection, reversing left-right orientation while keeping length and angles unchanged."
      },
      {
        title: "Practical Geometry",
        desc: "Drawing tools, constructs of circles, line segments, line bisectors, and angle measures.",
        content: "Practical geometry teaches us how to construct precise geometric figures using specialized tools: a graduated ruler (to draw lines and measure lengths), compasses (to draw arcs and circles), dividers (to compare lengths), set-squares (to draw parallel and perpendicular lines), and protractors (to measure and draw angles). We learn step-by-step construction of a circle with a given radius, copying line segments, constructing perpendicular lines, bisecting line segments (perpendicular bisectors), bisecting angles, and drawing elegant angles of special measures (60°, 30°, 120°, 90°, 45°) without a protractor."
      }
    ],
    "7": [
      {
        title: "Rational Numbers on Scale",
        desc: "Understand positive and negative fractions as rational values.",
        content: "A rational number is any number that can be written as a fraction p/q, where p and q are integers and q is not zero. This includes all integers (since 5 can be written as 5/1), fractions (2/3), and terminating or repeating decimals (0.75 or 0.333...). We learn how to add, subtract, multiply, and divide rational numbers safely."
      },
      {
        title: "Pythagorean Theorem",
        desc: "Calculate right-angled triangle sides using A² + B² = C².",
        content: "The Pythagorean Theorem is one of the most famous rules in geometry. It applies ONLY to right-angled triangles! It says that the square of the longest side (hypotenuse, c) is equal to the sum of the squares of the other two sides (a and b): a² + b² = c². If a side is 3 and another is 4, then 3² + 4² = 9 + 16 = 25. The square root of 25 is 5, so the hypotenuse is 5."
      }
    ],
    "8": [
      {
        title: "Exponents & Powers",
        desc: "Laws of exponents, square roots, and cube roots.",
        content: "Exponents tell us how many times to multiply a number by itself. In 2³, 2 is the base and 3 is the exponent (exponent is also called power). 2³ = 2 x 2 x 2 = 8. Laws of exponents include: when multiplying similar bases, we add the exponents (2³ x 2² = 2⁵). We also learn that any number to the power of 0 is 1, and negative exponents represent inverse fractions (2⁻² = 1/2² = 1/4)."
      },
      {
        title: "Quadrilaterals & Polygons",
        desc: "Examine angles of squares, trapezoids, and parallelograms.",
        content: "A quadrilateral is any flat 2D shape with four straight sides. The sum of the interior angles of any quadrilateral is always exactly 360°! We explore special quadrilaterals: Parallelograms (opposite sides are parallel), Rectangles (parallelogram with right angles), Squares (all four sides and angles equal), and Trapeziums (only one pair of parallel sides)."
      }
    ],
    "9": [
      {
        title: "Irrational Numbers & Surds",
        desc: "Identify and calculate numbers like Pi or Square Root of 2.",
        content: "Irrational numbers are numbers that cannot be written as simple fractions p/q. Their decimals go on forever without repeating a pattern! Examples are the Square Root of 2 (√2 ≈ 1.414...) and Pi (π ≈ 3.14159...). We learn how to simplify surds and rationalize the denominators of algebraic fractions."
      },
      {
        title: "Polynomial Identities",
        desc: "Master key formulas like (A + B)² and difference of squares.",
        content: "In Grade 9 advanced algebra, we learn special polynomial expressions. Key identities include:\n1) (a + b)² = a² + 2ab + b²\n2) (a - b)² = a² - 2ab + b²\n3) (a + b)(a - b) = a² - b²\nThese identities help us factorize complex equations instantly without manual expansion."
      }
    ],
    "10": [
      {
        title: "Real Numbers & Primes",
        desc: "Euclid's division lemma, fundamental theorem of arithmetic.",
        content: "The concept of real numbers dates back to ancient mathematics. A real number is any value that can represent a quantity along a continuous line. It includes both rational numbers and irrational numbers. Given positive integers a and b, Euclid's Division Lemma states unique integers q and r exist satisfying a = bq + r, where 0 ≤ r < b. We also apply prime factorization to cryptography."
      },
      {
        title: "Polynomials & Degrees",
        desc: "Understanding polynomial degrees, zeroes of a polynomial, and division.",
        content: "A polynomial is an algebraic expression consisting of variables and coefficients, involving only addition, subtraction, multiplication, and non-negative integer exponents. The highest power of x in p(x) is its degree. Linear is degree 1, quadratic is degree 2, and cubic is degree 3. We look at the relationship of zeroes: for ax² + bx + c, sum is -b/a, product is c/a."
      },
      {
        title: "Quadratic Equations in Depth",
        desc: "Standard forms, roots, factorizations, and the quadratic formula.",
        content: "A quadratic equation in the variable x is of the form ax² + bx + c = 0 (a ≠ 0). We can solve it using factorization, completing the square, or the Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a. The term (b² - 4ac) is the Discriminant (D). If D > 0, roots are distinct; D = 0, roots are equal; D < 0, there are no real roots."
      }
    ]
  },

  // SCIENCE CURRICULUM BY GRADE
  science: {
    "1": [
      {
        title: "Living vs. Non-Living Things",
        desc: "What makes something alive? Plants, animals, and toys.",
        content: "Our world is covered with living and non-living things! Living things (like cats, flowers, and you!) need food, water, and air to survive. They grow larger, move around, and make baby versions of themselves. Non-living things (like rocks, books, and teddy bears) do not eat, breathe, or grow on their own. They stay exactly the same until we move them!"
      },
      {
        title: "My Five Senses",
        desc: "Sight, hearing, touch, taste, and smell explorations.",
        content: "We discover the world using our 5 beautiful senses! We SEE with our eyes, HEAR with our ears, TOUCH things with our skin, TASTE sweet and salty foods with our tongue, and SMELL flowers with our nose. Our senses send signals to our brain, helping us learn what is around us and stay safe."
      }
    ],
    "2": [
      {
        title: "Plants & Their Parts",
        desc: "Roots, stems, leaves, flowers, and how they grow.",
        content: "Plants are incredible! They use soil, water, and sunshine to make their own food. The ROOTS grow underground to drink water and hold the plant steady. The STEM acts like a straw, carrying water up to the LEAVES. The leaves absorb sunlight. Finally, some plants grow colorful FLOWERS that turn into delicious fruits!"
      },
      {
        title: "Animal Families & Habits",
        desc: "Mammals, birds, fish, and insects habitats.",
        content: "Animals are categorized into different groups. Birds have feathers and wings to fly. Fish have scales and fins to swim in water. Mammals (like dogs, whales, and humans) have fur or hair and feed milk to their babies. Insects have 6 legs and a hard outer skeleton. Every animal lives in a special home called a habitat!"
      }
    ],
    "3": [
      {
        title: "The Water Cycle",
        desc: "Evaporation, condensation, rain, and storage.",
        content: "The water on Earth is recycled over and over! When the warm Sun heats up puddles, oceans, and rivers, water turns into an invisible gas and rises into the sky. This is called EVAPORATION. High in the cold sky, the water gas cools down and forms clouds. This is CONDENSATION. When clouds get heavy, water falls back as rain or snow. This is PRECIPITATION."
      },
      {
        title: "States of Matter",
        desc: "Solid, Liquid, and Gas features with water examples.",
        content: "Everything around us is made of 'matter'. Matter comes in 3 main forms: 1) SOLIDS (like ice or metal) have a fixed shape. 2) LIQUIDS (like water or juice) flow and take the shape of whatever bottle you pour them in. 3) GASES (like steam or air) spread out to fill up all available space. Heat can change matter from solid to liquid, or liquid to gas!"
      }
    ],
    "4": [
      {
        title: "Digestion & Human Food Hubs",
        desc: "Discover how your body breaks down foods for energy.",
        content: "When you eat an apple, your body turns it into fuel! The journey starts in the MOUTH where teeth chew food. SALIVA starts breaking it down. Next, food travels down the ESOPHAGUS tube into the STOMACH, where strong acids churn it into a liquid paste. It then goes to the SMALL INTESTINE, which absorbs healthy nutrients, and finally the LARGE INTESTINE before waste leaves the body."
      },
      {
        title: "Weather & Climates",
        desc: "Learn about temperature, winds, and atmospheric clouds.",
        content: "Weather is what is happening outside right now (sunny, windy, rainy, cold). Climate is the average weather pattern of a place over many years (e.g., deserts have hot, dry climates; rainforests have warm, wet climates). Thermometers measure heat, and wind vanes point in the direction of moving air currents."
      }
    ],
    "5": [
      {
        title: "Our Solar System",
        desc: "Meet the Sun, the 8 planets, and our moon.",
        content: "We live on a giant space rock called Earth! Earth is one of 8 planets orbiting a massive star called the SUN. The planets, in order from the Sun, are: Mercury, Venus, Earth, Mars (rocky planets), Jupiter, Saturn, Uranus, and Neptune (called gas giants). The Sun's intense gravity shields all of these planets in their perfect round orbits."
      },
      {
        title: "Simple Machines",
        desc: "Pulleys, levers, inclined planes, and wheels.",
        content: "Simple machines make physical work easier! A LEVER (like a see-saw) helps lift heavy rocks. An INCLINED PLANE (like an entrance ramp) makes it easy to roll boxes up into a truck. A PULLEY uses a wheel and rope to drag buckets of water up from deep wells. These simple systems reduce the raw force we need to lift items."
      }
    ],
    "6": [
      {
        title: "Food and Nutrients",
        desc: "Carbohydrates, fats, proteins, vitamins, and minerals.",
        content: "For a healthy body, we must eat a balanced diet with 5 essential nutrients. Carbohydrates (rice, bread) provide quick, clean energy. Proteins (beans, eggs) are the building blocks that repair muscles. Fats (oils, nuts) store energy and keep us warm. Vitamins and Minerals (vitamins A, C, D, calcium, iron) keep our organs and immune system strong!"
      },
      {
        title: "Electricity & Circuits",
        desc: "How current flows through switches, batteries, and bulbs.",
        content: "Electricity is the flow of tiny charged particles called electrons. For electricity to do work (like lighting up a bulb), it must travel through a continuous loop called a CIRCUIT. A complete circuit requires: 1) A power source (battery), 2) A path (copper wire), 3) A load (light bulb), and 4) A Switch, which opens or closes the path to control the current."
      }
    ],
    "7": [
      {
        title: "Nutrition in Plants & Animals",
        desc: "Autotrophic photosynthesis and heterotrophic systems.",
        content: "Plants are Autotrophs, meaning they create their own food! They use chloroplasts containing green chlorophyll to trap sunlight, combined with Carbon Dioxide and Water, during PHOTOSYNTHESIS (6CO₂ + 6H₂O + Sun → C₆H₁₂O₆ + 6O₂). Animals are Heterotrophs, meaning they must eat other living things to absorb chemical energy."
      },
      {
        title: "Heat Transfer Mechanisms",
        desc: "Conduction, convection, and electromagnetic radiation.",
        content: "Heat is thermal energy that always flows from hot objects to cold objects. It transfers in 3 beautiful ways: 1) CONDUCTION (direct contact: a spoon getting hot in hot tea), 2) CONVECTION (currents in fluids: boiling water rising and sinking), and 3) RADIATION (electromagnetic waves: solar rays crossing empty space to warm the Earth)."
      }
    ],
    "8": [
      {
        title: "Cell Structure & Organelles",
        desc: "Differences between plant cells and animal cells.",
        content: "Cells are the building blocks of life! All cells have a Cell Membrane (outer skin) and Cytoplasm (jelly content) holding the Nucleus (control center containing DNA). Plant cells have two unique parts: a rigid outer Cell Wall made of cellulose for structural safety, and green Chloroplasts, which act as solar panels to make sugar."
      },
      {
        title: "Force & Pressure",
        desc: "Learn about contact/non-contact forces and atmosphere pressure.",
        content: "A force is a push or pull on an object. Contact forces include friction and muscular force. Non-contact forces act at a distance, like gravity, magnetism, and static electricity. Pressure is force applied per unit area (P = Force / Area). The air around us exerts Atmospheric Pressure, which is strongest at sea level."
      }
    ],
    "9": [
      {
        title: "Atoms & Molecules",
        desc: "Introduction to Dalton's atomic theory, protons, neutrons, and electrons.",
        content: "Dalton's Atomic Theory states that all matter is made of tiny, indivisible particles called Atoms. Modern science reveals atoms have subatomic particles: a central nucleus of positively charged Protons and neutral Neutrons, surrounded by negatively charged Electrons. Molecules are formed when multiple atoms chemically lock together."
      },
      {
        title: "Matter in Our Surroundings",
        desc: "Characteristics of particles of matter, diffusion, and evaporation.",
        content: "Matter is composed of tiny moving particles. These particles possess kinetic energy which increases as temperature rises. We observe Diffusion, the intermixing of particles of different matter on their own (like spelling perfume across a room). Evaporation is a surface phenomenon where liquid turns into vapor below boiling point, causing cooling."
      }
    ],
    "10": [
      {
        title: "Chemical Reactions in Depth",
        desc: "Writing/balancing equations, combination/decomposition reactions.",
        content: "A chemical reaction involves breaking and making bonds between atoms to produce new substances. Chemical equations balance coefficients to respect the Law of Conservation of Mass (e.g., 2H₂ + O₂ → 2H₂O). Modern classes group these into: Combination, Decomposition, Displacement, and Double Displacement reactions."
      },
      {
        title: "Acids, Bases & Salts Mastery",
        desc: "Determining pH scores, litmus indicator colors, and salt synthesis.",
        content: "Acids liberate H+ ions in aqueous solutions and turn blue litmus red. Bases liberate OH- ions and turn red litmus blue. The pH scale measures this acidity on a log scale from 0 to 14. When acids react with bases, they form salts and water in a Neutralization reaction (HCl + NaOH → NaCl + H₂O)."
      },
      {
        title: "Metals & Reactivity Series",
        desc: "Chemical and physical boundaries of metals and metallurgy extraction.",
        content: "Metals are lustrous, malleable, ductile, and excellent electrical conductors. We organize metals in a Reactivity Series based on how aggressively they react with oxygen, steam, and acids. Extraction of pure elements involves ore concentration, chemical reduction of metal oxides, and electrical refining."
      }
    ]
  },

  // GEOGRAPHY CURRICULUM BY GRADE
  geography: {
    "1": [
      {
        title: "My School & Neighborhood Map",
        desc: "Learn about directions, surroundings, and playground rules.",
        content: "Geography starts right in your playground! We look at maps of our classroom and neighborhood. We identify where the teacher's desk is, where our sandbox is, and where the park is. This helps us understand 'relative position': who sits on your left? What building is next to our school? Finding our way is our first step in exploring the globe."
      }
    ],
    "2": [
      {
        title: "My Country and Flag",
        desc: "Introduce continents, oceans, and country layout.",
        content: "We live on a huge round Earth! Earth is divided into 7 giant land pieces called Continents (Asia, Africa, North America, South America, Antarctica, Europe, Australia) and 5 massive saltwater bodies called Oceans. Every student lives in a special country with its own laws, landmarks, capital city, and colorful national flags!"
      }
    ],
    "3": [
      {
        title: "Landforms and Landscapes",
        desc: "Mountains, hills, valleys, plains, and coastlines.",
        content: "The surface of our Earth is not flat! It is covered with beautiful land shapes. MOUNTAINS are very tall and rocky, often with snowy tops. HILLS are smaller and rounded. VALLEYS are the low spaces between mountains. PLAINS are flat lands where grass and crops grow. ISLANDS are pieces of land totally surrounded by water!"
      }
    ],
    "4": [
      {
        title: "Maps and Scales",
        desc: "How to read compass directions and map legends.",
        content: "A map is a mini drawing of a real place! To use a map like an explorer, we must understand the COMPASS, which points North, South, East, and West (NSEW). We also use a Map Key or Legend, which has symbols (like a tiny tree for a forest, or blue lines for rivers). A map scale helps us convert centimeters on paper into real-world miles!"
      }
    ],
    "5": [
      {
        title: "Climates & Forest Zones",
        desc: "Rainforests, deserts, grasslands, and tundra spaces.",
        content: "Different parts of Earth have completely different weather patterns! Near the warm Equator line, we find tropical RAINFORESTS packed with green plants and monkey species. If we go to dry areas, we find hot DESERTS where camels live. If we travel to the far North, we find the icy TUNDRA, which remains frozen most of the year."
      }
    ],
    "6": [
      {
        title: "The Earth in our Solar System",
        desc: "Earth's rotation, revolution, latitudes, and longitudes.",
        content: "Earth is a unique sphere that rotates on its axis once every 24 hours, causing Day and Night. It revolves around the Sun once every 365.25 days, causing our Seasons. To pin-point coordinates, geographers drew imaginary grid lines: Latitudes (horizontal lines, with the Equator at 0°) and Longitudes (vertical lines starting at Greenwich, London)."
      }
    ],
    "7": [
      {
        title: "Inside Our Earth",
        desc: "The Crust, Mantle, Core layers, and tectonic plates.",
        content: "The Earth is like a giant onion with 3 distinct shells: 1) CRUST: the thin, cold outer layer we walk on (5-35km thick). 2) MANTLE: a thick layer of semi-molten hot rock called magma. 3) CORE: a central sphere consisting of a liquid outer core and a solid iron-nickel inner core. Movement in these rocks can cause earthquakes!"
      }
    ],
    "8": [
      {
        title: "Resource Types & Soil Erosion",
        desc: "Categorizing global resources and tackling soil degradation.",
        content: "Resources are things in nature we utilize to meet human needs. We classify them as Natural, Human-made, or Renewable. Soil is a vital renewable natural resource that takes thousands of years to enrich. Soil Erosion happens when high winds or heavy rains sweep away fertile topsoil. We prevent this using terrace farming and contour plowing."
      }
    ],
    "9": [
      {
        title: "Physical Features of Earth",
        desc: "Himalayas, plateau regions, coastal plains, and desert basins.",
        content: "Earth possesses rich geographical lands formed over millions of years by plate tectonics. We study major landform subdivisions: towering young fold Mountains (like the Himalayas), flat elevated Plateaus (rich in minerals), vast fertile alluvial Plains, sandy coastal islands, and hot desert basins."
      }
    ],
    "10": [
      {
        title: "Resources & Soils in Depth",
        desc: "Classifying soils and analyzing global conservation efforts.",
        content: "Soil is a highly complex ecological matrix of minerals, organic matter, gases, and liquids. Our lessons compare major variants: Alluvial Soil (rich in potash, deposited by river basins), Black Cotton Soil (rich in clay, retains moisture), Red and Yellow Soils (derived from igneous rocks), and highly leached Laterite Soils."
      }
    ]
  },

  // HISTORY CURRICULUM BY GRADE
  history: {
    "1": [
      {
        title: "My Personal Timeline",
        desc: "How we grow and remember events from our past.",
        content: "History is simply the story of what happened before today! We start by looking at our own history: when you were a small baby, you couldn't run or speak. Then, you learned to crawl, walk, and speak words. Now, you are a student! We call this timeline our history, and we document it with photographs and diaries."
      }
    ],
    "2": [
      {
        title: "History of Homes and Families",
        desc: "How our grandparents lived. Changes in houses and transport.",
        content: "Long ago, houses looked very different. People didn't have smartphones, cars, or television! Grandparents used to ride horses or walk, write letters by handwriting, and cook on wood fires. Over time, invention and technology changed how we live. Thinking about the past helps us understand our present world!"
      }
    ],
    "3": [
      {
        title: "The Stone Age Era",
        desc: "Early humans, cave paintings, and discovering fire.",
        content: "Thousands of years ago, early humans didn't build brick houses or cities. They were Nomads, moving around to find fruits and hunt animals. They made tools from rocks and stones, which is why we call this the STONE AGE. Their life changed forever when they discovered how to rub dry rocks together to spark FIRE!"
      }
    ],
    "4": [
      {
        title: "Ancient Egypt Civilizations",
        desc: "Pharaohs, Nile flooding, and historical pyramids.",
        content: "The ancient Egyptians built one of the greatest civilizations in human history near the Nile River. The river's annual flooding created fertile black soil for crops. Egyptians were ruled by highly powerful kings called Pharaohs. They invented papyrus paper, hieroglyph writing, and built massive stone Pyramids to bury their kings!"
      }
    ],
    "5": [
      {
        title: "Ancient Greece & Olympics",
        desc: "Athens, Spartans, city-states, and sports traditions.",
        content: "Ancient Greece was divided into small independent cities called City-States, like democratic Athens and military Sparta. The Greeks contributed to philosophy, theater, and mathematics. In 776 BC, they launched the Olympic Games in Olympia, where athletes from all over Greece competed to win crowns made of olive leaves!"
      }
    ],
    "6": [
      {
        title: "Early Civilizations and Cities",
        desc: "Discovery of Harappa and the ancient Indus Valley cities.",
        content: "Around 4,500 years ago, advanced cities grew along the Indus River basin (parts of modern India and Pakistan). Archaeologists discovered Harappa and Mohenjo-Daro, showing incredible urban planning with grids, double-story brick houses, covered drainage systems, and a massive public bathing pool called the Great Bath."
      }
    ],
    "7": [
      {
        title: "The Medieval Empires",
        desc: "Vikings, feudal Europe, and major trade routes.",
        content: "The Medieval Period (often styled the Middle Ages) lasted from the 5th to the 15th century. In Europe, the Feudal System divided land among lords and serfs. Across Asia, empires developed along the historic Silk Road, a network of trade paths routing silk, porcelain, spices, and scientific discoveries between Rome and China."
      }
    ],
    "8": [
      {
        title: "Industrial Revolution & Changes",
        desc: "Steam engines, massive factories, and urban expansion.",
        content: "In the late 18th century, Britain witnessed the Industrial Revolution. Inventions like James Watt's Steam Engine replaced manual human labor with coal-powered steam machinery. Hand-loom weaving became massive textile factories. While this accelerated output, it caused rapid overcrowding and air pollution in industrial cities."
      }
    ],
    "9": [
      {
        title: "The French Revolution (1789)",
        desc: "Storming of the Bastille and the birth of democracy.",
        content: "Before 1789, France was kept under an absolute monarch, Louis XVI. French society was split into three estates, with the poorest peasants bearing all taxes. On July 14, 1789, rebels stormed the Bastille prison, sparking a massive social revolution under the slogan 'Liberty, Equality, Fraternity' and writing equal citizen rights."
      }
    ],
    "10": [
      {
        title: "Nationalism in Europe & India",
        desc: "Napoleon's civil codes, Satyagraha values, and the Salt March.",
        content: "During the 19th century, nationalism swept Europe, replacing absolute dynasties with independent unified states. In India, Gandhiji united millions under non-violent Satyagraha ('truth force'). In 1930, he walked 240 miles to Dandi during the Salt March to break the British salt monopoly, triggering the major Civil Disobedience movement."
      }
    ]
  },

  // PHYSICS CURRICULUM BY GRADE (Middle to High School, Grades 6 to 10)
  physics: {
    "6": [
      {
        title: "Friction & Basic Forces",
        desc: "Understanding friction, inertia, and mass actions.",
        content: "Physics is the study of how things move and interact! Friction is a force that resists motion when two surfaces touch. When you slide a toy car on a carpet, it stops quickly because carpets are rough (high friction). If you slide it on smooth glass, it goes far because there is less friction! We also explore gravity, which holds us on the ground."
      }
    ],
    "7": [
      {
        title: "Light & Optical Shadows",
        desc: "Learn about light paths, transparent filters, and shadows.",
        content: "Light travels in perfectly straight lines! This straight path is called 'rectilinear propagation'. An object is OPAQUE if it blocks all light (like wood, casting solid dark shadows). TRANSPARENT objects let all light pass through (like glass), and TRANSLUCENT objects allow only some light to pass through (wax paper, causing blur)."
      }
    ],
    "8": [
      {
        title: "Electric Currents & Switches",
        desc: "Discover positive charges, negative charges, and conductors.",
        content: "Electric currents require path circuits. Materials that allow electricity to flow easily are called Conductors (metals like copper and aluminum). Materials that block electricity are Insulators (plastic, wood, rubber). A switch works by disconnecting the wires, breaking the electron flow instantly."
      }
    ],
    "9": [
      {
        title: "Laws of Motion (Newton)",
        desc: "Action and reaction, inertia, F=MA equations.",
        content: "Sir Isaac Newton composed three famous Laws of Motion:\n1) Inertia: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.\n2) Acceleration: Force = Mass x Acceleration (F = ma).\n3) Action-Reaction: For every active force, there is an equal and opposite reaction."
      }
    ],
    "10": [
      {
        title: "Light Reflection & Refraction",
        desc: "Lenses, focal length calculations, and Snell's Law.",
        content: "Light exhibits wave particle duality. Reflection bounces light rays off smooth mirrors (1/f = 1/v + 1/u). Refraction is the bending of light rays when entering a medium of different optical density (e.g., from air into water). This behavior is detailed by Snell's Law: Ratio of sines of angles is constant."
      }
    ]
  },

  // BIOLOGY CURRICULUM BY GRADE (Middle to High School, Grades 6 to 10)
  biology: {
    "6": [
      {
        title: "Plant Life & Seeds",
        desc: "How seeds germinate. Photosynthesis basics.",
        content: "Biology is the study of living organisms! Plants start their lives as tiny seeds. With water, oxygen, and soil, they germinate and shoot stems upwards into the light. Using green chlorophyll inside leaves, they convert solar rays, water, and CO2 into sugars and clean oxygen during daily photosynthesis."
      }
    ],
    "7": [
      {
        title: "Human breathing & Organs",
        desc: "Inhaling oxygen, lungs, and carbon-dioxide exhaust.",
        content: "Our body needs oxygen to extract energy from foods! When we inhale, air goes down the trachea into our dual Lungs. Lungs contain tiny blood-packed capsules called alveoli, which absorb oxygen and release carbon-dioxide waste, which we exhale. This continuous breath keeps us energized!"
      }
    ],
    "8": [
      {
        title: "Microorganisms & Spores",
        desc: "Bacteria, fungi, viruses, and helpful yeasts.",
        content: "We live with billions of tiny organisms invisible to the naked eye called microbes! They include bacteria, fungi, algae, and protozoa. Some are harmful (causing colds/flu), but many are incredibly helpful (like yeast, which helps bread rise, or lactobacillus bacteria, which turns milk into yogurt)."
      }
    ],
    "9": [
      {
        title: "Cell Organelles in Depth",
        desc: "Nucleus, membrane portals, and plant chloroplasts.",
        content: "All biological systems are composed of cells. Cells contain specialized internal parts called organelles. The Nucleus acts as the command center containing DNA blueprints. Mitochondria are the powerhouses generating chemical energy. Ribosomes synthesize proteins, and lysosomes recycle metabolic wastes."
      }
    ],
    "10": [
      {
        title: "Control & Coordination Systems",
        desc: "The Human nervous system, cerebral regions, and hormones.",
        content: "Living organisms coordinate behaviors through nervous impulses and hormones. The Central Nervous System (Brain and Spinal Cord) works with cranial nerves. The cerebrum thinking region tracks voluntary acts, while hormones (e.g. adrenaline, thyroxine) guide long-term development."
      }
    ]
  }
};

// Fallback chapter for unmatched URLs or generic loaders
export const DEFAULT_CHAPTER: CurriculumChapter = {
  id: 'g10-maths-c1',
  subjectId: 'maths',
  grade: '10',
  title: 'Real Numbers & Primes',
  desc: 'Basics of sets, Euclid\'s division algorithm, and fundamental theorem of arithmetic.',
  lessons: 5,
  content: `This is a sample learning material. Real numbers consist of all points on a continuous line. They include rational integers, fractions, and irrational values such as pi or root 2.`
};

export function getChaptersBySubject(subjectId: string, grade: string = '8'): CurriculumChapter[] {
  // Ensure the grade matches a valid template string
  const cleanGrade = grade || '8';
  const templates = CURRICULUM_TEMPLATES[subjectId] || {};
  const gradeTemplates = templates[cleanGrade] || templates['8'] || templates['10'] || [];
  
  if (gradeTemplates.length === 0) {
    // Return empty array or default if not supported (e.g., physics/biology in early grades)
    return [];
  }

  return gradeTemplates.map((t, idx) => ({
    id: `g${cleanGrade}-${subjectId}-c${idx + 1}`,
    subjectId,
    grade: cleanGrade,
    title: t.title,
    desc: t.desc,
    lessons: 4 + idx * 2,
    content: t.content
  }));
}

export function getLessonById(lessonId: string, grade: string = '8'): CurriculumChapter {
  // Parse lesson ID format: e.g. g10-maths-c1 or just look up dynamically
  const match = lessonId.match(/^g(\d+)-([^-]+)-c(\d+)$/);
  if (match) {
    const lessonGrade = match[1];
    const subjectId = match[2];
    const idx = parseInt(match[3]) - 1;
    
    const chapters = getChaptersBySubject(subjectId, lessonGrade);
    if (chapters[idx]) {
      return chapters[idx];
    }
  }

  // Fallback scan
  for (const sub of Object.keys(CURRICULUM_TEMPLATES)) {
    for (const g of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']) {
      const chapters = getChaptersBySubject(sub, g);
      const found = chapters.find(c => c.id === lessonId);
      if (found) return found;
    }
  }

  return DEFAULT_CHAPTER;
}

export function checkLessonLock(subjectId: string, idx: number, completedLessons: string[], grade: string = '8'): { isLocked: boolean; status: 'completed' | 'in-progress' | 'locked' } {
  const chapters = getChaptersBySubject(subjectId, grade);
  const chapter = chapters[idx];
  
  if (!chapter) {
    return { isLocked: true, status: 'locked' };
  }
  
  const isCompleted = completedLessons.includes(chapter.id);
  if (isCompleted) {
    return { isLocked: false, status: 'completed' };
  }
  
  // All chapters are unlocked by default
  return { isLocked: false, status: 'in-progress' };
}

export function calculateSubjectProgress(subjectId: string, completedLessons: string[], grade: string = '8'): number {
  const chapters = getChaptersBySubject(subjectId, grade);
  if (!chapters.length) return 0;
  
  const completedCount = chapters.filter(c => completedLessons.includes(c.id)).length;
  return Math.round((completedCount / chapters.length) * 100);
}
