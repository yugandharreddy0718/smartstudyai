// High-fidelity NCERT Textbook content with Solved Exercises, Try These, and Interactive Diagrams
export interface TextbookSection {
  title: string;
  subtitle?: string;
  markdown: string;
  diagramHtml?: string; // Optional custom Tailwind-based visual aids/calculators
}

export interface TryTheseQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface SolvedExercise {
  name: string; // e.g. "Exercise 1.1"
  questions: {
    q: string;
    ans: string;
    steps?: string[];
  }[];
}

export interface ChapterTextbook {
  chapterNumber: number;
  sections: TextbookSection[];
  tryThese: TryTheseQuestion[];
  exercises: SolvedExercise[];
}

export const TEXTBOOK_MATHS_G6: Record<string, ChapterTextbook> = {
  // CHAPTER 1: KNOWING OUR NUMBERS
  "g6-maths-c1": {
    chapterNumber: 1,
    sections: [
      {
        title: "1.1 Introduction & Comparing Numbers",
        subtitle: "How we align digits and discover place values",
        markdown: `Counting things is easy for us now. We can count objects in large numbers, for example, the number of students in the school, and represent them through numerals. We can also communicate large numbers using suitable number names.

### Comparing Numbers
As we have done quite a lot of this earlier, let us see if we remember which is the greatest among these:
1. $92, 392, 4456, 89742$ $\rightarrow$ **$89742$ is the greatest** (it has the most digits!)
2. $1902, 1920, 9201, 9021, 9210$ $\rightarrow$ **$9210$ is the greatest** (comparing thousands first, then hundreds, then tens).

> **Rule for Comparison:**
> - First, compare the number of digits. The number with **more digits** is always greater.
> - If the number of digits is the same, compare the leftmost digits. If they are the same, move to high place values one by one from left to right (Hundreds, Tens, Ones).`
      },
      {
        title: "1.2 Shift of digits & Place Value Systems",
        subtitle: "Indian vs International Systems of Numeration",
        markdown: `When we move digits from one place to another, the value shifts dramatically.
For example, in $182$, if we swap $1$ and $8$, it becomes $812$ (much larger) or if we put $1$ at the end it becomes $281$.

### The Placement Boxes
To read large numbers without confusion, we write them in place value grids. Let's compare how we count large numbers:

| System | Ones | Tens | Hundreds | Thousands | Ten Thousands | Lakhs / Hundred Thousands | Ten Lakhs / Millions | Crores / Ten Millions |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Indian** | $1$ | $10$ | $100$ | $1,000$ | $10,000$ | $1,00,000$ (Lakh) | $10,00,000$ (10 Lakh) | $1,00,00,000$ (Crore) |
| **International** | $1$ | $10$ | $100$ | $1,000$ | $10,000$ | $100,000$ | $1,000,000$ (Million) | $10,000,000$ (10 Million) |

### Use of Commas
In the **Indian System**, commas are used to mark thousands, lakhs, and crores. The first comma comes after the Hundreds place (3 digits from right), then after every 2 digits:
*Example: $5,08,01,592$ is read as "Five crore, eight lakh, one thousand, five hundred ninety-two."*

In the **International System**, commas are placed after every 3 digits from the right:
*Example: $50,801,592$ is read as "Fifty million, eight hundred one thousand, five hundred ninety-two."*`
      },
      {
        title: "1.3 Large Numbers in Practice & Conversions",
        subtitle: "Weights, Distances, and Capacities",
        markdown: `In daily life, we use different units to measure length, mass, and capacity:

*   **Length:**
    *   $10 \\text{ millimeters (mm)} = 1 \\text{ centimeter (cm)}$
    *   $100 \\text{ centimeters (cm)} = 1 \\text{ meter (m)} = 1000 \\text{ mm}$
    *   $1000 \\text{ meters (m)} = 1 \\text{ kilometer (km)} = 10,00,000 \\text{ mm}$
*   **Mass (Weight):**
    *   $1000 \\text{ milligrams (mg)} = 1 \\text{ gram (g)}$
    *   $1000 \\text{ grams (g)} = 1 \\text{ kilogram (kg)}$
*   **Capacity (Liquid volume):**
    *   $1000 \\text{ milliliters (ml)} = 1 \\text{ liter (l)}$

> **Key Prefix Terms:**
> - **Kilo** means $1000$ times **greater** (e.g. kilometer).
> - **Milli** means $1000$ times **smaller** (e.g. millimeter, milligram).
> - **Centi** means $100$ times **smaller** (e.g. centimeter).`
      },
      {
        title: "1.4 Estimation & Rounding Off",
        subtitle: "Making reasonable guesses in arithmetic",
        markdown: `Sometimes we don't need the exact count, only a reasonable approximation. This is called **Estimation**.

### Rounding to Nearest Tens
Look at the numbers on a ruler:
*   Numbers $1, 2, 3, 4$ are closer to $0$. We round them down to $0$.
*   Numbers $6, 7, 8, 9$ are closer to $10$. We round them up to $10$.
*   $5$ is right in the middle, but by convention, we round it up to $10$.
*Example: $17 \\rightarrow 20$, $84 \\rightarrow 80$, $215 \\rightarrow 220$.*

### Rounding to Nearest Hundreds
*   Numbers $1$ to $49$ are rounded down to $0$.
*   Numbers $51$ to $99$ are rounded up to $100$.
*   $50$ is rounded up to $100$.
*Example: $410 \\rightarrow 400$, $889 \\rightarrow 900$, $2546 \\rightarrow 2500$.*

### General Rule for Products/Sums
For a quick estimate, round each factor to its **greatest place value**, then multiply or add.
*Example: $81 \\times 479 \\rightarrow 80 \\times 500 = 40,000$.*`
      },
      {
        title: "1.5 Roman Numerals",
        subtitle: "Ancient writing system rules",
        markdown: `The Romans used seven basic symbols to denote numbers:

| Roman Symbol | I | V | X | L | C | D | M |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Value** | $1$ | $5$ | $10$ | $50$ | $100$ | $500$ | $1000$ |

### Rules of Roman Numerals:
1.  **Repetition:** If a symbol is repeated, its value is added. A symbol cannot be repeated more than three times. ($XX = 20, XXX = 30$, but $40$ is not $XXXX$). *V, L, and D are never repeated.*
2.  **Addition:** If a symbol of smaller value is written to the right of a larger value, we add its value: $VI = 5 + 1 = 6$, $XII = 10 + 2 = 12$.
3.  **Subtraction:** If a symbol of smaller value is written to the left of a larger value, we subtract its value: $IV = 5 - 1 = 4$, $IX = 10 - 1 = 9$, $XL = 50 - 10 = 40$.
4.  *Note:* $V, L,$ and $D$ are never written to the left of a greater value (they are never subtracted!). $I$ can be subtracted from $V$ and $X$ only. $X$ can be subtracted from $L, C$ only.`
      }
    ],
    tryThese: [
      {
        question: "Find the greatest number among these: 382, 4972, 18, 59785, 750",
        options: ["4972", "59785", "382", "750"],
        correct: "59785",
        explanation: "59785 has 5 digits, whereas the others have 4 or fewer digits. Hence, it is the greatest."
      },
      {
        question: "Using digits 2, 8, 7, 4 without repetition, what is the smallest 4-digit number you can make?",
        options: ["2748", "2478", "8742", "2784"],
        correct: "2478",
        explanation: "To find the smallest number, arrange digits in ascending order: 2, 4, 7, 8. Thus, 2478 is the smallest."
      },
      {
        question: "How many lakhs make one million?",
        options: ["1 lakh", "10 lakhs", "100 lakhs", "5 lakhs"],
        correct: "10 lakhs",
        explanation: "Under the International system, 1 Million = 1,000,000. In the Indian system, 10 Lakhs = 10,00,000. So 10 lakhs make a million."
      },
      {
        question: "Express the number 98 in Roman Numerals.",
        options: ["LXXXXVIII", "IIC", "XCVIII", "XCVIIII"],
        correct: "XCVIII",
        explanation: "98 is 90 + 8. 90 is written as XC (100 - 10), and 8 is VIII. Putting them together, we get XCVIII."
      }
    ],
    exercises: [
      {
        name: "Exercise 1.1",
        questions: [
          {
            q: "Fill in the blanks: (a) 1 lakh = ____ ten thousand. (b) 1 million = ____ hundred thousand. (c) 1 crore = ____ ten lakh. (d) 1 crore = ____ million. (e) 1 million = ____ lakh.",
            ans: "(a) 10\n(b) 10\n(c) 10\n(d) 10\n(e) 10",
            steps: [
              "1 Lakh = 1,00,000 = 10 x 10,000 (10 ten thousand)",
              "1 Million = 1,000,000 = 10 x 100,000 (10 hundred thousand)",
              "1 Crore = 1,00,00,000 = 10 x 10,00,000 (10 ten lakh)",
              "1 Crore = 10 million (since 10,000,000 is 10 millions)",
              "1 Million = 1,000,000 = 10,00,000 (10 lakh)"
            ]
          },
          {
            q: "Place commas correctly and write the numerals: (a) Seventy-three lakh seventy-five thousand three hundred seven. (b) Nine crore five lakh forty-one. (c) Fifty-eight million four hundred twenty-three thousand two hundred two.",
            ans: "(a) 73,75,307\n(b) 9,05,00,041\n(c) 58,423,202",
            steps: [
              "Indian System placements: Crores, Lakhs, Thousands, Hundreds, Tens, Ones.",
              "(a) Seventy-three lakh (73), seventy-five thousand (75), three hundred seven (307) -> 73,75,307",
              "(b) Nine crore (9), five lakh (05), forty-one (00,041) -> 9,05,00,041",
              "(c) International: Fifty-eight million (58), four hundred twenty-three thousand (423), two hundred two (202) -> 58,423,202"
            ]
          }
        ]
      },
      {
        name: "Exercise 1.2",
        questions: [
          {
            q: "A book exhibition was held for four days in a school. The number of tickets sold at the counter on the first, second, third and final day was respectively 1094, 1812, 2050 and 2751. Find the total number of tickets sold on all the four days.",
            ans: "7,707 tickets",
            steps: [
              "Tickets sold on Day 1 = 1094",
              "Tickets sold on Day 2 = 1812",
              "Tickets sold on Day 3 = 2050",
              "Tickets sold on Day 4 = 2751",
              "Total Tickets = 1094 + 1812 + 2050 + 2751",
              "Addition: 1094 + 1812 = 2906 -> 2906 + 2050 = 4956 -> 4956 + 2751 = 7707."
            ]
          },
          {
            q: "Shekhar is a famous cricket player. He has so far scored 6980 runs in test matches. He wishes to complete 10,000 runs. How many more runs does he need?",
            ans: "3,020 runs",
            steps: [
              "Runs scored = 6980",
              "Target runs = 10,000",
              "Runs needed = Target runs - Runs scored = 10,000 - 6980",
              "Subtraction: 10,000 - 6980 = 3020 runs."
            ]
          }
        ]
      },
      {
        name: "Exercise 1.3",
        questions: [
          {
            q: "Estimate the sum using general rule: 730 + 998",
            ans: "1,700",
            steps: [
              "Round off 730 to nearest hundreds: 700 (since 30 is less than 50).",
              "Round off 998 to nearest hundreds: 1,000 (since 98 is greater than 50).",
              "Estimated sum = 700 + 1,000 = 1,700."
            ]
          },
          {
            q: "Estimate the product using general rule: 578 x 161",
            ans: "1,20,000",
            steps: [
              "Round off 578 to nearest hundreds: 600.",
              "Round off 161 to nearest hundreds: 200.",
              "Estimated product = 600 x 200 = 1,20,000."
            ]
          }
        ]
      }
    ]
  },

  // CHAPTER 2: WHOLE NUMBERS
  "g6-maths-c2": {
    chapterNumber: 2,
    sections: [
      {
        title: "2.1 Introduction & Predecessors",
        subtitle: "The counting lines and successors",
        markdown: `As we know, we use $1, 2, 3, 4,\\dots$ when we begin to count. They come naturally. Hence, mathematicians call these counting numbers **Natural Numbers**.

### Successor and Predecessor
*   **Successor:** Add $1$ to a natural number to get its successor.
    *Example: Successor of $16$ is $16 + 1 = 17$, successor of $19$ is $20$.*
*   **Predecessor:** Subtract $1$ from a natural number to get its predecessor.
    *Example: Predecessor of $17$ is $17 - 1 = 16$.*
*   *Note:* The natural number $1$ has **no predecessor** in natural numbers.

### Whole Numbers
When we add **$0$** to the collection of natural numbers, we get the collection of **Whole Numbers**:
$$W = \\{0, 1, 2, 3, 4, 5, \\dots\\}$$
- Every natural number is a whole number, but $0$ is a whole number which is not a natural number.`
      },
      {
        title: "2.2 The Number Line & Operations",
        subtitle: "Visualize arithmetic mathematically",
        markdown: `A **Number Line** is a straight line where numbers are marked at equal intervals (units):

\`\`\`text
  0     1     2     3     4     5     6     7
  |-----|-----|-----|-----|-----|-----|----->
\`\`\`

1.  **Addition on Number Line:** To add $3 + 4$, start from $3$. Since we add $4$ blocks, take $4$ jumps to the right. We land on $7$!
2.  **Subtraction on Number Line:** To subtract $7 - 5$, start from $7$. Since we subtract $5$, take $5$ leaps to the left. We land on $2$!
3.  **Multiplication on Number Line:** To multiply $4 \\times 3$, start from $0$. Take $4$ jumps of $3$ units each to the right. We land on $12$!`
      },
      {
        title: "2.3 Properties of Whole Numbers",
        subtitle: "Closure, Commutativity and Associativity keys",
        markdown: `Whole numbers exhibit amazing regular behaviors under math operations:

### 1. Closure Property
*   If we add two whole numbers, the result is always a whole number. ($5 + 7 = 12$) $\rightarrow$ *Closed under addition.*
*   If we multiply two whole numbers, the result is always a whole number. ($5 \\times 6 = 30$) $\rightarrow$ *Closed under multiplication.*
*   *Note:* Whole numbers are **not** closed under subtraction or division ($5 - 8 = -3$ which is not a whole number; $5 \\div 8 = 5/8$ which is not a whole").

### 2. Commutative Property
You can add or multiply two whole numbers in any order:
$$a + b = b + a \\quad \\text{and} \\quad a \\times b = b \\times a$$
*Example: $3 + 2 = 2 + 3 = 5$, and $4 \\times 5 = 5 \\times 4 = 20$.*

### 3. Associative Property
When grouping three or more numbers, the group order does not affect sum or product:
$$(a + b) + c = a + (b + c) \\quad \\text{and} \\quad (a \\times b) \\times c = a \\times (b \\times c)$$
*Example: $(2 + 3) + 4 = 5 + 4 = 9$; $2 + (3 + 4) = 2 + 7 = 9$.*

### 4. Distributive Property of Multiplication over Addition
This property simplifies complicated math calculations:
$$a \\times (b + c) = (a \\times b) + (a \\times c)$$
*Example: $12 \\times 35 = 12 \\times (30 + 5) = (12 \\times 30) + (12 \\times 5) = 360 + 60 = 420$.*

### 5. Identity Elements
*   **$0$ is the Additive Identity:** Adding $0$ leaves a number unchanged ($a + 0 = a$).
*   **$1$ is the Multiplicative Identity:** Multiplying by $1$ leaves a number unchanged ($a \\times 1 = a$).`
      }
    ],
    tryThese: [
      {
        question: "Find the predecessor and successor of 19,999.",
        options: ["Pred: 19998, Succ: 20000", "Pred: 20000, Succ: 19998", "Pred: 19999, Succ: 20000", "Pred: 19997, Succ: 19999"],
        correct: "Pred: 19998, Succ: 20000",
        explanation: "19,999 - 1 = 19,998 (predecessor). 19,999 + 1 = 20,000 (successor)."
      },
      {
        question: "Are all whole numbers also natural numbers?",
        options: ["Yes, absolutely", "No, because 0 is a whole number but not a natural number", "Only prime numbers are", "Depends on the operation"],
        correct: "No, because 0 is a whole number but not a natural number",
        explanation: "The set of whole numbers includes 0, which is not a natural number. So not all whole numbers are natural numbers."
      }
    ],
    exercises: [
      {
        name: "Exercise 2.1",
        questions: [
          {
            q: "Write the next three natural numbers after 10999.",
            ans: "11,000; 11,001; 11,002",
            steps: [
              "10999 + 1 = 11,000",
              "11000 + 1 = 11,001",
              "11001 + 1 = 11,002"
            ]
          },
          {
            q: "Which is the smallest whole number?",
            ans: "0",
            steps: [
              "The whole numbers start from 0: {0, 1, 2, 3...}.",
              "Therefore, 0 is the smallest whole number."
            ]
          }
        ]
      },
      {
        name: "Exercise 2.2",
        questions: [
          {
            q: "Find the sum by suitable rearrangement: 837 + 208 + 363",
            ans: "1,408",
            steps: [
              "Group numbers whose last digits sum up to 10 for easier calculation.",
              "Group (837 + 363) + 208",
              "837 + 363 = 1200",
              "Now add remaining: 1200 + 208 = 1408."
            ]
          }
        ]
      }
    ]
  },

  // CHAPTER 3: PLAYING WITH NUMBERS
  "g6-maths-c3": {
    chapterNumber: 3,
    sections: [
      {
        title: "3.1 Factors & Multiples",
        subtitle: "How divisions form the building blocks",
        markdown: `A **factor** of a number is an exact divisor of that number.
A **multiple** of a number is any product of that number and a whole number.

For example, $15 = 3 \\times 5$. Here $3$ and $5$ are factors of $15$, and $15$ is a multiple of both $3$ and $5$.

### Key observations:
1.  **$1$** is a factor of every number ($1 \\times a = a$).
2.  Every number is a **factor of itself** ($a \\times 1 = a$).
3.  Each factor of a number is **less than or equal to** that number.
4.  The number of factors of a given number is **finite** (countable).
5.  Each multiple of a number is **greater than or equal to** that number.
6.  The number of multiples of a given number is **infinite** (endless).`
      },
      {
        title: "3.2 Prime and Composite Numbers",
        subtitle: "The sieve of Eratosthenes and divisors",
        markdown: `We can categorize numbers based on the number of factors they have:

*   **Prime Numbers:** Numbers with exactly two factors (1 and the number itself).
    *Example: $2, 3, 5, 7, 11, 13, 17, 19, 23, 29\\dots$ are prime.*
*   **Composite Numbers:** Numbers with more than two factors.
    *Example: $4, 6, 8, 9, 10, 12, 14, 15\\dots$ are composite.*
*   *Note:* **$1$ is neither a prime nor a composite number.**
*   **$2$** is the smallest prime number and is the **only even prime number**! All other even numbers can be divided by 2, so they are composite.`
      },
      {
        title: "3.3 Tests for Divisibility of Numbers",
        subtitle: "Shortcut rules without doing actual long division",
        markdown: `These rules help us quickly check if a number can be divided perfectly:

*   **Divisibility by 2:** If the last digit of the number is $0, 2, 4, 6,$ or $8$ (even).
*   **Divisibility by 3:** If the **sum of all digits** is a multiple of 3.
    *Example: $219 \\rightarrow 2+1+9 = 12$ (divisible by 3, so 219 is too).*
*   **Divisibility by 4:** If the number formed by the **last two digits** is divisible by 4.
    *Example: $1936 \\rightarrow 36$ is divisible by 4, so 1936 is too.*
*   **Divisibility by 5:** If the last digit is $0$ or $5$.
*   **Divisibility by 6:** If the number is divisible by **both 2 and 3**.
*   **Divisibility by 8:** If the number formed by the **last three digits** is divisible by 8.
*   **Divisibility by 9:** If the sum of all digits is a multiple of 9.
*   **Divisibility by 10:** If the last digit is $0$.
*   **Divisibility by 11:** Check the difference between the sum of digits at odd places (from right) and sum of digits at even places. If the difference is either $0$ or divisible by 11, then the number is divisible by 11.
    *Example: $1331 \\rightarrow$ Odd places: $1+3=4$, Even places: $3+1=4$. Difference: $4-4=0$ (Divisible!).*`
      },
      {
        title: "3.4 Common Factors, HCF and LCM",
        subtitle: "The peaks of primes",
        markdown: `Using prime factorisation (dividing constantly by prime factors), we find core connections:

### Highest Common Factor (HCF / GCD)
The HCF of two or more numbers is the largest of their common factors.
To find HCF: Write the prime factorisations, trace common factors, and multiply them.
*Example: HCF of $20, 28, 36$*
*   $20 = 2 \\times 2 \\times 5$
*   $28 = 2 \\times 2 \\times 7$
*   $36 = 2 \\times 2 \\times 3 \\times 3$
*   Common prime factors are $2$ (twice). So **HCF = $2 \\times 2 = 4$.**

### Lowest Common Multiple (LCM)
The LCM of two or more numbers is the smallest number which is a multiple of all of them.
*Example: LCM of $12$ and $18$*
*   $12 = 2 \\times 2 \\times 3$
*   $18 = 2 \\times 3 \\times 3$
*   The maximum occurrence of $2$ is twice (in 12) and $3$ is twice (in 18).
*   **LCM = $2 \\times 2 \\times 3 \\times 3 = 36$.**`
      }
    ],
    tryThese: [
      {
        question: "Which of the following is a prime number?",
        options: ["15", "21", "29", "33"],
        correct: "29",
        explanation: "29 has only two factors: 1 and 29. 15 (3x5), 21 (3x7), and 33 (3x11) are composite."
      },
      {
        question: "Is 10,215 divisible by 3?",
        options: ["Yes, sum of digits is 9", "No, last digit is 5", "Yes, sum of digits is 12", "No, it's not even"],
        correct: "Yes, sum of digits is 9",
        explanation: "1 + 0 + 2 + 1 + 5 = 9. Since 9 is divisible by 3, the entire number 10,215 is divisible by 3."
      }
    ],
    exercises: [
      {
        name: "Exercise 3.1",
        questions: [
          {
            q: "Write all the factors of 24.",
            ans: "1, 2, 3, 4, 6, 8, 12, 24",
            steps: [
              "24 = 1 x 24",
              "24 = 2 x 12",
              "24 = 3 x 8",
              "24 = 4 x 6",
              "Thus, the list of factors is 1, 2, 3, 4, 6, 8, 12, 24."
            ]
          }
        ]
      }
    ]
  }
};
