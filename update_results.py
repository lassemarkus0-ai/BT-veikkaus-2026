import json
import requests

def fetch_and_update():
    # 1. Lue nykyinen data.json
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            local_data = json.load(f)
    except FileNotFoundError:
        print("data.json-tiedostoa ei löytynyt.")
        return

    # 2. Hae tulokset Liigan API-rajapinnasta
    url = "https://liiga.fi/api/v2/games?season=2026"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        api_games = response.json()
    except Exception as e:
        print(f"Virhe haettaessa Liigan API-dataa: {e}")
        return

    updated_count = 0

    # 3. Käydään läpi data.json ottelut
    for match in local_data.get('matches', []):
        if not match.get('result'):
            home = match.get('homeTeam')
            away = match.get('awayTeam')
            
            for game in api_games:
                api_home = game.get('homeTeam', {}).get('name')
                api_away = game.get('awayTeam', {}).get('name')
                
                if game.get('ended') and api_home == home and api_away == away:
                    home_goals = game.get('homeTeam', {}).get('goals', 0)
                    away_goals = game.get('awayTeam', {}).get('goals', 0)
                    
                    match['result'] = "1" if home_goals > away_goals else "2"
                    updated_count += 1
                    print(f"Päivitetty: {home} vs {away} -> {match['result']}")
                    break

    # 4. Tallennetaan päivitetty data.json
    if updated_count > 0:
        with open('data.json', 'w', encoding='utf-8') as f:
            json.dump(local_data, f, ensure_ascii=False, indent=2)
        print(f"Päivitetty yhteensä {updated_count} ottelua.")
    else:
        print("Ei uusia päivitettäviä tuloksia.")

if __name__ == "__main__":
    fetch_and_update()
