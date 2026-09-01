fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error('Virhe ladattaessa data.json-tiedostoa');
    return response.json();
  })
  .then(data => {
    renderMatches(data.matches);
  })
  .catch(error => console.error('Virhe:', error));

function renderMatches(matches) {
  const container = document.getElementById('matches-container');
  if (!container) return;

  container.innerHTML = '';

  matches.forEach(match => {
    // Tarkistetaan onko tulos annettu vai onko se tyhjä "" / null
    const isPlayed = match.result !== null && 
                     match.result !== undefined && 
                     match.result.trim() !== "";

    const statusText = isPlayed ? `Tulos: ${match.result}` : 'Tuleva ottelu';

    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';
    matchCard.innerHTML = `
      <h3>${match.homeTeam} – ${match.awayTeam}</h3>
      <p><strong>Tila:</strong> ${statusText}</p>
      <ul>
        ${Object.entries(match.predictions || {}).map(([pelaaja, veikkaus]) => `
          <li>${pelaaja}: <strong>${veikkaus}</strong></li>
        `).join('')}
      </ul>
    `;
    container.appendChild(matchCard);
  });
}
