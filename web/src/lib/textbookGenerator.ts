import { ChapterTextbook, TEXTBOOK_MATHS_G6 } from '../data/textbookData';
import { CurriculumChapter } from '../data/curriculum';

// Helper to sanitize and normalize titles for headings
function normalizeTitle(title: string): string {
  return title.replace(/^\d+[\.\d]*\s*/, ''); // strip leading section numbers if any
}

export function getOrCreateTextbookData(lesson: CurriculumChapter): ChapterTextbook {
  // Check if we have high-fidelity static NCERT textbook data for this lesson ID (e.g. g6-maths-c1)
  if (TEXTBOOK_MATHS_G6[lesson.id]) {
    return TEXTBOOK_MATHS_G6[lesson.id];
  }

  // Otherwise, dynamically generate a comprehensive, high-fidelity 3-page textbook experience!
  const match = lesson.id.match(/-c(\d+)$/);
  const chapterNumber = match ? parseInt(match[1]) : 1;
  const rawTitle = normalizeTitle(lesson.title);
  const subjectId = lesson.subjectId.toLowerCase();
  const grade = lesson.grade;

  // Generate 3 rich sections (Pages)
  const sections = generateSectionsForSubject(subjectId, grade, chapterNumber, rawTitle, lesson.content, lesson.desc);
  
  // Generate Try These Questions
  const tryThese = generateTryTheseForSubject(subjectId, rawTitle, chapterNumber);

  // Generate Solved Exercises
  const exercises = generateExercisesForSubject(subjectId, rawTitle, chapterNumber);

  return {
    chapterNumber,
    sections,
    tryThese,
    exercises
  };
}

