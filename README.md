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
  <a href="https://github.com/TarzZan52/startpage"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white&labelColor=302D41" alt="JavaScript"></a>
</p>

<div align="center">
  <h3>Минималистичная и кастомизируемая стартовая страница для браузера.</h3>
  <p>Позволяет добавлять ссылки на любимые сайты, переключаться между поисковыми системами и отображает текущее время. Все настройки хранятся локально в вашем браузере.</p>
</div>

<br>

<p align="center">
  <img src="src/image-v2.png" alt="Основной вид страницы" width="90%">
</p>

---

## 🚀 Установка

### Быстрый старт (1 минута)

#### Windows:
1. Скачайте репозиторий
2. Откройте папку `server`
3. Запустите `install-service-windows.bat` **от имени администратора**
4. Готово! Откройте http://localhost:8000/

#### Linux:
```bash
git clone https://github.com/TarzZan52/startpage.git
cd startpage/server
chmod +x install-service-linux.sh
./install-service-linux.sh
```

#### macOS / Ручной запуск:
```bash
cd startpage
python3 -m http.server 8000
# Откройте http://localhost:8000/
```

### 📌 Установка как домашняя страница

#### 1: New Tab Override (рекомендуется)

Установите расширение для автоматической замены новой вкладки:

- **Firefox**: [New Tab Override](https://addons.mozilla.org/firefox/addon/new-tab-override/)
- **Chrome**: [New Tab Redirect](https://chrome.google.com/webstore/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna)

После установки расширения:
1. Откройте настройки расширения
2. Введите URL: `http://localhost:8000/`
3. Сохраните изменения

#### 2: Настройки браузера

**Firefox:**
1. Настройки → Начало → Домашняя страница
2. Введите: `http://localhost:8000/`

**Chrome/Edge:**
1. Настройки → При запуске → Открыть страницу
2. Добавьте: `http://localhost:8000/`


## 🛠️ Управление сервером

### Windows:
- **Остановить:** `Win+R` → `cmd` → `schtasks /end /tn "DashboardWebServer"`
- **Запустить:** `schtasks /run /tn "DashboardWebServer"`
- **Удалить автозапуск:** запустите `server/uninstall-service-windows.bat`

### Linux:
```bash
sudo systemctl status dashboard.service  # Статус
sudo systemctl stop dashboard.service    # Остановить
sudo systemctl restart dashboard.service # Перезапустить
./server/uninstall-service-linux.sh      # Удалить
```

## 🛠️ Устранение неполадок

**Python не найден:**

-   **Windows:** Скачайте установщик с [python.org](https://python.org) и при установке не забудьте отметить галочку "Add python.exe to PATH".

-   **Linux:** Python 3, как правило, уже установлен в современных дистрибутивах. Если нет, воспользуйтесь официальным менеджером пакетов вашей системы для его установки.

**Порт 8000 занят:**
- Измените порт в скриптах на другой (например, 8080)

**Не открывается в браузере:**
- Проверьте файрвол/антивирус
- Попробуйте `http://127.0.0.1:8000/`

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 🤝 Вклад в проект

>Приветствуются любые предложения и улучшения! Не стесняйтесь   создавать Issue или Pull Request.


---

<div align="center">
  <p>Сделано с ❤️ by <a href="https://github.com/TarzZan52">TarzZan52</a></p>
</div>