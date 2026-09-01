document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('data.json-lataus epäonnistui');
            return response.json();
        })
        .then(data => {
            updateStats(data.players, data.matches);
            renderStandings(data.players, data.matches);
            renderMatches(data.matches);
        })
        .catch(error => console.error('Virhe:', error));
});

// Välilehtien vaihto
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'standings') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-standings').classList.add('active');
    } else if (tabName === 'matches') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-matches').classList.add('active');
    } else if (tabName === 'other') {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('tab-other').classList.add('active');
    }
}

// Päivittää yläpalkin 3 tilastokorttia
function updateStats(players, matches) {
    const totalPlayers = players.length;
    const playedMatches = matches.filter(m => m.result && m.result.trim() !== "").length;
    const totalMatches = matches.length;

    document.getElementById('stat-players').innerText = totalPlayers;
    document.getElementById('stat-matches').innerText = `${playedMatches} / ${totalMatches}`;
}

// Sarjataulukon laskenta ja järjestäminen
function renderStandings(players, matches) {
    const container = document.getElementById('standings-container');
    if (!container) return;

    const stats = {};
    players.forEach(p => stats[p] = { name: p, points: 0, correct: 0 });

    matches.forEach(match => {
        if (match.result && match.result.trim() !== "") {
            const res = match.result.trim();
            const counts = { "1": 0, "X": 0, "2": 0 };
            
            Object.values(match.predictions).forEach(pick => {
                if (counts[pick] !== undefined) counts[pick]++;
            });

            Object.entries(match.predictions).forEach(([player, pick]) => {
                if (stats[player] && pick === res) {
                    stats[player].correct++;
                    const pickCount = counts[pick];
                    const otherCounts = Object.keys(counts).filter(k => k !== pick && counts[k] > 0).map(k => counts[k]);

                    if (otherCounts.length === 0 || otherCounts.every(c => c === pickCount)) {
                        stats[player].points += 1.5;
                    } else if (otherCounts.every(c => pickCount < c)) {
                        stats[player].points += 2.0;
                    } else {
                        stats[player].points += 1.0;
                    }
                }
            });
        }
    });

    const sorted = Object.values(stats).sort((a, b) => b.points - a.points || b.correct - a.correct);

    // Asetetaan kärkipisteet yläkorttiin
    if (sorted.length > 0) {
        document.getElementById('stat-top-points').innerText = `${sorted[0].points.toFixed(1).replace('.', ',')} p`;
    }

    const medalIcons = ['🥇', '🥈', '🥉'];

    container.innerHTML = sorted.map((p, index) => {
        const medal = index < 3 ? medalIcons[index] : `${index + 1}.`;
        return `
            <div class="standing-row">
                <div class="standing-player">${medal} ${p.name}</div>
                <div class="standing-points">${p.points.toFixed(1).replace('.', ',')} p</div>
            </div>
        `;
    }).join('');
}

// Otteluiden tulostus
function renderMatches(matches) {
    const container = document.getElementById('matches-container');
    if (!container) return;

    container.innerHTML = matches.map(match => {
        const isPlayed = match.result && match.result.trim() !== "";
        
        let predictionsHtml = '<div class="predictions-grid">';
        for (const [player, pick] of Object.entries(match.predictions || {})) {
            const isCorrect = isPlayed && pick === match.result.trim();
            predictionsHtml += `
                <div class="prediction-item ${isCorrect ? 'correct' : ''}">
                    <span>${player}</span>
                    <span class="pick-tag">${pick}</span>
                </div>
            `;
        }
        predictionsHtml += '</div>';

        return `
            <div class="match-card">
                <div class="match-header">
                    <span>${match.homeTeam} – ${match.awayTeam}</span>
                    <span class="badge ${isPlayed ? 'badge-played' : 'badge-upcoming'}">
                        ${isPlayed ? `Tulos: ${match.result}` : 'Tuleva'}
                    </span>
                </div>
                ${predictionsHtml}
            </div>
        `;
    }).join('');
}
