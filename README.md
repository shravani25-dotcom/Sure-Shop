# TrueChoice AI

You are an expert product designer, AI engineer, full-stack developer, and hackathon strategist.

Build a polished, functional, mobile-first AI application called:

TRUEBUY

Tagline:

“Don’t ask AI what to buy. Ask AI whether you should buy.”

The project is being developed for the iQOO Hackathon under the “FinTech and Commerce” track.

The track focuses on:

Money, payments, commerce, lending, investing, and financial inclusion — built for how India actually transacts.

The application must therefore feel strongly relevant to Indian consumers and must use smartphone capabilities wherever possible.

==================================================

1. CORE PRODUCT IDEA

==================================================

TRUEBUY is an AI-powered consumer decision engine.

Most shopping applications answer:

“What should I buy?”

TRUEBUY answers:

“Should I buy this at all?”

A user can scan, photograph, paste a product link, enter a product manually, or use voice input.

TRUEBUY analyzes the product and the user's context and recommends one of six actions:

1. BUY

2. WAIT

3. BORROW

4. REPAIR

5. REFURBISH

6. RESELL

The goal is to prevent unnecessary spending and help users make financially smarter purchasing decisions.

The system should evaluate:

- Current price

- Historical/typical price

- Estimated fair price

- Product quality/value

- Expected lifetime

- Frequency of expected use

- Existing alternatives owned by the user

- Whether renting/borrowing makes more sense

- Whether repairing an existing item is better

- Refurbished alternatives

- Used-market alternatives

- Potential resale value

- User's budget

- User's purchase history

- Urgency of purchase

- Price-to-utility ratio

- Optional environmental impact

The application must NOT feel like a conventional e-commerce marketplace.

TRUEBUY is an AI decision layer that sits on top of commerce.

==================================================

2. CORE VALUE PROPOSITION

==================================================

The central problem:

Consumers are surrounded by discounts, recommendations, advertisements, limited-time offers and impulse-buying triggers.

Existing shopping platforms are optimized to help users BUY.

TRUEBUY is optimized to help users make a BETTER DECISION.

Example:

A user sees:

“₹49,999 → ₹34,999

30% OFF

Only 2 left!”

Instead of encouraging the purchase, TRUEBUY analyzes it and says:

“WAIT”

Reason:

- Current price is 12% higher than its recent average.

- Similar products are available for ₹29,999.

- You already own a similar device.

- Your expected usage is low.

- Waiting 2–4 weeks may provide better value.

This decision-first philosophy must be visible throughout the application.

==================================================

3. TARGET USERS

==================================================

Primary users:

- College students

- Young professionals

- Budget-conscious consumers

- First-time earners

- People making expensive purchases

- Users who frequently shop online

- Users who want to avoid impulsive purchases

Initially optimize the experience for Indian users.

Use INR (₹), Indian product examples, Indian shopping behaviour, UPI-related terminology where relevant, and Indian commerce context.

==================================================

4. MAIN USER FLOW

==================================================

The primary experience should take as few steps as possible.

HOME

↓

SCAN / SEARCH / PASTE LINK / VOICE

↓

PRODUCT IDENTIFICATION

↓

PERSONAL CONTEXT

↓

AI ANALYSIS

↓

TRUEBUY DECISION

↓

EXPLANATION

↓

ALTERNATIVES

↓

USER ACTION

Example:

User scans a ₹70,000 laptop.

TRUEBUY identifies:

Product:

Gaming Laptop XYZ

Current price:

₹69,999

Then asks optional context:

“What are you buying it for?”

Options:

- College

- Gaming

- Work

- Content creation

- Personal use

- Other

Then:

“How often will you use it?”

- Daily

- Several times a week

- Occasionally

- Rarely

Then AI produces:

DECISION:

WAIT

Confidence:

87%

Reason:

“The current price is above the estimated fair-price range and your expected usage does not justify the premium.”

Alternatives:

REFURBISH

₹49,999

BUY USED

₹41,000

BORROW

₹0

WAIT

Potential better price in 2–4 weeks

==================================================

5. SIX DECISION MODES

==================================================

TRUEBUY must have six possible outcomes.

--------------------------------

A. BUY

--------------------------------

Recommend BUY when:

- Product provides strong value

- Price is reasonable

- User has a legitimate need

- Expected usage is high

- Existing alternatives are insufficient

- Better alternatives aren't significantly cheaper

- Purchase fits the user's budget

Example:

