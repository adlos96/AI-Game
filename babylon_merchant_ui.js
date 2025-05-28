// UI Management
const UI = {
    updateDisplay() {
        this.updateStats();
        this.updateMarketDisplay();
        this.updateInventoryDisplay();
        this.updateCaravanDisplay();
        this.updateGameControls();
    },

    updateStats() {
        document.getElementById('gold').textContent = Math.floor(gameState.gold);
        document.getElementById('month').textContent = gameState.month;
        document.getElementById('year').textContent = gameState.year;
        document.getElementById('reputation').textContent = gameState.reputation;
    },

    updateGameControls() {
        const gameArea = document.querySelector('.main-content');
        const controlBtn = document.getElementById('gameControlBtn');
        const statusDiv = document.getElementById('gameStatus');
        
        if (gameState.isRunning) {
            gameArea.classList.remove('game-paused');
            controlBtn.textContent = '⏸️ Pausa Gioco';
            statusDiv.textContent = 'Gioco in corso - Il tempo scorre automaticamente';
        } else {
            gameArea.classList.add('game-paused');
            controlBtn.textContent = gameState.month === 1 ? '🎮 Avvia il Gioco' : '▶️ Riprendi Gioco';
            statusDiv.textContent = 'Gioco in pausa - Clicca per continuare!';
        }
    },

    updateMarketDisplay() {
        const container = document.getElementById('market-goods');
        container.innerHTML = '';

        for (const [key, good] of Object.entries(marketGoods)) {
            const div = document.createElement('div');
            div.className = 'good-item';
            
            const priceChange = ((good.currentPrice - good.basePrice) / good.basePrice * 100);
            let priceIndicator = '';
            if (priceChange > 5) priceIndicator = '<span class="price-indicator price-up">📈</span>';
            else if (priceChange < -5) priceIndicator = '<span class="price-indicator price-down">📉</span>';
            else priceIndicator = '<span class="price-indicator price-stable">➡️</span>';

            div.innerHTML = `
                <div class="good-header">
                    <span class="good-name">${good.name}</span>
                    <span class="good-price">${Math.floor(good.currentPrice)} sicli ${priceIndicator}</span>
                </div>
                <div>Disponibili: ${good.quantity}</div>
                <div class="good-controls">
                    <input