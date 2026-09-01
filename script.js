document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('data.json-tiedostoa ei voitu ladata');
            return response.json();
        })
        .then(data => {
            renderStandings(data.players, data.matches);
            renderMatches(data.matches);
        })
        .catch(error => {
            console.error('Virhe:', error);
            document.getElementById('standings-container').innerText = 'Virhe ladattaessa tietoja.';
            document.getElementById('matches-container').innerText = 'Virhe ladattaessa tietoja.';
        });
});

// Sarjataulukon laskenta ja tulostus
function renderStandings(players, matches) {
    const standingsContainer = document.getElementById('standings-container');
    if (!standingsContainer) return;

    // Alustetaan pelaajien pisteet ja tilastot
    const stats = {};
    players.forEach(player => {
        stats[player] = { name: player, points: 0, correct: 0, totalPlayed: 0 };
    });

    matches.forEach(match => {
        // Lasketaan pisteet vain pelatuista otteluista
        if (match.result && match.result.trim() !== "") {
            const result = match.result.trim();
            
            // Lasketaan eri merkkien (1, X, 2) veikkausmäärät tässä ottelussa
            const counts = { "1": 0, "X": 0, "2": 0 };
            let totalVotes = 0;
            
            Object.values(match.predictions).forEach(pick => {
                if (counts[pick] !== undefined) {
                    counts[pick]++;
                    totalVotes++;
                }
            });

            // Määritetään kerroinpisteet (1 p, 1.5 p, 2 p)
            Object.entries(match.predictions).forEach(([player, pick]) => {
                if (stats[player]) {
                    stats[player].totalPlayed++;
                    if (pick === result) {
                        stats[player].correct++;
                        
                        const pickCount = counts[pick];
                        const otherCounts = Object.keys(counts)
                            .filter(k => k !== pick && counts[k] > 0)
                            .map(k => counts[k]);
                        
                        // Pistelaskusäännöt
                        if (otherCounts.length === 0 || otherCounts.every(c => c === pickCount)) {
                            stats[player].points += 1.5; // Tasavertaiset
                        } else if (otherCounts.every(c => pickCount < c)) {
                            stats[player].points += 2.0; // Vähiten veikattu
                        } else {
                            stats[player].points += 1.0; // Eniten / tavallinen
                        }
                    }
                }
            });
        }
    });

    // Järjestetään pelaajat pisteiden mukaan
    const sorted = Object.values(stats).sort((a, b) => b.points - a.points || b.correct - a.correct);

    // Luodaan taulukko
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Sija</th>
                    <th>Pelaaja</th>
                    <th>Pisteet</th>
                    <th>Oikein</th>
                    <th>Pelattu</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach((p, index) => {
        html += `
            <tr>
                <td>${index + 1}.</td>
                <td><strong>${p.name}</strong></td>
                <td><strong>${p.points.toFixed(1).replace('.', ',')} p</strong></td>
                <td>${p.correct}</td>
                <td>${p.totalPlayed}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    standingsContainer.innerHTML = html;
}

// Otteluhistorian ja tulevien otteluiden tulostus
function renderMatches(matches) {
    const matchesContainer = document.getElementById('matches-container');
    if (!matchesContainer) return;

    matchesContainer.innerHTML = '';

    matches.forEach(match => {
        const isPlayed = match.result && match.result.trim() !== "";
        
        const card = document.createElement('div');
        card.className = `match-card ${isPlayed ? 'played' : 'upcoming'}`;

        let predictionsHtml = '<div class="predictions-grid">';
        for (const [player, pick] of Object.entries(match.predictions || {})) {
            const isCorrect = isPlayed && pick === match.result.trim();
            predictionsHtml += `
                <div class="prediction-item ${isCorrect ? 'correct-pick' : ''}">
                    <span class="player-name">${player}</span>
                    <span class="pick-badge">${pick}</span>
                </div>
            `;
        }
        predictionsHtml += '</div>';

        card.innerHTML = `
            <div class="match-header">
                <span class="match-teams">${match.homeTeam} – ${match.awayTeam}</span>
                <span class="match-date">${match.date || ''}</span>
            </div>
            <div class="match-status">
                ${isPlayed 
                    ? `<span class="badge result-badge">Lopputulos: <strong>${match.result}</strong></span>` 
                    : `<span class="badge upcoming-badge">Tuleva ottelu</span>`}
            </div>
            ${predictionsHtml}
        `;

        matchesContainer.appendChild(card);
    });
}