“BUY — Good value for your use case.”

--------------------------------

B. WAIT

--------------------------------

Recommend WAIT when:

- Current price is unusually high

- Product is frequently discounted

- User does not need it urgently

- A new product version may launch soon

- Better pricing is likely

- The purchase appears impulsive

Example:

“WAIT — Current price is ~14% above its recent typical price.”

--------------------------------

C. BORROW

--------------------------------

Recommend BORROW when:

- Expected usage is very low

- Product is expensive

- Product is commonly available for borrowing

- Ownership provides little long-term value

Example:

“You need this projector for one presentation. Buying it for ₹12,000 may not make sense.”

--------------------------------

D. REPAIR

--------------------------------

Recommend REPAIR when:

- User already owns a similar/broken product

- Repair cost is significantly lower than replacement

- Existing product can reasonably be restored

Example:

“REPAIR — Estimated repair cost ₹2,500 vs ₹18,000 for replacement.”

--------------------------------

E. REFURBISH

--------------------------------

Recommend REFURBISH when:

- Refurbished alternatives are significantly cheaper

- Product category is suitable for refurbishment

- Warranty/condition is acceptable

- New product provides limited additional value

Example:

“REFURBISH — Save approximately ₹17,000 with a certified refurbished option.”

--------------------------------

F. RESELL

--------------------------------

Recommend RESELL when:

- User already owns an underused equivalent

- Existing product has meaningful resale value

- New purchase duplicates existing functionality

Example:

“RESELL — You already own a similar device. Selling it could recover approximately ₹15,000.”

==================================================

6. AI DECISION ENGINE

==================================================

Create a transparent scoring engine rather than relying entirely on an LLM.

Calculate a:

TRUEBUY SCORE

from 0–100.

The score should represent how financially sensible the purchase is.

Suggested factors:

Price Value: 20%

Need/Utility: 20%

Usage Frequency: 15%

Budget Compatibility: 15%

Alternative Availability: 10%

Price Timing: 10%

Existing Ownership: 5%

Resale Potential: 5%

These weights should be configurable.

The AI should combine structured scoring with an LLM explanation layer.

IMPORTANT:

Do not allow the LLM to arbitrarily invent prices, discounts, product specifications or financial information.

Use structured data wherever possible.

If real data is unavailable, clearly label values as:

“Estimated”

“Simulated”

“Based on available product data”

Never present fabricated data as verified real-world information.

==================================================

7. PERSONAL FINANCIAL CONTEXT

==================================================

Allow users to optionally create a simple financial profile.

Fields:

- Monthly income

- Monthly essential expenses

- Monthly discretionary budget

- Current savings

- Major financial goal

- Existing similar products

- Typical monthly shopping spend

Do NOT require sensitive banking credentials.

Do NOT require actual bank account access for the MVP.

The user can manually enter information.

Example:

Monthly income:

₹35,000

Essential expenses:

₹18,000

Discretionary budget:

₹7,000

Savings:

₹60,000

Major goal:

“Buy a laptop in 6 months”

TRUEBUY can then explain:

“This purchase would consume 43% of your current discretionary monthly budget.”

==================================================

8. PERSONAL PURCHASE HISTORY

==================================================

Create a simple purchase history system.

Example:

User previously purchased:

- ₹45,000 smartphone

- ₹3,000 headphones

- ₹2,500 smartwatch

- ₹5,000 shoes

When the user scans another product, TRUEBUY can identify potential duplication.

Example:

“You already own a smartwatch purchased 4 months ago.”

Therefore:

“WAIT — this purchase may duplicate an existing product.”

This is one of the key differentiators of TRUEBUY.

==================================================

9. IMPULSE PURCHASE DETECTION

==================================================

Create an optional “Impulse Risk” score.

Factors:

- Large discount claim

- Limited-time messaging

- User's recent purchase frequency

- Product similarity to recent purchases

- User's stated need

- Price relative to normal spending

- Whether the user has researched the product previously

Example:

IMPULSE RISK

78%

Explanation:

“You haven't searched for this category before, but the product is being presented with a large limited-time discount.”

The system should never shame the user.

Use neutral language.

==================================================

10. PRODUCT SCANNING

==================================================

The mobile experience should prioritize camera usage.

User taps:

“SCAN PRODUCT”

The camera opens.

Use OCR/product recognition to extract:

- Product name

- Brand

- Model

- MRP

- Current price

- Quantity

- Key specifications

If product recognition fails, allow manual correction.

