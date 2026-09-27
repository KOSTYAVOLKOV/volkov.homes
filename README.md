# VOLKOV.STUDIO — сайт (передача программисту)

## Что в архиве
```
index.html      весь сайт: HTML + CSS + JS в одном файле
img/            локальные фотографии проектов
robots.txt      для поисковиков
sitemap.xml     карта сайта (заменить домен, если он другой)
README.md       этот файл
```

Статический сайт, сборка не нужна. Точка входа — `index.html`.

## ВАЖНО для хостинга: SPA-rewrite
Сайт использует реальные URL (`/projecten/aerdenhout/`, `/diensten/`, `/en/contact/`), а физический файл один.
Нужно правило «всё, что не файл → index.html», иначе прямые ссылки и переходы из Google дадут 404.

Netlify — файл `_redirects`:
```
/*  /index.html  200
```
Vercel — `vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Apache — `.htaccess`:
```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```
Nginx: `try_files $uri $uri/ /index.html;`

Сайт должен лежать в корне домена (не в подпапке). Внутри предпросмотра и при открытии файла с диска автоматически включается режим `#/...` — на хостинге работают чистые URL.

## Структура URL
| Страница | NL | EN |
|---|---|---|
| Главная | `/` | `/en/` |
| Проекты | `/projecten/` | `/en/projects/` |
| Проект | `/projecten/<slug>/` | `/en/projects/<slug>/` |
| Диенсten | `/diensten/` | `/en/services/` |
| Новости | `/nieuws/` | `/en/news/` |
| Контакты | `/contact/` | `/en/contact/` |

Основной язык — нидерландский (`<html lang="nl">`), английский — вторая версия, переключатель NL/EN в шапке.

## SEO, что уже сделано
- Нидерландский как основной язык, EN-версия, `hreflang` nl / en / x-default на каждый маршрут.
- Свой `title`, `description`, `canonical`, Open Graph на каждую страницу (в т.ч. на каждый проект — из данных проекта).
- Разметка Schema.org: `GeneralContractor` (телефон, часы, `areaServed`: Amsterdam, Rotterdam, Den Haag, Utrecht, Randstad, каталог услуг) + `BreadcrumbList` на каждой странице.
- `robots.txt`, `sitemap.xml` c `hreflang`-альтернативами.
- H1 на каждой странице, ключи в заголовках: aannemer, verbouwing, aanbouw, keukens op maat, casco afbouw.

## Что осталось сделать (SEO)
1. **Заменить домен.** Сейчас в `<head>`, `sitemap.xml`, `robots.txt` и константе `ORIGIN` в скрипте стоит `https://volkov.studio`.
2. **Изображение для соцсетей** — положить `img/og-cover.jpg` (1200×630).
3. **Фото проектов 5–7 подключены ссылками на Google Photos** (`lh3.googleusercontent.com`). Такие ссылки со временем перестают работать и не индексируются как свои. Скачать в `img/` и заменить пути в массиве `PROJECTS`.
4. **Alt-тексты**: фото в лентах проектов уже с `alt`, но обложки (`.media`) — CSS-фон без alt. Для картиночного поиска стоит перевести обложки на `<img alt="…">`.
5. **WebP + размеры**, `loading="lazy"` везде — сейчас часть фото весит много (несколько обложек встроены в файл как base64; для продакшена вынести в `img/`).
6. **Google Business Profile** — не создан. Для строительной тематики это главный источник заявок: профиль, зона обслуживания, фото объектов, отзывы, KvK.
7. **Реквизиты**: адрес, e-mail, KvK, BTW — добавить в секцию контактов и в JSON-LD (`address`, `vatID`, `identifier`).
8. **Аналитика**: GA4 или Plausible + цели на клики по WhatsApp и телефону.
9. Страницы под услуги и города (`/diensten/verbouwing/`, `/diensten/aanbouw/`, `/verbouwing-amsterdam/` и т.д.) — задел под них есть в роутере, контент ещё не написан.

## Где что править в index.html
| Блок | Где искать |
|---|---|
| Проекты (фото, тексты, EN-перевод) | массив `const PROJECTS = [` |
| Новости / статьи | массив `const NEWS = []` |
| Английские переводы интерфейса | объект `const EN = {` |
| Тексты на нидерландском | прямо в HTML, у элементов `data-i18n="…"` |
| Мета-теги страниц | объект `const META = {` |
| Домен | константа `ORIGIN` |
| Номер WhatsApp | `const WA_NUMBER='31641476781'` |
| Фоновое видео на главной | блок `hero__video` (Bunny Stream, iframe) |
| Услуги | секция `data-page="services"` |
| Контакты | секция `data-page="contact"` |