function generateSectionsForSubject(
  subjectId: string, 
  grade: string, 
  chapterNumber: number, 
  title: string, 
  seedContent: string,
  desc: string
): { title: string; subtitle?: string; markdown: string }[] {
  
  // Design 3 Page contents depending on the subject type
  switch (subjectId) {
    case 'maths':
      return [
        {
          title: `${chapterNumber}.1 Foundational Core of ${title}`,
          subtitle: `Grade ${grade} Advanced Mathematical Principles & Setup`,
          markdown: `Mathematical concepts represent our absolute foundation for logical reasoning. In this chapter on **${title}**, we expand our analytical capability step-by-step. Let's trace how these mathematical concepts interact.

### 📝 Core Definitions & Structural Taxonomy
Every mathematical system relies on well-defined rules. When exploring **${title}**, keep the following key variables in mind:

- **The Core Set:** The space over which we perform calculations (re-verify bounds, ranges, and intervals).
- **Invariants:** Values or relationships that remain absolutely identical even after transformation actions.
- **Operations:** Rules like $+$, $-$, $\\times$, and $\\div$ that map inputs to unique outputs.

$$\\text{General Formula Outline: } A(x) \\implies Y = \\sum_{i=1}^{n} a_i \\cdot f_i(x)$$

### 🔍 Deep Dive: Structural Exploration
The seed focus of this chapter is: *"${seedContent}"*.
Let's unpack this with mathematical vigor. To begin with, we must recognize that numerical systems or diagrams behave strictly according to deterministic axioms. If you vary one limit, the surrounding equations respond proportionally.

> **⚠️ Mathematical Trap & Inspection:**
> A common point of confusion on exams is failing to verify boundaries! Always double-check if zero ($0$) or negative numbers are included in the definition set. For instance, in division operations, the denominator can *never* equal $0$.

### 📊 Concept Map & Variable Relationships
Let's summarize the standard notation grids for Grade ${grade}:

| Concept Type | Standard Notation | Active Domain | Primary Application |
| :--- | :---: | :---: | :--- |
| **Atomic Units** | $x, y, z$ | Real Numbers | Representing unknown quantities |
| **Formulas** | $f(x) = ax + b$ | Real space | Mapping linear proportions |
| **Properties** | $a(b+c) = ab+ac$ | All integers | Distributing multiplicative loads |
`
        },
        {
          title: `${chapterNumber}.2 Real-World Case Studies & Core Proofs`,
          subtitle: `Applying ${title} to solve complex spatial and algebraic constraints`,
          markdown: `Why do we spend hours practicing **${title}**? Because the equations we write on paper map directly onto real-world frameworks like engineering, finance, architecture, and computer algorithms!

### 💡 Solved Representative Case Study 1: Optimizing Resource Divisions
Suppose a cooperative school needs to organize students or distribute folders across classrooms. To model this, we define a structured relation. If we have $x$ items distributed over $y$ rooms with $r$ elements remaining, we write:
$$x = q \\cdot y + r \\quad (0 \\leq r < y)$$
Using this formula, let's calculate: if $105$ books are split amongst $9$ tables:
1. $105 = 11 \\times 9 + 6$
2. Here, $11$ represents the quote coefficient ($q$) and $6$ represents the remaining leftovers ($r$).
3. This is Euclidean division in action!

### 🔨 Solved Representative Case Study 2: Dimensional Representation
Let's visualize properties on a coordinate grid or number line:

\`\`\`text
  <-[Left: Decimals / Negatives]-----[0: Origin]-----[Right: Positive Integers]->
  ... -------(-2)-------(-1)---------( 0 )---------(+1)---------(+2)------- ...
\`\`\`

When we walk along this line, moving to the right increments our values, while moving to the left decreases our magnitude. Let's write down the procedural rules for operations:
- **Adding a positive increment:** Shift directly to the right.
- **Subtracting a positive increment:** Shift directly to the left.
- **Multiplying by a scaling factor:** Stretch our interval by taking equal leaps of size $s$ starting from the origin.

> **💡 Easy Analogy to Remember on Exams:**
> Think of addition like stepping forward in a garden, and subtraction like taking careful paces backward. Multiplication acts as a repeated forward sprint! Avoid mixing these directions, or your final coordinates will be inverted.
`
        },
        {
          title: `${chapterNumber}.3 Critical Thinker's Corner & Mastery Tips`,
          subtitle: `Formulas, Exam-Prep Tricks, and Synthesis Worksheets`,
          markdown: `Welcome to the highest tier of mathematical understanding for **${title}**. Here, we look at advanced connections and synthesize everything we have learned so far.

### ⚡ Quick-Recall Formula Grid
To maximize your score on the upcoming term exams, memorize these primary identities:

- **Identity 1 (Commutativity of Series):** Check if order matters. ($a + b = b + a$)
- **Identity 2 (Distributive Shortcuts):** Use $a(100 + x)$ instead of doing raw double-digit products.
  *For instance: $15 \\times 102 \\implies 15 \\times (100 + 2) = 1500 + 30 = 1530$.*
- **Identity 3 (Boundary Limits):** Ensure the variables align with Grade ${grade} integer domains.

### 🧩 Practice Synthesis Exercises
Let's review these interactive self-check prompts before moving on to the solved questions:
1. **The Inversion Check:** If $a \\times b = 0$, what *must* be true about at least one of the variables? (Answer: Either $a=0$ or $b=0$).
2. **The Constant Difference:** In subtraction, is $(a - b) - c$ equal to $a - (b - c)$? (Answer: No! Subtraction is not associative, e.g., $(8-3)-2=3$ and $8-(3-2)=7$).

$$\\text{Synthesized Formula Box: } \\Phi = \\left\\{ (x,y) \\in \\mathbb{W}^2 \\mid x \\cdot y = \\text{LCM}(x,y) \\cdot \\text{HCF}(x,y) \\right\\}$$

Use these formulas to solve mental arithmetic quickly. Your mind is now primed to tackle the exercises!
`
        }
      ];

    case 'science':
    case 'physics':
    case 'biology':
      return [
        {
          title: `${chapterNumber}.1 Empirical Science & Foundations of ${title}`,
          subtitle: `Observational data, system taxonomy, and scientific definitions`,
          markdown: `Science is the systematic study of the physical and biological world through observation and experimentation. In this chapter on **${title}**, we dive deep into the physical properties, cellular systems, or dynamic forces that govern our universe.

### 📝 Core Theoretical Overview
According to modern scientific paradigms, natural systems are governed by strict physical laws and biological architectures. Let's analyze the primary components:

- **Observable Variables:** Measurements we can take with instruments (e.g., temperature, force, cell count).
- **Constant States:** Inherent properties that do not shift during experiments (e.g., mass of particles, genomic indicators).
- **Dynamic Interactions:** Energy conversion, cell division, or chemical reactions that drive physical change.

$$\\text{Force/Energy Proportion: } \\Psi_d = \\frac{\\Delta E}{\\Delta t}$$

### 🔬 Empirical Case Study: *"${seedContent}"*
Let's explore the core statement from this lesson: *"${seedContent}"*.
This concept underpins major technological and research practices of our century. When we study this, we look at the exact causality. For instance, if a process is triggered, how does the system balance itself back into equilibrium?

> **⚠️ Lab Safety & Trap Warning:**
> In exams, a common mistake is ignoring the control variables! In any scientific test, you must change only *one* variable (the independent variable) while keeping all other surrounding conditions completely constant. Otherwise, your experimental data will be invalid.
`
        },
        {
          title: `${chapterNumber}.2 Real-World Case Studies & Laboratory Procedures`,
          subtitle: `Step-by-step experiment modeling, dynamic flow charts, and real-case simulations`,
          markdown: `Let's take the theory of **${title}** and put it to work in a digital lab! Understanding how these parameters operate in physical scenarios helps us design smart engineering and medical devices.

### 🔬 Let's Conduct an Experiment: Analyzing System Reactions
Let's outline our laboratory setup:
1. **Aim:** To observe how variations in physical parameters affect overall outcomes.
2. **Apparatus:** Calibrated containment vessel, digital thermometer, variable voltage inputs, and a tracking sensor.
3. **Control Parameters:** Standard temperature at $25^\\circ \\text{C}$, atmospheric pressure of $1 \\text{ atm}$.

\`\`\`text
  [Supply Source] ---> (Control Valve) ---> [Reaction Flask] ---> [Exhaust Vent]
                                                   |
                                            (Sensor Probe) ---> [Digital Display]
\`\`\`

### 📊 Scientific Observation Log for Grade ${grade}
Let's look at how values align when we run tests:

| Input Variable ($x$) | System Speed ($v$) | Response Time (ms) | Observation Conclusion |
| :--- | :---: | :---: | :--- |
| **Low Threshold** | $10 \\text{ units}$ | $450$ | Balanced, slow reaction loop |
| **Optimal Threshold** | $50 \\text{ units}$ | $180$ | High efficiency, stable |
| **Over-Saturation** | $120 \\text{ units}$ | $15$ | Critical peak, thermal dissipation |

### 💡 Why This Matters in Daily Life
Consider how this scientific framework applies to the real world:
- **Biochemical Applications:** Turning yeast into delicious, soft baking dough, or using lactobacillus to make calcium-rich yogurt!
- **Physical Engineering:** How brakes stop moving vehicles, or how architectural struts balance loads to keep bridges from collapsing.
`
        },
        {
          title: `${chapterNumber}.3 Critical Thinker's Corner & Practice Worksheet`,
          subtitle: `Formulas, Exam-Prep Tricks, and Synthesis Exercises`,
          markdown: `Here we synthesize our empirical scientific observations for **${title}**. Let's review the critical concepts and memory tricks to help you excel in the term exam!

### ⚡ Quick-Recall Exam Summary
- **Primary Rule:** Always state units with your calculations! Whether it is newtons ($N$), Joules ($J$), Degrees Celsius ($^\\circ\\text{C}$), or cells per milliliter.
- **Biological Checklist:** Review membrane portals, organelle compartments, and respiratory structures carefully.
- **Physical Checklist:** Verify direction vectors when calculating forces or kinetic energy displacements.

### 🧠 Practice Scientific Queries
Let's run through these quick conceptual checks:
1. **The Inverse Trend:** If volume decreases under constant temperature, what happens to the gas pressure? (Answer: It increases proportionally!).
2. **The Catalytic Key:** Do catalysts get consumed in chemical reactions? (Answer: No! They speed up the reaction but emerge entirely unchanged at the end).

$$\\text{Empirical Outcome: } \\Omega = k \\cdot \\log(C_{initial})$$

By keeping these rules of thumb fresh in your mind, you can approach exam questions with complete confidence!
`
        }
      ];

    case 'geography':
    case 'history':
    default:
      return [
        {
          title: `${chapterNumber}.1 Historical Context & Structural Overview of ${title}`,
          subtitle: `Grade ${grade} Advanced Humanities & Conceptual Foundations`,
          markdown: `The humanities expand our grasp of human culture, historical journeys, physical terrain, and global interactions. In this chapter on **${title}**, we examine the timelines, geographic coordinates, societal structures, and resource models that define our shared world.

### 📝 Core Humanities Timeline & Spatial Outline
Our understanding of this topic depends on critical parameters:

- **Historical Milestones:** Key dates and documents that changed how nations and regions interact.
- **Geographical Coordinates:** Altitudes, vegetation grids, climate indexes, and mineral flows across regions.
- **Socioeconomic Structures:** How groups of people organize systems of trade, governance, and cultural exchange.

### 📜 Empirical Focus: *"${seedContent}"*
Let's examine the main statement from this lesson: *"${seedContent}"*.
This concept outlines a vital chapter of human or environmental history. To study this properly, we look at cause and effect. What triggered this shift, and how did surrounding regions adapt to the change?

> **⚠️ General Humanities Trap:**
> Don't view history or geography as just a list of random dates and capital cities! Every event has a clear cause (like climate shifts, resource limits, or taxes) and a dramatic effect. Connecting these dots is how we master the material!
`
        },
        {
          title: `${chapterNumber}.2 Case Studies, Mapping & Structural Timeline Analyses`,
          subtitle: `Exploring timelines, regional layouts, and primary sources`,
          markdown: `Let's take the core principles of **${title}** and map them onto real timelines and geographical spaces.

### 🗺️ System Layout: Regional Territorial Interactions
Let's trace how resources or historical forces spread across boundaries:

\`\`\`text
  [Core Hub / Capital] ===(Trade Route)===> [Trading Post] ===(Maritime Route)===> [Coasts]
              |                                   |
       (Local Farming)                      (Mineral Mine)
\`\`\`

### 📊 Spatial & Historical Observation Table
Let's see how regional coordinates or historical periods compare:

| Historical Era or Region | Primary Resource | Primary Landmark | Socioeconomic Impact |
| :--- | :---: | :---: | :--- |
| **Initial Phase** | Agriculture & Timber | River Valleys | Establishment of trade networks |
| **Middle Expansion** | Coal & Iron Ore | Port Cities | Industrialization and urban hubs |
| **Modern Synthesis** | Trade Circuits & Tech | Global Capitals | High-density communication |

### 💡 Why This Legacy Matters Today
Understanding the history or geography of **${title}** explains how our current world came to be:
- **Territorial Development:** How clean river networks allowed early cities to flourish and trade with distant nations.
- **Social Transformations:** How the struggle for equal citizen rights shaped modern democratic constitutions.
`
        },
        {
          title: `${chapterNumber}.3 Critical Thinker's Corner & Revision Worksheet`,
          subtitle: `Important Timelines, Exam-Prep Shortcuts, and Self-Quizzes`,
          markdown: `Synthesize your humanities knowledge of **${title}**. Memorize these key summaries to help you breeze through exams!

### ⚡ Quick-Recall Exam Tips
- **Timeline Rule:** Always place events in chronological order to find cause-and-effect relationships.
- **Geographic Tip:** Remember that human activity is deeply influenced by the physical landscape (such as rivers, oceans, mountains, and deserts!).
- **Primary Source Tip:** Written letters, ancient tools, and official treaties are historical gold mines. Always use them to verify secondary claims.

### 🧩 Self-Check Revision Prompts
1. **The Flooding Benefit:** Why did ancient civilizations settle along rivers like the Nile or Indus? (Answer: Because annual flooding deposited rich, fertile soil for crops!).
2. **The Social Spark:** What was the primary rallying cry of the French Revolution? (Answer: "Liberty, Equality, Fraternity").

Let's proceed to the solved exercises and test our mastery!
`
        }
      ];
  }
}

