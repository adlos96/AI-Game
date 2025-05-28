// Game state
const gameState = {
    gold: 1000,
    month: 1,
    year: 1750,
    reputation: 50,
    inventory: {},
    eventLog: [],
    caravans: [],
    isRunning: false,
    gameInterval: null
};

// Market goods with base prices
const marketGoods = {
    grano: { name: "🌾 Grano", basePrice: 10, volatility: 0.3, currentPrice: 10, quantity: 100 },
    seta: { name: "🧵 Seta", basePrice: 50, volatility: 0.5, currentPrice: 50, quantity: 20 },
    spezie: { name: "🌶️ Spezie", basePrice: 80, volatility: 0.4, currentPrice: 80, quantity: 15 },
    oro: { name: "⚱️ Vasi d'oro", basePrice: 200, volatility: 0.6, currentPrice: 200, quantity: 5 },
    incenso: { name: "🕯️ Incenso", basePrice: 30, volatility: 0.4, currentPrice: 30, quantity: 40 },
    cedro: { name: "🌲 Legno di Cedro", basePrice: 25, volatility: 0.3, currentPrice: 25, quantity: 30 }
};

// Caravan routes
const caravanRoutes = {
    assiria: {
        name: "Assiria",
        distance: 3,
        cost: 500,
        risk: 0.2,
        multipliers: { seta: 1.8, spezie: 2.0, grano: 1.3, incenso: 1.4, oro: 1.2, cedro: 1.1 }
    },
    fenicia: {
        name: "Fenicia", 
        distance: 2,
        cost: 300,
        risk: 0.1,
        multipliers: { cedro: 2.2, oro: 1.9, seta: 1.3, spezie: 1.2, grano: 1.1, incenso: 1.0 }
    },
    persia: {
        name: "Persia",
        distance: 4,
        cost: 800,
        risk: 0.3,
        multipliers: { incenso: 2.5, grano: 1.7, spezie: 1.8, seta: 1.4, oro: 1.1, cedro: 1.0 }
    }
};

// Random events that can occur
const randomEvents = [
    {
        name: "Caravana dall'Oriente",
        description: "Una ricca caravana porta nuove merci dall'Oriente",
        effects: { spezie: -0.3, seta: -0.2 }
    },
    {
        name: "Siccità nelle Terre del Nord",
        description: "La siccità danneggia i raccolti",
        effects: { grano: 0.4, incenso: 0.2 }
    },
    {
        name: "Festival del Re",
        description: "I festeggiamenti reali aumentano la domanda di beni di lusso",
        effects: { oro: 0.5, incenso: 0.3, seta: 0.2 }
    },
    {
        name: "Guerra con l'Assiria",
        description: "Il conflitto interrompe le rotte commerciali",
        effects: { seta: 0.3, spezie: 0.4, cedro: 0.2 }
    },
    {
        name: "Buon Raccolto",
        description: "L'abbondanza porta prezzi bassi per i beni agricoli",
        effects: { grano: -0.2, incenso: -0.1 }
    },
    {
        name: "Mercanti Fenici in Città",
        description: "La concorrenza feroce abbassa alcuni prezzi",
        effects: { oro: -0.2, cedro: -0.3 }
    }
];