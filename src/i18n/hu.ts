export default {
  home: {
    heading: 'Beolvasott könyvek',
    scanButton: '📷 Beolvasás',
    scanButtonLabel: 'Beolvasás',
    scanButtonHint: 'Vonalkód beolvasása új könyv hozzáadásához',
    bookDeleted: 'Könyv törölve',
  },
  scanner: {
    initializing: 'Kamera inicializálása...',
    permissionRequired: 'Kamera engedély szükséges',
    permissionInstruction:
      'Kérlek, engedélyezd a kamera használatát a beállításokban',
    back: 'Vissza',
    instruction: 'Helyezd a vonalkódot a keretbe',
    close: 'Bezárás',
    closeHint: 'Visszatérés a könyvlistához',
    flashOn: 'Vaku kikapcsolása',
    flashOff: 'Vaku bekapcsolása',
    searching: 'Könyv keresése...',
    notFound: 'Az ISBN nem található a Moly-on',
    unavailable: 'A moly.hu nem elérhető',
  },
  book: {
    openHint: 'Koppints a könyv megnyitásához a Moly.hu-n',
  },
  empty: {
    message: 'Nincsenek beolvasott könyvek',
    hint: 'Nyomj a beolvasás gombra egy könyv hozzáadásához',
  },
  common: {
    delete: 'Törlés',
    undo: 'Visszavonás',
  },
  nav: {
    homeTitle: 'Lepkeháló',
  },
} as const;
