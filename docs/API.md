# API Referansı

Tüm endpoint'ler `Authorization: Bearer <token>` header'ı gerektirir (auth hariç). Token `POST /api/auth/login` ile alınır.

## Genel

- **Base URL:** `https://<vercel-proje>.vercel.app/api` veya `http://localhost:3001/api` (backend)
- **Content-Type:** `application/json`
- **Hata formatı:** `{ "error": "Mesaj" }`
- **503 (KV yok):** Vercel KV yapılandırılmamışsa tüm veri endpoint'leri 503 döner.

---

## Auth

### POST /api/auth/login

Giriş yapar, session ve token döner.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Başarı (200):**
```json
{ "session": { "email": "...", "role": "admin|judge|visitor", "name": "..." }, "token": "..." }
```

**Hatalar:** 400 (geçersiz body), 401 (email/şifre hatalı), 503 (KV yok)

---

### GET /api/auth/me

Mevcut oturumu doğrular.

**Headers:** `Authorization: Bearer <token>`

**Başarı (200):**
```json
{ "email": "...", "role": "admin|judge|visitor", "name": "..." }
```

**Hatalar:** 401 (token yok/geçersiz), 503 (KV yok)

---

### POST /api/auth/logout

Oturumu sonlandırır.

**Headers:** `Authorization: Bearer <token>`

**Başarı (200):** `{ "ok": true }`

---

## Takımlar

### GET /api/teams

Tüm takımları listeler. KV boşsa demo takımlar seed'lenir.

**Başarı (200):** `Team[]`

---

### GET /api/teams/:id

Tek takım getirir.

**Başarı (200):** `Team`  
**Hatalar:** 400 (id yok), 404 (takım bulunamadı)

---

### POST /api/teams

Yeni takım ekler.

**Body:** `Team` (id zorunlu)

**Başarı (201):** `Team`

---

### PUT /api/teams/:id

Takım günceller. Skorlar, badges, judgeNote merge'de korunur.

**Body:** `Team`

**Başarı (200):** `Team`

---

### PATCH /api/teams/:id/scores

Skor, badge ve hakem notu günceller.

**Body:**
```json
{
  "scores": { "problem": 5, "aiLogic": 4, ... },
  "badges": ["prompt", "sprint", ...],
  "judgeNote": "string",
  "scoresEnteredByJudgeId": "string (opsiyonel)"
}
```

**Başarı (200):** `Team`  
**Hatalar:** 404 (takım bulunamadı)

---

### POST /api/teams/import

Takım listesini import eder. Mevcut skorlar, badges, judgeNote merge'de korunur.

**Body:** `Team[]`

**Başarı (200):** `Team[]`

---

## Hakemler

### GET /api/judges

Tüm hakemleri listeler.

**Başarı (200):** `Judge[]`

---

### GET /api/judges/:id

Tek hakem getirir.

**Başarı (200):** `Judge`  
**Hatalar:** 404 (hakem bulunamadı)

---

### POST /api/judges

Yeni hakem ekler.

**Body:** `{ "name": "string", "email": "string (opsiyonel)" }`

**Başarı (201):** `Judge`

---

### PUT /api/judges/:id

Hakem günceller.

**Body:** `{ "name": "string (opsiyonel)", "email": "string (opsiyonel)" }`

**Başarı (200):** `Judge`

---

### DELETE /api/judges/:id

Hakem siler.

**Başarı (200):** `{ "ok": true }`

---

## Sağlık

### GET /api/health

Basit sağlık kontrolü.

**Başarı (200):** `{ "ok": true }`

---

## Tipler

- **Team:** id, week, name, captain, members, tournamentCategory, tournamentTier, projectTitle, createdAtISO, badges, scores, judgeNote, tournament, school, projectMainCategory?, projectSubCategory?, assignedJudgeId?, scoresEnteredByJudgeId?
- **Judge:** id, name, email, createdAtISO?
- **BadgeId:** "prompt" | "sprint" | "iletisim" | "lider" | "gelisim" | "mimar"
