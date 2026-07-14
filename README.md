# Split Bill

A modern web application built with Next.js that helps you easily split bills and expenses among friends.

## Features

- 🧑‍🤝‍🧑 Add and manage multiple users
- 📸 **Scan receipts with AI** — upload a photo and the items, taxes, and totals are extracted automatically (free OpenRouter vision models)
- 🧮 Compound tax detection — multiple taxes (e.g. VAT 14% + service 12%) are combined multiplicatively (1.14 × 1.12 → 27.68%)
- ✏️ Review, edit, and extend AI-scanned items before adding them to the bill
- 💰 Add items manually with cost and quantity
- 🔄 Split items between selected users
- 📊 Calculate individual shares automatically
- 💵 Support for tax rate calculation
- 🌓 Dark mode support
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 16 with App Router (Turbopack)
- **AI**: OpenRouter free vision models (Gemma 4, Nemotron Nano VL)
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist Sans & Geist Mono
- **Language**: TypeScript

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/split-bill.git
cd split-bill
```

2. Install dependencies:

```bash
npm install
```

3. Set up the AI receipt scanner (optional but recommended):

   - Create a free API key at [openrouter.ai/keys](https://openrouter.ai/keys)
   - Put it in `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-...
```

   The scanner uses free models only (`google/gemma-4-31b-it:free` first, with automatic fallbacks to `google/gemma-4-26b-a4b-it:free` and `nvidia/nemotron-nano-12b-v2-vl:free`). You can force a specific model with `OPENROUTER_MODEL`.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. **Add Users**: Start by adding the people who are splitting the bill.
2. **Scan a Receipt** (Optional): Take a photo or upload a receipt image. The AI extracts every item and any taxes. Review the items, edit names/prices/quantities, add missing ones, assign each item to people, then add them all to the bill. Detected taxes fill the tax rate automatically — multiple taxes are compounded multiplicatively.
3. **Set Tax Rate** (Optional): Or enter the tax rate manually.
4. **Add Items**: Enter item details manually including:
   - Item name
   - Cost
   - Quantity
   - Select users to split between
5. **View Results**: See the breakdown of what each person owes, including:
   - Individual items
   - Subtotals
   - Tax amounts
   - Final totals

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
