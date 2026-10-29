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
