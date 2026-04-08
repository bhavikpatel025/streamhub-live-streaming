# 🎮 StreamHub - Live Streaming Platform

<div align="center">

![StreamHub](https://img.shields.io/badge/StreamHub-Live_Streaming-ef4444?style=for-the-badge&logo=twitch)
![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
![Angular 19](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A professional live streaming platform built with .NET 8, Angular 19, and SignalR**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Installation](#-setup-guide) • [Streaming Setup](#-streaming-setup)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Setup Guide](#-setup-guide)
- [Streaming Setup](#-streaming-setup)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🎯 About

**StreamHub** is a full-featured live streaming platform inspired by Twitch and YouTube Live. Built with a modern tech stack, it provides a seamless experience for creators to broadcast their content using OBS and for viewers to watch and interact in real-time. Features include RTMP to HLS video converting with Nginx, real-time chat, live viewer counts, interactive reactions, and a robust notification system.

### Key Highlights

- 📹 **Live Video Streaming** - OBS integration with Nginx RTMP and HLS playback
- 💬 **Live Chat** - Real-time messaging during streams powered by SignalR
- 📊 **Real-time Metrics** - Live viewer counts and stream statistics
- 😊 **Stream Reactions** - Interactive like/dislike capabilities for viewers
- 🔔 **Instant Notifications** - "Streamer is live" alerts and toast notifications
- 🎨 **Modern UI/UX** - Responsive design with Light/Dark mode and stream search

---

## ✨ Features

### 🔐 Authentication
- **User Registration & Login** - Secure, JWT-based authentication
- **Secure API Access** - Protected endpoints utilizing standard .NET authorization

### 🎥 Live Streaming
- **OBS Streaming** - Broadcast easily using custom Stream Keys
- **Nginx RTMP Integration** - Converts RTMP streams into HLS (.m3u8) format
- **Web Video Player** - Built-in Angular player for seamless HLS video playback
- **Stream Discovery** - Live stream cards elegantly shown on the browse page

### ⚡ Real-time Features (SignalR)
- **Live Chat** - Interactive, low-latency stream chat rooms
- **Viewer Count** - Real-time synchronization of current active viewers
- **Reactions** - Instant positive/negative continuous feedback (Likes/Dislikes)
- **Event Synchronization** - Stream start / end notifications pushed instantly

### 🎛️ Stream Management
- **Stream Dashboard** - Dedicated creator space to manage broadcasts
- **Stream Lifecycle** - Create, Start, and Stop stream broadcasts
- **Secure Keys** - Generate and reveal secure Stream Keys for OBS

### 🔔 Notifications System
- **Real-time Alerts** - Pushed "Streamer is live" notifications
- **Toasts** - Non-intrusive popups for active site users
- **Notification Dropdown** - Dedicated menu with unread counts
- **Management** - View, delete, and clear all notifications

### 🎨 UI/UX Features
- **Theming** - Full Light / Dark mode support globally
- **Stream Search** - Case-insensitive header search by title or streamer
- **Responsive Layout** - Clean PrimeNG components that adapt to mobile/desktop
- **Stream Pagination** - Show more / show less stream list view

---

## 🛠️ Tech Stack

### Frontend
| Technology | Description |
|-----------|-------------|
| ![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular) | Application Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript) | Programming Language |
| ![PrimeNG](https://img.shields.io/badge/PrimeNG-UI-205E61?logo=primeng) | UI Component Library |
| ![RxJS](https://img.shields.io/badge/RxJS-Reactive-B7178C?logo=reactivex) | Reactive Programming |
| ![HLS.js](https://img.shields.io/badge/HLS.js-Video-333333) | Video Playback Client |

### Backend
| Technology | Description |
|-----------|-------------|
| ![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet) | Web API Framework |
| ![C#](https://img.shields.io/badge/C%23-12.0-239120?logo=csharp) | Programming Language |
| ![SignalR](https://img.shields.io/badge/SignalR-Server-512BD4?logo=dotnet) | WebSockets & Real-time |
| ![SQL Server](https://img.shields.io/badge/SQL_Server-Database-CC2927?logo=microsoftsqlserver) | Primary Database |
| ![Entity Framework](https://img.shields.io/badge/EF_Core-8.0-512BD4?logo=dotnet) | ORM layer |
| ![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens) | Secure Authentication |

### Streaming Infrastructure
| Technology | Description |
|-----------|-------------|
| ![Nginx](https://img.shields.io/badge/Nginx-RTMP-009639?logo=nginx) | RTMP & Media Server |
| ![OBS](https://img.shields.io/badge/OBS-Studio-302E31?logo=obsstudio) | Broadcasting Software |

---

## 🏗️ Architecture

The backend is built following **Clean Architecture** principles to separate concerns carefully across domain layers.

```text
StreamHub Repository
├── StreamHub.API             # Controllers, SignalR Hubs, API configs
├── StreamHub.Application     # DTOs, Interfaces, Service Logic, Mappings
├── StreamHub.Domain          # Core Entities models
└── StreamHub.Infrastructure  # DbContext, Repositories, Migrations
```

* **Repository Pattern:** Abstracted data entry layers protecting database contexts.
* **SignalR Hubs:** High performance real-time push functionality.
* **RxJS Angular Services:** Predictable, reactive, state-managed frontend interactions.

---

## ⚙️ Setup Guide

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli) v19
- SQL Server

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/StreamHub.git
cd StreamHub
```

### 2️⃣ Backend Setup
```bash
# Navigate to API project
cd backend/StreamHub.API

# Update the database connection string matching your local setup
# inside appsettings.json

# Run Entity Framework Migrations & Update Db
dotnet ef database update

# Start backend 
dotnet run
```

### 3️⃣ Frontend Setup
```bash
# Navigate to the angular UI
cd frontend/streamhub-ui

# Install dependencies
npm install

# Start development server
ng serve
```

Project runs successfully at `http://localhost:4200`!

---

## 📡 Streaming Setup

To fully test live streaming, you will need **Nginx with the RTMP module** and **OBS Studio**.

### Setting up Nginx + RTMP (Windows)
1. Download a pre-compiled Windows build of Nginx containing RTMP `nginx-rtmp-win32`.
2. Extract the folder into `C:\nginx`
3. Modify the `conf/nginx.conf` to configure the RTMP routing block:
```nginx
rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record off;
            
            # HLS Output config
            hls on;
            hls_path /temp/hls;
            hls_fragment 3;
            hls_playlist_length 60;
        }
    }
}
```
4. Start Nginx by opening a command prompt inside the executable directory and running `nginx.exe`.

### Setting up OBS Studio
1. Open OBS Studio
2. Navigate to **Settings -> Stream**
3. Select **Service**: Custom...
4. Set **Server**: `rtmp://localhost/live`
5. Set **Stream Key**: `(Generate and copy this from your StreamHub Creator Dashboard!)` 
6. Click **Start Streaming**

---

## 📷 Screenshots

### Browse Live Streams & Header Search
*(Comming soon...)*

### Light / Dark Mode System
*(Comming soon...)*

### Streamer Dashboard & Stream Key Generation
*(Comming soon...)*

### Live Stream Viewer (with Chat and Reactions)
*(Comming soon...)*

### Real-Time Notifications
*(Comming soon...)*

---

## 🔮 Future Improvements

- [ ] **Stream Recording / VODs** - Allow viewers to re-watch past streams
- [ ] **Adaptive Bitrate Streaming** - Multi-quality playback (1080p, 720p, 480p)
- [ ] **Channel Subscriptions** - User sub tools and badges
- [ ] **Tipping / Donations System** - Integration with Stripe
- [ ] **Dockerization** - Containers for easier orchestration of Nginx and the .NET Backend
- [ ] **Cloud Storage** - Save and serve profile pictures and VoDs from AWS S3
- [ ] **Advanced Moderation Tools** - Chat bans, timeouts, and automated filters

---

## 👨‍💻 Author

### Bhavik Patel

- **GitHub:** [bhavikpatel025](https://github.com/bhavikpatel025)
- **Repositories:** Check out my other full-stack clones like the [Video Meet Google alternative](https://github.com/bhavikpatel025/video-meet-clone)!

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
