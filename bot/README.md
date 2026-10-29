# Gornitsa katalog boti

Bot @gornitsauz_admin_bot uchun. Cloudflare Workers'da bepul ishlaydi, server kerak emas.

## Bot nima qiladi
- /start: katalog rasmi va 6 ta bo'lim tugmasi (Gornitsa, Sirli idishlar, Xitoy naborlari, Bitplast, Soatlar, Boshqa tovarlar)
- Bo'lim: 8 tadan raqamlangan tovarlar, oldingi va keyingi sahifa
- Tovar: rasm, narx, artikul, qutidagi soni, "Buyurtma berish" va "Barcha rasmlari" tugmalari
- Qidiruv: tovar nomi yoki artikulini yozsangiz, topib beradi
- Avtomatik javoblar: salom, manzil, telefon, narx, buyurtma, yetkazib berish, rahmat
- Tovarlar ro'yxati saytdan olinadi, sayt yangilansa, bot ham yangilanadi

## Ishga tushirish (bir marta, 5 daqiqa)
1. dash.cloudflare.com sahifasida bepul ro'yxatdan o'ting.
2. **Workers & Pages → Create → Create Worker** ni bosing, nomini `gornitsa-bot` qo'ying va **Deploy** ni bosing.
3. **Edit code** ni bosing, ichidagi hamma narsani o'chiring, `worker.js` faylining mazmunini qo'ying va **Deploy** ni bosing.
4. **Settings → Variables and Secrets → Add** ga o'ting. Nomi: `BOT_TOKEN`, turi: **Secret**, qiymati: BotFather bergan token. Saqlang.
5. Brauzerda `https://gornitsa-bot.<sizning-nomingiz>.workers.dev/sozla` manzilini oching. "Tayyor!" yozuvi chiqishi kerak.
6. Telegram'da botga /start yozing.

## Render'da ishga tushirish (24/7)
1. render.com saytiga **GitHub** hisobingiz bilan kiring.
2. **New → Blueprint** ni bosing va `gornitsa` omborini tanlang. `render.yaml` o'zi o'qiladi.
3. `BOT_TOKEN` so'ralganda BotFather bergan tokenni kiriting va **Apply** ni bosing.
4. Xizmat ishga tushgach, uning manzilini oching va oxiriga `/sozla` qo'shing: `https://gornitsa-bot.onrender.com/sozla`. "Tayyor!" chiqishi kerak.
5. Uxlab qolmasligi uchun cron-job.org saytida har 10 daqiqada `https://gornitsa-bot.onrender.com/` manzilini ochadigan bepul vazifa yarating.

## Railway'da ishga tushirish (24/7, uxlamaydi)
1. railway.com saytiga kiring (GitHub, Google yoki pochta bilan).
2. **New Project → Deploy from GitHub repo** ni tanlang va `gornitsa` omborini tanlang.
   GitHub ulanmasa: **New Project → Empty Project → + Create → GitHub Repo**, yoki ombor havolasini qo'ying.
3. Xizmat **Settings** bo'limida **Root Directory** ga `bot` deb yozing.
4. **Variables** bo'limida `BOT_TOKEN` qo'shing (BotFather bergan token).
5. **Settings → Networking → Generate Domain** ni bosing.
6. Chiqqan manzilning oxiriga `/sozla` qo'shib oching. "Tayyor!" chiqishi kerak.
