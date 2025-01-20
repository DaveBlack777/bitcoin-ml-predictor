# Bitcoin ML Predictor

Aplikacja do przewidywania cen Bitcoin wykorzystująca uczenie maszynowe.

## Funkcje

- Przewidywanie cen Bitcoin na podstawie danych historycznych
- Wizualizacja predykcji na wykresach
- Automatyczne trenowanie modelu
- Panel administracyjny do monitorowania procesu uczenia

## Technologie

- React + Vite
- TypeScript
- TensorFlow.js
- Chart.js
- Supabase
- Tailwind CSS

## Wymagania

- Node.js >= 18.0.0
- NPM

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/yourusername/bitcoin-ml-predictor.git
cd bitcoin-ml-predictor
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:
   - Skopiuj `.env.example` do `.env`
   - Uzupełnij wymagane zmienne środowiskowe

4. Uruchom aplikację w trybie deweloperskim:
```bash
npm run dev
```

## Deployment

Aplikacja jest skonfigurowana do deploymentu na platformie Render.

### Zmienne środowiskowe

Wymagane zmienne środowiskowe:
- `VITE_SUPABASE_URL` - URL do projektu Supabase
- `VITE_SUPABASE_ANON_KEY` - Klucz anonimowy Supabase
- `NODE_ENV` - Środowisko (production/development)
- `NODE_VERSION` - Wersja Node.js (18.20.3)

## Licencja

MIT