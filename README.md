# TTS Playing Card Deck Generator

A web application that turns a set of images into a Tabletop Simulator compatible deck of playing cards.

Each card in the deck is composed of a user-specified source image and the card value (ace of spades, 5 of diamonds, etc).

> This React web app was vibe coded from the original Python CLI tool.

## Live Demo

Try it online: [https://lanroth.github.io/tts-playing-card-deck-generator/](https://lanroth.github.io/tts-playing-card-deck-generator/)

## Usage

1. Open the web app in your browser
2. Upload your images using the image uploader
3. Configure deck settings as needed:
   - **Deck Size**: Choose between 52 or 54 cards
   - **Hidden Card**: Optionally set a specific image for the hidden card face
4. Preview the generated deck
5. Download the final deck image

## Importing into Tabletop Simulator

From within Tabletop Simulator:

1. Click the Objects button at the top:
   ![Objects button](doc/objects_button.jpg)
2. Click Components:
   ![Components button](doc/components.jpg)
3. Click Custom:
   ![Custom button](doc/custom_button.jpg)
4. Click Deck:
   ![Deck button](doc/deck_button.jpg)
5. Fill in the dialog:
   ![Custom button dialog](doc/custom_deck_dialog.jpg)
   - For `Face` browse to the generated image and upload to `Cloud`
   - For `Back` browse to an image you'd like for the back of the playing cards and upload to `Cloud`
   - Click the `IMPORT` button

I recommend saving the generated deck for easy access:

1. Right click on the deck
2. Save object
3. Give it a meaningful name and click Save

## Development

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/lanroth/tts-playing-card-deck-generator.git
cd tts-playing-card-deck-generator
npm install
```

### Running Locally

```bash
npm run dev
```

This starts the development server. Open the URL shown in your terminal (usually <http://localhost:5173>).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## How It Works

Tabletop Simulator expects a card deck to be a single image composed of a grid of 10 x 7 cards.

Here is a card deck template from Tabletop Simulator:

![](card_template.png)

For each card in this grid, the application:

1. Reads the card template
2. Extracts the number and suit from the corners
3. Takes an uploaded image
4. Scales and crops this image to card size
5. Pastes the number and suit into the corners
6. Writes the image into the grid

The resulting image can be downloaded as a PNG file.

## Why This Exists

I play card games online with friends and wanted to be able to change the faces of the cards as easily as possible.

There are existing tools to help with this (e.g. the official [Deck Builder](https://kb.tabletopsimulator.com/custom-content/custom-deck/#deck-builder)) but they require a lot of work to achieve these results.

This tool makes it quick and easy to generate a custom deck from any collection of images.

## Included Source Images

The sample images included in this repo are from:

https://esahubble.org/products/media/hst_media_0017/
