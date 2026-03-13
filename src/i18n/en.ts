export default {
  home: {
    heading: 'Scanned books',
    scanButton: '📷 Scan',
    scanButtonLabel: 'Scan',
    scanButtonHint: 'Scan a barcode to add a new book',
    bookDeleted: 'Book deleted',
  },
  scanner: {
    initializing: 'Initializing camera...',
    permissionRequired: 'Camera permission required',
    permissionInstruction: 'Please enable camera access in settings',
    back: 'Back',
    instruction: 'Place the barcode in the frame',
    close: 'Close',
    closeHint: 'Return to book list',
    flashOn: 'Turn off flash',
    flashOff: 'Turn on flash',
    searching: 'Searching for book...',
    notFound: 'ISBN not found on Moly',
    unavailable: 'moly.hu is unavailable',
  },
  book: {
    openHint: 'Tap to open the book on Moly.hu',
  },
  empty: {
    message: 'No scanned books',
    hint: 'Tap the scan button to add a book',
  },
  common: {
    delete: 'Delete',
    undo: 'Undo',
  },
  nav: {
    homeTitle: 'Lepkeháló',
  },
} as const;
