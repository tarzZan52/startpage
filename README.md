# ⚔️ tarZan's start page

<p align="center">
  <a href="https://github.com/TarzZan52/startpage/stargazers"><img src="https://img.shields.io/github/stars/TarzZan52/startpage?style=for-the-badge&logo=starship&color=C9CBFF&logoColor=D9E0EE&labelColor=302D41" alt="Stars"></a>
  <a href="https://github.com/TarzZan52/startpage/network/members"><img src="https://img.shields.io/github/forks/TarzZan52/startpage?style=for-the-badge&logo=githubactions&color=F2CDCD&logoColor=D9E0EE&labelColor=302D41" alt="Forks"></a>
  <a href="https://github.com/TarzZan52/startpage/issues"><img src="https://img.shields.io/github/issues/TarzZan52/startpage?style=for-the-badge&logo=bilibili&color=F5E0DC&logoColor=D9E0EE&labelColor=302D41" alt="Issues"></a>
  <a href="https://github.com/TarzZan52/startpage"><img src="https://img.shields.io/github/repo-size/TarzZan52/startpage?style=for-the-badge&logo=github&color=ABE9B3&logoColor=D9E0EE&labelColor=302D41" alt="Size"></a>
  <a href="https://github.com/TarzZan52/startpage/blob/main/LICENSE"><img src="https://img.shields.io/github/license/TarzZan52/startpage?style=for-the-badge&logo=opensourceinitiative&color=DDB6F2&logoColor=D9E0EE&labelColor=302D41" alt="License"></a>
</p>

<p align="center">
  <a href="https://github.com/TarzZan52/startpage/commits/main"><img src="https://img.shields.io/github/last-commit/TarzZan52/startpage?style=for-the-badge&logo=git&color=F8BD96&logoColor=D9E0EE&labelColor=302D41" alt="Last Commit"></a>
  <a href="https://github.com/TarzZan52/startpage"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white&labelColor=302D41" alt="HTML5"></a>
  <a href="https://github.com/TarzZan52/startpage"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white&labelColor=302D41" alt="CSS3"></a>
  <a href="https://github.com/TarzZan52/startpage"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black&labelColor=302D41" alt="JavaScript"></a>
</p>

<div align="center">
  <h3>Минималистичная стартовая страница с полезными виджетами</h3>
</div>

<br>

![screenshot](src/screenshot.png)

## ✨ Функции

<table>
  <tr>
    <td align="center" width="33%">
      <img width="60" height="60" src="https://img.icons8.com/fluency/96/search.png" alt="search"/>
      <br><strong>Поиск</strong><br>
      <sub>DuckDuckGo, Google, Яндекс</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" height="60" src="https://img.icons8.com/fluency/96/calendar.png" alt="calendar"/>
      <br><strong>Календарь</strong><br>
      <sub>Текущий месяц с подсветкой</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" height="60" src="https://img.icons8.com/fluency/96/bitcoin.png" alt="bitcoin"/>
      <br><strong>Криптовалюты</strong><br>
      <sub>BTC, ETH, XRP, BNB, SOL</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img width="60" height="60" src="https://img.icons8.com/fluency/96/tomato.png" alt="pomodoro"/>
      <br><strong>Pomodoro</strong><br>
      <sub>Таймер со статистикой</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" height="60" src="https://img.icons8.com/fluency/96/note.png" alt="notes"/>
      <br><strong>Заметки</strong><br>
      <sub>С автосохранением</sub>
    </td>
    <td align="center" width="33%">
      <img width="60" height="60" src="https://img.icons8.com/fluency/96/clock.png" alt="clock"/>
      <br><strong>Часы</strong><br>
      <sub>Время и дата</sub>
    </td>
  </tr>
</table>

## 🚀 Установка

```bash
# Клонировать репозиторий
git clone https://github.com/TarzZan52/startpage.git

# Открыть в браузере
open index.html
```

## ⚙️ Настройка

<details>
<summary><b>Изменить фон</b></summary>

Замените `src/wallpaper.jpg` на свое изображение
</details>

<details>
<summary><b>Добавить поисковик</b></summary>

```javascript
const searchEngines = {
    // ...существующие
    bing: { 
        url: 'https://www.bing.com/search?q=', 
        placeholder: 'Поиск в Bing...' 
    }
};
```
</details>

<details>
<summary><b>Изменить криптовалюты</b></summary>

```javascript
const cryptoIds = ['bitcoin', 'ethereum', 'cardano']; // ваш список
```
</details>

## 📄 Лицензия

MIT © [TarzZan52](https://github.com/TarzZan52)