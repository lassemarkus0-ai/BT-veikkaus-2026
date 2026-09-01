document.addEventListener("DOMContentLoaded", () => {
  // Haetaan data.json aina tuoreena lisäämällä URL-osoitteeseen aikaleima (?v=...)
  fetch('data.json?v=' + new Date().getTime())
    .then(response => {
      if (!response.ok) {
        throw new Error('Verkkovirhe dataa haettaessa');
      }
      return response.json();
    })
    .then(data => {
      renderTable(data);
    })
    .catch(error => {
      console.error('Virhe ladattaessa veikkausdataa:', error);
    });
});

function renderTable(data) {
  const table = document.getElementById('matchTable');
  if (!table || !data.matches) return;

  let html = `
    <thead>
      <tr>
        <th>Pvm</th>
        <th>Ottelu</th>
        <th>Tulos</th>
  `;

  // Lisätään pelaajien nimet otsikkoriville
  if (data.players) {
    data.players.forEach(player => {
      html += `<th>${player}</th>`;
    });
  }

  html += `
      </tr>
    </thead>
    <tbody>
  `;

  // Luodaan rivit otteluille
  data.matches.forEach(match => {
    const resultDisplay = match.result ? match.result : "-";
    
    html += `
      <tr>
        <td>${match.date || ''}</td>
        <td>${match.homeTeam} vs ${match.awayTeam}</td>
        <td><strong>${resultDisplay}</strong></td>
    `;

    // Lisätään kunkin pelaajan veikkaus
    if (data.players) {
      data.players.forEach(player => {
        const prediction = (match.predictions && match.predictions[player]) ? match.predictions[player] : "";
        html += `<td>${prediction}</td>`;
      });
    }

    html += `</tr>`;
  });

  html += `</tbody>`;
  table.innerHTML = html;
}
