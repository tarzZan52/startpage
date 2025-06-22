# ⚔️ tarZan's Start Page

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
  <h3>Minimalist browser start page with productivity dashboard</h3>
  <p>Search engines, app shortcuts, Pomodoro timer, habit tracker, and todo list. All data stored locally.</p>
</div>

<br>

![Main View](src/image-v4.png)
![Dashboard View](src/dashboard-view-v2.png)

## 🚀 Installation

**Linux (automatic):**
```bash
git clone https://github.com/TarzZan52/startpage.git
cd startpage/server
./install-service-linux.sh
```

**Manual (any OS):**
```bash
cd startpage
python3 -m http.server 8000
```

Open http://localhost:8000/ in your browser.

**Set as homepage:** Use browser extensions like New Tab Override (Firefox) or New Tab Redirect (Chrome).

## ✨ Features

**Start Page:**
- Multi-engine search (DuckDuckGo, Google, Yandex)
- Customizable app shortcuts (up to 12)
- Real-time date & time

**Dashboard:**
- 🍅 Pomodoro timer with task integration
- 📅 Habit tracker with weekly goals
- ✅ Todo list with priorities and time tracking
- 📈 Progress analytics

All data stored locally. Works on desktop and mobile.

## ⚙️ Management

**Linux service commands:**
```bash
sudo systemctl status/start/stop/restart dashboard.service
./uninstall-service-linux.sh  # Complete removal
```

**Common issues:**
- **Python not found:** Install python3 via your package manager
- **Port 8000 busy:** Kill process with `sudo lsof -i :8000` or change port
- **Can't connect:** Check firewall, try `127.0.0.1:8000`

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

<div align="center">
  Made with ❤️ by <a href="https://github.com/TarzZan52">TarzZan52</a>
</div>