Example:

Camera sees:

“Sony WH-1000XM5

₹29,999”

TRUEBUY extracts:

Brand:

Sony

Product:

WH-1000XM5

Price:

₹29,999

Category:

Headphones

Then asks:

“What are you buying it for?”

==================================================

11. SCREENSHOT ANALYSIS

==================================================

Allow users to upload a screenshot from shopping apps/websites.

TRUEBUY should extract:

- Product name

- Listed price

- Discount

- Seller

- Delivery charge

- Coupon

- Offer text

- Urgency text

Detect potentially misleading shopping pressure such as:

“Only 2 left”

“Sale ends in 10 minutes”

“20 people are viewing this”

These should NOT automatically be labelled fraudulent.

Instead use:

“Purchase pressure detected”

or

“Potential urgency-based marketing.”

==================================================

12. VOICE INTERFACE

==================================================

Add a voice input button.

User can say:

“Should I buy this phone for ₹35,000?”

or:

“I need this only for college.”

or:

“Compare this with a refurbished option.”

The system converts voice to text and processes the request.

Voice should feel natural and fast.

Use Indian English-friendly speech recognition if available.

==================================================

13. TRUEBUY RESULT SCREEN

==================================================

This is the most important screen.

Design it to be visually impressive.

Example:

--------------------------------

TRUEBUY ANALYSIS

Samsung Galaxy XYZ

₹34,999

TRUEBUY SCORE

68 / 100

🟡 WAIT

“Good product, but not a good time to buy.”

--------------------------------

WHY?

✓ Fits your budget

✓ Good expected usage

⚠ Current price is above recent average

⚠ Similar refurbished model is ₹8,000 cheaper

⚠ You already own a similar device

--------------------------------

BETTER OPTIONS

REFURBISH

₹26,999

USED

₹22,000

WAIT

Potential better price

--------------------------------

FINANCIAL IMPACT

This purchase would use:

42% of your discretionary monthly budget

--------------------------------

AI SUMMARY

“Based on your usage and current pricing,

waiting or choosing refurbished gives you

better value.”

--------------------------------

==================================================

14. EXPLANABLE AI

==================================================

Every recommendation MUST explain itself.

Never simply show:

“WAIT”

Instead show:

“WAIT because…”

Use 3–5 concise reasons.

Example:

1. Current price is above recent typical price.

2. You expect to use the product only occasionally.

3. A refurbished version offers similar functionality for less.

4. The purchase would significantly reduce your discretionary budget.

Include a:

“Show calculation”

option.

This opens the scoring breakdown.

==================================================

15. FINANCIAL SIMULATOR

==================================================

Add a feature called:

“WHAT IF?”

User can modify the purchase.

Example:

Product price:

₹30,000

Options:

BUY NOW

WAIT 1 MONTH

BUY REFURBISHED

BUY USED

BORROW

Show estimated financial difference.

Example:

BUY NOW:

₹30,000

REFURBISHED:

₹22,000

USED:

₹18,000

WAIT:

Potential saving ₹2,000–₹4,000

This should be represented visually with simple cards/charts.

==================================================

16. RESALE VALUE

==================================================

For eligible products, estimate:

Purchase price:

₹50,000

Expected resale after 1 year:

₹30,000

Effective ownership cost:

₹20,000

This introduces a better financial metric:

EFFECTIVE COST OF OWNERSHIP

Formula:

Effective Cost =

Purchase Price - Expected Resale Value

Optionally account for maintenance.

==================================================

17. COST PER USE

==================================================

Introduce:

COST PER USE

Example:

₹10,000 camera

Expected usage:

100 times

Cost per use:

₹100

Compare this with:

Rental:

₹500/use

Therefore:

BUY may make sense.

Another example:

₹12,000 projector

Expected usage:

3 times

Cost per use:

₹4,000

Therefore:

BORROW/RENT is recommended.

This should be one of the signature features.

==================================================

18. OPTIONAL ENVIRONMENTAL LAYER

==================================================

Include environmental impact as a secondary factor, NOT the primary purpose.

Show:

Estimated environmental impact

and compare:

NEW

REFURBISHED

USED

REPAIR

Example:

NEW:

Estimated impact: High

REFURBISHED:

Estimated impact: Lower

REPAIR:

Estimated impact: Lowest

Always label environmental values as estimates unless backed by reliable data.

The primary decision should remain financial + practical.

==================================================

19. HOME SCREEN

==================================================

