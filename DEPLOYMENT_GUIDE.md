# 🚀 Przewodnik wdrożenia na własny serwer (BEZPŁATNIE)

## 📥 1. Eksport z Replit

### Opcja A: Download ZIP
1. Kliknij ikonę **Files** (boczny panel)
2. Kliknij prawym przyciskiem na główny folder projektu
3. Wybierz **"Download as ZIP"**

### Opcja B: Git Clone (jeśli masz git)
```bash
git clone https://github.com/twoje-repo/projekt.git
```

## 🔧 2. Przygotowanie na własnym serwerze

### Wymagania:
- **Node.js 18+** 
- **PostgreSQL** (lub bezpłatna baza typu Supabase/Neon)
- **Serwer z PHP/Apache/Nginx** 

### Kroki instalacji:

```bash
# 1. Wypakuj i wejdź do folderu
cd twoj-projekt

# 2. Zainstaluj zależności
npm install

# 3. Zbuduj aplikację React
npm run build

# 4. Skopiuj pliki na serwer
```

## 🗄️ 3. Konfiguracja bazy danych

### Opcje bezpłatne:
1. **Neon PostgreSQL** (bezpłatne 3GB)
2. **Supabase** (bezpłatne 500MB)
3. **PostgreSQL na własnym serwerze**

### Utwórz plik `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=3001
```

### Uruchom migracje:
```bash
npx drizzle-kit push
```

## 🌐 4. Wdrożenie

### Struktura plików na serwerze:
```
/twoja-strona/
├── public_html/          # React build (frontend)
│   ├── index.html
│   ├── assets/
│   └── ...
├── api/                  # Node.js server (backend)
│   ├── server/
│   ├── shared/
│   └── node_modules/
└── .env                  # Zmienne środowiskowe
```

### Kroki:
1. **Frontend:** Skopiuj folder `dist/` do `public_html/`
2. **Backend:** Skopiuj resztę do folderu `api/`
3. **Uruchom serwer:** `node api/server/index.js`

## ⚙️ 5. Automatyczny restart (PM2)

```bash
# Zainstaluj PM2
npm install -g pm2

# Uruchom aplikację
pm2 start api/server/index.js --name "construction-app"

# Zapisz konfigurację
pm2 save
pm2 startup
```

## 🔒 6. Nginx Proxy (opcjonalne)

```nginx
server {
    listen 80;
    server_name twoja-domena.pl;
    
    location / {
        root /ścieżka/do/public_html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 💰 Koszty (ZERO PLN):
- ✅ **Hosting:** Twoja strona
- ✅ **Baza danych:** Neon/Supabase (darmowe plany)
- ✅ **Kod:** Już masz na Replit
- ✅ **SSL:** Let's Encrypt (darmowe)

## 🚨 Ważne uwagi:
- **Backup bazy danych** regularnie
- **Zmień hasła** domyślne w .env
- **Monitoruj logi** serwera
- **Aktualizuj** Node.js i zależności

## 📞 Wsparcie:
Jeśli potrzebujesz pomocy z konfiguracją, napisz co dokładnie nie działa!