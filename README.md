# AI Powered Challenge Panel

Proje **backend** ve **frontend** olarak ayrılmış profesyonel bir yapıdadır. Tüm özellikler korunmuştur.

Detaylı API referansı için [docs/API.md](docs/API.md) dosyasına bakın.

## Yapı

```
CHALL/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── store.ts
│   │   ├── seed.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       └── teams.ts
│   └── package.json
├── frontend/         # React + TypeScript + Vite (Vercel deploy için burası)
│   ├── api/          # Vercel Serverless + Vercel KV (kalıcı veri)
│   │   ├── auth/
│   │   ├── teams/
│   │   ├── lib/      # store, types, seed
│   │   └── health.ts
│   ├── src/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── services/
│   │   ├── data/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json
│   └── package.json
└── README.md
```

## Ortam değişkenleri

| Değişken | Nerede | Açıklama |
|----------|--------|----------|
| `PORT` | Backend | API portu (varsayılan: 3001) |
| `CORS_ORIGIN` | Backend | İzin verilen origin’ler (virgülle ayrılmış; boş = tümü) |
| `VITE_API_URL` | Frontend | Backend adresi (boş = dev proxy) |
| `KV_REST_API_URL` | Vercel | Vercel KV (Dashboard’dan otomatik) |
| `KV_REST_API_TOKEN` | Vercel | Vercel KV (Dashboard’dan otomatik) |

Örnek için kökte ve `backend/`, `frontend/` altında `.env.example` dosyalarına bakın.

## Backend (API)

- **Port:** 3001
- **Endpoint’ler:**
  - **Auth:** `POST /api/auth/login` (body: email, password → session + token), `GET /api/auth/me` (Header: `Authorization: Bearer <token>`), `POST /api/auth/logout` (Bearer token)
  - **Takımlar:** `GET /api/teams`, `GET /api/teams/:id`, `POST /api/teams`, `PUT /api/teams/:id`, `PATCH /api/teams/:id/scores`, `POST /api/teams/import`
  - **Hakemler:** `GET /api/judges`, `POST /api/judges` (body: name, email?), `GET /api/judges/:id`, `PUT /api/judges/:id`, `DELETE /api/judges/:id`
  - `GET /api/health` — Sağlık kontrolü

### Çalıştırma

```bash
cd backend
npm install
npm run dev
```

## Frontend

- **Port:** 5173 (Vite)
- Backend çalışıyorsa `/api` istekleri proxy ile `http://localhost:3001`’e gider.
- Backend yoksa veri `localStorage` ile çalışır (takımlar boş başlar; import veya Takım Ekle ile veri eklenir).

### Çalıştırma

```bash
cd frontend
npm install
npm run dev
```

Tarayıcıda: `http://localhost:5173`

### Ortam değişkeni (opsiyonel)

- `VITE_API_URL`: Backend’in tam adresi (örn. `http://localhost:3001`). Boş bırakılırsa proxy kullanılır.

## Özellikler (korunan)

- Giriş (admin / hakem / misafir)
- Akış: turnuva/okul filtreleri, baraj dağılımı, skor dağılımı, PlayOff, Final Four
- Takımlar: filtreler, proje kategorisi, arama
- Hakem: takım seçimi, EVOL radar, veri girişi (1–5), hakem notu
- Lig: top 16
- Admin: takım ekleme/düzenleme, Excel/CSV import (skorlar merge’de korunur)
- Tüm hesaplamalar (EVOL %, baraj, badge) aynı mantıkla çalışır

## Tek komutla çalıştırma

İki terminalde:

1. `cd backend && npm install && npm run dev`
2. `cd frontend && npm install && npm run dev`

Ardından frontend: `http://localhost:5173`, API: `http://localhost:3001`.

---

## Vercel’e deploy (kalıcı veri: Vercel KV)

Tüm veriler (takımlar, yarışmacılar, sonuçlar) **Vercel KV** (Redis) ile saklanır. PostgreSQL gerekmez.

### 1. Vercel KV ekleme

1. [Vercel Dashboard](https://vercel.com) → Projeyi seç (veya yeni proje oluştur).
2. **Storage** → **Create Database** → **KV** (Redis) seç.
3. Oluşturduktan sonra projeye **Connect** ile bağla. Bu işlem `KV_REST_API_URL`, `KV_REST_API_TOKEN` vb. env değişkenlerini otomatik ekler.

### 2. Deploy

- **Root directory:** `frontend` (Vercel’de “Root Directory” = `frontend` olarak ayarla).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Git ile deploy:

```bash
cd frontend
vercel
```

veya GitHub/GitLab bağlayıp otomatik deploy.

**Demo hesaplar** (KV boşken otomatik): `admin@biltek.k12.tr` / `hakem@biltek.k12.tr` / `misafir@biltek.k12.tr`, şifre: `Biltek2026!`. Ek kullanıcı için ortam değişkeni gerekmez.

### 3. Vercel Serverless API (frontend/api/)

Vercel’de deploy edildiğinde aşağıdaki route’lar `frontend/api/` altında çalışır; veri **Vercel KV** ile kalıcıdır.

- **Auth:** `api/auth/login.ts`, `api/auth/me.ts`, `api/auth/logout.ts` — Token KV’de 30 gün TTL ile saklanır.
- **Takımlar:** `api/teams/index.ts`, `api/teams/[id].ts`, `api/teams/[id]/scores.ts`, `api/teams/import.ts`
- **Hakemler:** `api/judges/index.ts`, `api/judges/[id].ts` — CRUD, KV’de `chall:judges` anahtarı.
- **Sağlık:** `api/health.ts`

Frontend, `VITE_API_URL` boş bırakıldığında aynı origin’e istek atar; Vercel’de bu serverless API’yi kullanır.

### 4. Davranış

- **Takımlar:** KV boşsa `GET /api/teams` boş dizi döner. Takım ekleme veya CSV/Excel import ile veri eklenir.
- **Giriş:** İlk kullanımda kullanıcı yoktur. Vercel ortam değişkenlerine `FIRST_ADMIN_EMAIL` ve `FIRST_ADMIN_PASSWORD` ekleyin; ilk istekte bu hesap KV’ye yazılır ve giriş yapılabilir.
- Tüm veriler (takımlar, hakemler, oturumlar) KV’de kalıcıdır.

### Alternatif depolama

- **Vercel KV** (önerilen): Vercel ile entegre, ücretsiz kota yeterli.
- **Turso** (SQLite): SQL istersen kullanılabilir.
- **MongoDB Atlas / Supabase**: İleride daha karmaşık modeller için düşünülebilir.
