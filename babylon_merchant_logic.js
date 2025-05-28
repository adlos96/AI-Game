// Game logic functions
const GameLogic = {
    // Trading functions
    buyGood(goodKey) {
        const quantity = parseInt(document.getElementById(`buy-${goodKey}`).value) || 1;
        const good = marketGoods[goodKey];
        const totalCost = good.currentPrice * quantity;

        if (totalCost > gameState.gold) {
            this.addEvent("❌ Non hai abbastanza oro per questo acquisto!");
            return;
        }

        if (quantity > good.quantity) {
            this.addEvent("❌ Non ci sono abbastanza merci disponibili!");
            return;
        }

        gameState.gold -= totalCost;
        good.quantity -= quantity;
        gameState.inventory[goodKey] = (gameState.inventory[goodKey] || 0) + quantity;

        this.addEvent(`✅ Hai comprato ${quantity}x ${good.name} per ${Math.floor(totalCost)} sicli`);
        UI.updateDisplay();
    },

    sellGood(goodKey) {
        const quantity = parseInt(document.getElementById(`sell-${goodKey}`).value) || 1;
        const good = marketGoods[goodKey];
        const inventoryQuantity = gameState.inventory[goodKey] || 0;

        if (quantity > inventoryQuantity) {
            this.addEvent("❌ Non hai abbastanza merci da vendere!");
            return;
        }

        const totalEarnings = good.currentPrice * quantity;
        gameState.gold += totalEarnings;
        good.quantity += quantity;
        gameState.inventory[goodKey] -= quantity;

        if (gameState.inventory[goodKey] <= 0) {
            delete gameState.inventory[goodKey];
        }

        this.addEvent(`💰 Hai venduto ${quantity}x ${good.name} per ${Math.floor(totalEarnings)} sicli`);
        UI.updateDisplay();
    },

    // Price and market functions
    updatePrices() {
        for (const [key, good] of Object.entries(marketGoods)) {
            // Natural price fluctuation
            const change = (Math.random() - 0.5) * good.volatility * 0.4;
            good.currentPrice *= (1 + change);
            
            // Keep prices within reasonable bounds
            good.currentPrice = Math.max(good.basePrice * 0.3, Math.min(good.basePrice * 3, good.currentPrice));
        }
    },

    triggerRandomEvent() {
        if (Math.random() < 0.4) { // 40% chance of event each month
            const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
            
            for (const [goodKey, effect] of Object.entries(event.effects)) {
                if (marketGoods[goodKey]) {
                    marketGoods[goodKey].currentPrice *= (1 + effect);
                    marketGoods[goodKey].currentPrice = Math.max(
                        marketGoods[goodKey].basePrice * 0.3, 
                        Math.min(marketGoods[goodKey].basePrice * 3, marketGoods[goodKey].currentPrice)
                    );
                }
            }

            this.addEvent(`🎭 ${event.name}: ${event.description}`);
        }
    },

    restockGoods() {
        for (const [key, good] of Object.entries(marketGoods)) {
            // Restock goods
            const baseStock = key === 'grano' ? 100 : key === 'seta' ? 20 : key === 'spezie' ? 15 : 
                             key === 'oro' ? 5 : key === 'incenso' ? 40 : 30;
            good.quantity = Math.min(good.quantity + Math.floor(baseStock * 0.3), baseStock);
        }
    },

    // Caravan functions
    sendCaravan(routeKey) {
        const route = caravanRoutes[routeKey];
        
        if (gameState.gold < route.cost) {
            this.addEvent("❌ Non hai abbastanza oro per organizzare questa caravana!");
            return;
        }

        // Check if player has goods to send
        const hasGoods = Object.values(gameState.inventory).some(qty => qty > 0);
        if (!hasGoods) {
            this.addEvent("❌ Non hai merci da spedire! Compra qualcosa prima di organizzare una caravana.");
            return;
        }

        // Deduct cost
        gameState.gold -= route.cost;

        // Calculate arrival time
        let arrivalMonth = gameState.month + route.distance;
        let arrivalYear = gameState.year;
        while (arrivalMonth > 12) {
            arrivalMonth -= 12;
            arrivalYear++;
        }

        // Create caravan with current inventory
        const caravan = {
            destination: route.name,
            goods: {...gameState.inventory},
            arrivalMonth: arrivalMonth,
            arrivalYear: arrivalYear,
            route: routeKey
        };

        gameState.caravans.push(caravan);
        gameState.inventory = {}; // Clear inventory (goods are now in transit)
        
        this.addEvent(`🐪 Caravana partita verso ${route.name}! Arriverà nel mese ${arrivalMonth} del ${arrivalYear} a.C.`);
        UI.updateDisplay();
    },

    processArrivingCaravans() {
        const currentCaravans = [...gameState.caravans];
        gameState.caravans = [];

        currentCaravans.forEach(caravan => {
            if (caravan.arrivalYear === gameState.year && caravan.arrivalMonth === gameState.month) {
                // Caravan has arrived!
                const route = caravanRoutes[caravan.route];
                let totalEarnings = 0;
                let success = Math.random() > route.risk; // Check if caravan was successful

                if (success) {
                    for (const [goodKey, quantity] of Object.entries(caravan.goods)) {
                        if (quantity > 0) {
                            const sellPrice = marketGoods[goodKey].basePrice * route.multipliers[goodKey];
                            const earnings = sellPrice * quantity;
                            totalEarnings += earnings;
                        }
                    }
                    
                    gameState.gold += totalEarnings;
                    gameState.reputation += 5;
                    this.addEvent(`✅ La caravana da ${route.name} è tornata con successo! Guadagno: ${Math.floor(totalEarnings)} sicli`);
                } else {
                    // Caravan was lost
                    gameState.reputation -= 10;
                    this.addEvent(`💀 La caravana verso ${route.name} è stata attaccata dai banditi! Merci perdute.`);
                }
            } else {
                // Caravan still traveling
                gameState.caravans.push(caravan);
            }
        });
    },

    // Game progression
    nextMonth() {
        gameState.month++;
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year++;
            this.addEvent(`🎊 Anno nuovo! Siamo ora nel ${gameState.year} a.C.`);
        }

        this.updatePrices();
        this.triggerRandomEvent();
        this.restockGoods();
        this.processArrivingCaravans();

        // Small reputation decay to encourage active trading
        if (gameState.reputation > 0) {
            gameState.reputation = Math.max(0, gameState.reputation - 1);
        }

        UI.updateDisplay();
    },

    toggleGame() {
        if (gameState.isRunning) {
            // Pause game
            clearInterval(gameState.gameInterval);
            gameState.isRunning = false;
        } else {
            // Start game
            gameState.isRunning = true;
            gameState.gameInterval = setInterval(() => {
                this.nextMonth();
            }, 3000); // Advance month every 3 seconds
        }
        UI.updateDisplay();
    },

    // Utility function
    addEvent(message) {
        const eventLog = document.getElementById('event-log');
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.textContent = `Mese ${gameState.month}, ${gameState.year} a.C.: ${message}`;
        eventLog.appendChild(eventItem);
        eventLog.scrollTop = eventLog.scrollHeight;
    }
};