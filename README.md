# Presentera - Fullstack Presentation Editor

A modern, full-featured presentation editor built with React and FastAPI. Convert PowerPoint files to JSON, edit presentations in a beautiful web interface, and export your work.

## 🚀 Features

- **PPTX to JSON Conversion** - Upload PowerPoint files and convert them to editable JSON format
- **Rich Text Editing** - Edit text with full formatting options
- **Visual Elements** - Add shapes, images, charts, and tables
- **Template Library** - Start with professional templates
- **Export Options** - Download your presentations in various formats
- **Real-time Preview** - See changes instantly

## 📁 Project Structure

```
presentera-fullstack/
├── backend/          # FastAPI backend server
│   ├── converter/    # PPTX conversion logic
│   ├── main.py       # FastAPI application
│   └── requirements.txt
├── frontend/         # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json
└── DEPLOYMENT.md     # Deployment guide
```

## 🛠️ Tech Stack

### Frontend
- React 19
- Konva (Canvas rendering)
- Tailwind CSS
- React Router

### Backend
- FastAPI
- Python-pptx
- Uvicorn

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

### Environment Variables

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed information.

**Local Development:**
- Create `frontend/.env` with `REACT_APP_BACKEND_URL=http://localhost:8000`

## 📦 Deployment

This project is designed to be deployed with:
- **Frontend:** Vercel
- **Backend:** Render

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deployment Steps

1. **Initialize Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy Backend to Render:**
   - Connect GitHub repo
   - Select `backend` as root directory
   - Use start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Deploy Frontend to Vercel:**
   - Connect GitHub repo
   - Set root directory to `frontend`
   - Add environment variable: `REACT_APP_BACKEND_URL=https://your-backend.onrender.com`

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Environment variables reference
- [backend/README.md](./backend/README.md) - Backend API documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation

## 🔧 API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /convert` - Convert PPTX to JSON
- `GET /docs` - Interactive API documentation (Swagger UI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Support

For deployment issues, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Troubleshooting section
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Common issues

## 🙏 Acknowledgments

Built with modern web technologies and best practices.

---

**Ready to deploy?** Check out [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions!