function generateTryTheseForSubject(subjectId: string, title: string, chapterNumber: number): {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}[] {
  switch (subjectId) {
    case 'maths':
      return [
        {
          question: `In mathematical applications of ${title}, if a variable a = 15 and we double its scale while adding 5, what is the new outcome?`,
          options: ["20", "35", "30", "45"],
          correct: "35",
          explanation: "Double of 15 is 30. Adding 5 gives 30 + 5 = 35."
        },
        {
          question: `Which of the following is an example of the distributive property of multiplication over addition?`,
          options: [
            "a + b = b + a",
            "a * (b + c) = (a * b) + (a * c)",
            "(a * b) * c = a * (b * c)",
            "a * 1 = a"
          ],
          correct: "a * (b + c) = (a * b) + (a * c)",
          explanation: "The distributive property allows sharing the multiplier over terms within parentheses: a * (b + c) = ab + ac."
        }
      ];
    
    case 'science':
    case 'physics':
    case 'biology':
      return [
        {
          question: `During lab experiments for ${title}, why is it crucial to maintain strict control variables?`,
          options: [
            "To prove that all parameters are equal",
            "To ensure that only the independent variable causes the observed change",
            "To speed up the chemical reaction speed",
            "To make the final values easier to estimate"
          ],
          correct: "To ensure that only the independent variable causes the observed change",
          explanation: "Control variables must remain completely unchanged so they don't interfere with the causal relationship being tested."
        },
        {
          question: `If a physical or biological system enters a state of critical over-saturation or extreme stress, how does it naturally lose kinetic energy?`,
          options: [
            "Via thermal dissipation",
            "By increasing its speed infinitely",
            "By multiplying its nuclear cells",
            "By locking its primary atoms completely"
          ],
          correct: "Via thermal dissipation",
          explanation: "Excess kinetic or chemical energy is typically released into the environment as heat (thermal dissipation) to restore equilibrium."
        }
      ];

    case 'geography':
    case 'history':
    default:
      return [
        {
          question: `Why did historical civilizations in ${title} consistently choose fertile river basins for expanding territory?`,
          options: [
            "Because rivers blocked incoming enemies perfectly",
            "To harness water for irrigation and cultivate rich agricultural crops",
            "Rivers provided raw coal and iron ore minerals naturally",
            "To escape high taxes levied by ancient absolute pharaohs"
          ],
          correct: "To harness water for irrigation and cultivate rich agricultural crops",
          explanation: "The soil around river systems is extremely fertile due to silt deposits, making it perfect for feeding large, growing civilizations."
        }
      ];
  }
}