Design a premium minimalist home screen.

Top:

TRUEBUY

“Think before you buy.”

Primary action:

[ 📷 Scan a product ]

Secondary actions:

[ 🔗 Paste product link ]

[ 🎙 Ask TRUEBUY ]

[ 🖼 Analyze screenshot ]

Then:

Recent decisions

Example:

Laptop

WAIT

Headphones

BUY

Camera

BORROW

At the bottom:

Home

History

Insights

Profile

==================================================

20. INSIGHTS DASHBOARD

==================================================

Create a personal dashboard showing:

Money potentially saved

Number of purchases avoided

Number of WAIT decisions

Number of BUY decisions

Number of REPAIR recommendations

Number of REFURBISH recommendations

Estimated savings

Example:

THIS MONTH

₹7,850

Potentially saved

12

Purchases analyzed

4

Purchases avoided

2

Better alternatives found

This creates a strong long-term value proposition.

==================================================

21. PURCHASE HISTORY

==================================================

Each decision should be stored.

Example:

August 28

Gaming headphones

₹8,999

WAIT

August 25

Laptop stand

₹1,499

BUY

August 20

Projector

₹12,000

BORROW

Users can open each decision to see the reasoning.

==================================================

22. UI/UX DESIGN

==================================================

The design should feel premium, modern and mobile-first.

Avoid making it look like:

- A generic finance dashboard

- A traditional banking application

- A basic e-commerce site

Visual direction:

- Minimal

- Clean

- High contrast

- Large typography

- Rounded cards

- Smooth transitions

- Subtle animations

- Strong visual hierarchy

- Very little unnecessary text

Use a premium smartphone-app aesthetic inspired by modern flagship-device UX.

Do not overuse gradients.

Use colors semantically:

BUY → positive

WAIT → caution

BORROW → neutral

REPAIR → practical

REFURBISH → alternative

RESELL → financial recovery

Do not make the entire interface overly colorful.

==================================================

23. DEMO MODE

==================================================

Create a fully functional DEMO MODE for the hackathon.

The judges should be able to test TRUEBUY without entering personal financial information.

Include 5 demo products:

1. Smartphone

2. Laptop

3. Headphones

4. Camera

5. Projector

Each should produce a different recommendation.

Example:

Smartphone:

WAIT

Laptop:

BUY

Projector:

BORROW

Headphones:

REFURBISH

Old smartphone:

RESELL

This demonstrates the intelligence of the decision engine.

==================================================

24. HACKATHON DEMO FLOW

==================================================

The main demo should take less than 2 minutes.

Demo:

1. Open TRUEBUY.

2. Tap Scan.

3. Scan/select a ₹35,000 smartphone.

4. TRUEBUY identifies it.

5. User selects “College + Daily use”.

6. AI analyzes the purchase.

7. Result:

   WAIT

8. Show:

   Current price

   Fair price

   Budget impact

   Existing similar device

9. Tap “What if?”

10. Compare:

    Buy new

    Refurbished

    Used

    Wait

11. Show potential savings.

12. Ask using voice:

    “What if I only need this for 3 months?”

13. AI changes recommendation:

    BORROW

14. Finish with:

    “TRUEBUY doesn't help you buy more.

     It helps you buy better.”

This should be the hero demonstration.

==================================================

25. INDIA-SPECIFIC FEATURES

==================================================

The application should feel built for India.

Use:

- INR

- Indian pricing patterns

- Indian shopping behaviour

- UPI terminology where relevant

- Local/online commerce

- Refurbished and used markets

- Students and first-time earners

- EMI awareness

- Budget-conscious decision making

Optional future feature:

Compare:

UPFRONT PRICE

vs

EMI COST

Example:

₹60,000 upfront

vs

₹5,499 × 12 months

Show:

Total EMI cost:

₹65,988

Difference:

₹5,988

This must be presented as a transparent calculation, not financial advice.

==================================================

26. TECHNICAL ARCHITECTURE

==================================================

Preferred architecture:

Frontend:

React / Next.js or equivalent

Mobile-first responsive UI.

Backend:

Node.js / Python FastAPI

Database:

PostgreSQL / Supabase / Firebase

AI:

Use a suitable LLM for reasoning and explanation.

Computer Vision:

OCR + image/product recognition.

Voice:

Speech-to-text API or browser/mobile speech recognition.

Product intelligence:

Use APIs where available.

For hackathon reliability, create a local/mock product dataset so the core demo works even without external APIs.

