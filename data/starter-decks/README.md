# Starter Decks

This folder contains starter deck configurations for the Forte Card Viewer.

## Adding a New Starter Deck

1. Create a new folder with a descriptive name (e.g., `fire-starter`, `water-starter`)
2. Add a `deck.json` file inside the folder with the following structure:

```json
{
  "name": "Deck Name",
  "description": "Optional description",
  "totalCards": 60,
  "data": [
    {
      "id": "card-id-from-cards.json",
      "name": "Card Name",
      "qty": 4
    },
    ...
  ]
}
```

3. Update `js/app.js` and add your folder name to the `deckFolders` array in the `renderStarterDecks()` method:

```javascript
const deckFolders = ['grass-starter', 'your-new-deck-folder'];
```

## Deck Format

- **name**: Display name for the deck
- **description**: Optional description of the deck
- **totalCards**: Total number of cards in the deck
- **data**: Array of card entries
  - **id**: Card ID from cards.json (e.g., "misc-001", "PF1a-089")
  - **name**: Card name (for display)
  - **qty**: Quantity of this card in the deck

## Example

See `grass-starter/deck.json` for a complete example.