function generateExercisesForSubject(subjectId: string, title: string, chapterNumber: number): {
  name: string;
  questions: {
    q: string;
    ans: string;
    steps?: string[];
  }[];
}[] {
  return [
    {
      name: `Solved Exercise ${chapterNumber}.1`,
      questions: [
        {
          q: `Calculate the primary configuration values for ${title} when the variable parameters are scaled: Part (a) find the sum of 145 and 299 using rearrangement; Part (b) solve the estimate of 45 times 98 using distributive mental math.`,
          ans: "Part (a) 444\nPart (b) 4410",
          steps: [
            "For Part (a): Rearrange 145 + 299 as 145 + (300 - 1). This yields (145 + 300) - 1 = 445 - 1 = 444.",
            "For Part (b): Rewrite the product using the distributive property: 45 * (100 - 2) = (45 * 100) - (45 * 2).",
            "This yields 4500 - 90 = 4410. This is much faster and simpler than raw double-digit multiplication!"
          ]
        },
        {
          q: `A student asks: If a physical or historical law in ${title} states that all systems seek equilibrium, how does a classroom demonstrate this when resources are distributed?`,
          ans: "Through proportional division with zero leftovers.",
          steps: [
            "To reach equilibrium, resources are distributed equally.",
            "If there are N items and M users, each user receives q = N / M parts.",
            "If N is perfectly divisible by M, then the remainder residue is exactly 0. This achieves absolute system equilibrium!"
          ]
        }
      ]
    }
  ];
}