==================================================

27. AI ARCHITECTURE

==================================================

Do NOT make the entire system a single chatbot.

Use a pipeline:

INPUT

↓

OCR / Product Recognition

↓

Product Information Extraction

↓

Structured Data

↓

Personal Context

↓

Decision Engine

↓

AI Explanation Layer

↓

Recommendation

The decision engine should generate structured output such as:

{

  "decision": "WAIT",

  "score": 68,

  "confidence": 0.87,

  "reasons": [

    "...",

    "...",

    "..."

  ],

  "alternatives": [],

  "estimated_savings": 4500

}

The LLM should turn this structured output into a natural explanation.

==================================================

28. DATA SAFETY

==================================================

Do not request:

- UPI PIN

- Bank password

- Card CVV

- Banking credentials

- OTP

Do not connect to real bank accounts in the MVP.

Allow users to manually enter financial information.

Clearly state:

“TRUEBUY provides decision support, not financial advice.”

==================================================

29. OFFLINE / DEMO RELIABILITY

==================================================

The hackathon demo must not depend entirely on internet APIs.

Create fallback/demo data.

If product recognition fails:

Allow:

“Use demo product”

If price API fails:

Use stored product data.

If LLM API fails:

Use deterministic decision-engine responses.

The application must never display a blank/error screen during the demo.

==================================================

30. FUTURE VISION

==================================================

Design the architecture so TRUEBUY could eventually become a phone-level shopping intelligence layer.

Potential future integrations:

- Browser shopping assistant

- Screenshot analysis

- Share-sheet integration

- Shopping notification analysis

- Voice assistant

- Camera

- UPI/payment intent warnings

- Personal financial context

- Price tracking

- Used/refurbished marketplaces

- Local commerce

The long-term vision:

TRUEBUY becomes the intelligence layer between:

USER

and

COMMERCE.

Instead of helping companies sell more,

TRUEBUY helps consumers make better decisions.

==================================================

31. HACKATHON POSITIONING

==================================================

The pitch should emphasize:

PROBLEM:

Modern commerce is optimized for conversion, not consumer decision quality.

Consumers encounter:

- Discounts

- FOMO

- personalized recommendations

- EMI offers

- urgency

- endless product choices

But consumers lack a personal decision engine that answers:

“Is this actually worth buying for ME?”

SOLUTION:

TRUEBUY combines:

AI

+

Computer Vision

+

Voice

+

Price Intelligence

+

Personal Financial Context

+

Decision Simulation

to produce one simple outcome:

BUY / WAIT / BORROW / REPAIR / REFURBISH / RESELL.

==================================================

32. IMPORTANT DIFFERENTIATION

==================================================

Do NOT describe TRUEBUY as:

“AI shopping assistant”

Do NOT describe it as:

“price comparison website”

Do NOT describe it as:

“budgeting app”

Do NOT describe it as:

“expense tracker”

Do NOT describe it as:

“product recommendation engine”

Describe it as:

“AI-powered purchase decision engine.”

The key innovation is:

Most platforms optimize the question:

“What should I buy?”

TRUEBUY optimizes:

“Should I buy this?”

==================================================

33. FINAL PRODUCT QUALITY

==================================================

The final application must be:

- Fully navigable

- Functional

- Responsive

- Mobile-first

- Visually polished

- Fast

- Demo-ready

- Error-resistant

- Easy to understand within 10 seconds

Prioritize a small number of extremely polished features over many incomplete features.

The primary working flow MUST be:

SCAN

→ IDENTIFY

→ ANALYZE

→ DECIDE

→ EXPLAIN

→ COMPARE

→ SIMULATE

Make this flow exceptionally polished.

==================================================

34. FINAL SCREEN

==================================================

End the product experience with the message:

TRUEBUY

“Don’t buy more.

Buy better.”

Secondary text:

“AI-powered purchase decisions for smarter commerce.”

==================================================

Now build the complete application.

First create the architecture and data model.

Then implement the core decision engine.

Then implement the mobile-first UI.

Then implement product scanning/OCR.

Then implement the AI explanation layer.

Then implement the demo dataset.

Then implement the What-If simulator.

Then implement the history and insights dashboard.

Finally, test the complete demo flow from product scan to recommendation.

Do not create a static mockup.

Create a functional prototype with realistic interactions and working state management.
make it PWA

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://truebuy-decider.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0f8d362d-4e81-48e3-b75e-7655f0b1d3fd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
