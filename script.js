function renderMatchesTable(matches) {
    const container = document.getElementById('matches-container');
    if (!container || !matches) return;

    let html = `
        <div class="table-wrapper">
            <table class="matches-table">
                <thead>
                    <tr>
                        <th>Pvm ja klo</th>
                        <th>Ottelu</th>
                        <th>Tulos</th>
                        <th>Veikkaukset</th>
                    </tr>
                </thead>
                <tbody>
    `;

    matches.forEach(match => {
        // Luetaan joukkueet yhdistämällä koti- ja vierassarakkeet, jos ne ovat erillään
        let home = match.homeTeam || match.koti || match.home || match.kotijoukkue || "";
        let away = match.awayTeam || match.vieras || match.away || match.vierasjoukkue || "";
        
        let matchName = "";
        if (home && away) {
            matchName = `${home} – ${away}`;
        } else if (match.match) {
            matchName = match.match;
        } else if (match.ottelu) {
            matchName = match.ottelu;
        } else if (match.peli) {
            matchName = match.peli;
        } else {
            matchName = "Ottelu";
        }

        const date = match.date || match.pvm || match.aika || "-";
        const isPlayed = match.result !== undefined && match.result !== null && match.result.toString().trim() !== "";

        let predictionsHtml = '<div class="table-predictions">';
        for (const [player, pick] of Object.entries(match.predictions || match.veikkaukset || {})) {
            const isCorrect = isPlayed && pick.toString().trim() === match.result.toString().trim();
            predictionsHtml += `
                <span class="pred-tag ${isCorrect ? 'correct' : ''}">
                    <small>${player}:</small> <strong>${pick}</strong>
                </span>
            `;
        }
        predictionsHtml += '</div>';

        html += `
            <tr>
                <td class="col-date">${date}</td>
                <td class="col-match"><strong>${matchName}</strong></td>
                <td class="col-status">
                    <span class="badge ${isPlayed ? 'badge-played' : 'badge-upcoming'}">
                        ${isPlayed ? match.result : 'Tuleva'}
                    </span>
                </td>
                <td class="col-preds">${predictionsHtml}</td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}
