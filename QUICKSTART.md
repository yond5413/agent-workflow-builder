# ⚡ Quick Start Checklist

Follow these steps to get your Workflow Builder up and running in minutes!

## ✅ Pre-Flight Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] OpenRouter API key ready ([Get one](https://openrouter.ai/))

## 🚀 Setup Steps

### 1️⃣ Backend Setup (5 minutes)

```bash
# Navigate to backend
cd fastapi-backend

# Create virtual environment
python -m venv venv

# Activate it (choose your OS):
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo OPENROUTER_API_KEY=your_actual_key_here > .env
# Or manually create a .env file with: OPENROUTER_API_KEY=your_key

# Start the backend
python main.py
```

**Expected output:** Server running at http://localhost:8000

- [ ] Backend running at http://localhost:8000
- [ ] Can access http://localhost:8000/health
- [ ] Can access http://localhost:8000/docs

### 2️⃣ Frontend Setup (2 minutes)

Open a **NEW terminal** (keep backend running):

```bash
# In project root directory
npm run dev
```

**Expected output:** Ready on http://localhost:3000

- [ ] Frontend running at http://localhost:3000
- [ ] Can see the Workflow Builder interface

## 🎯 First Workflow (2 minutes)

### Test the System:

1. **Add Nodes:**
   - Click "Input" button in left panel
   - Click "LLM Task" button
   - Click "Output" button

2. **Configure Input Node:**
   - Click the Input node
   - In right panel, paste: `Hello, AI!`

3. **Configure LLM Node:**
   - Click the LLM Task node
   - In right panel, set prompt to: `Respond to this: {{input}}`

4. **Connect Nodes:**
   - Drag from Input's right circle → to LLM Task's left circle
   - Drag from LLM Task's right circle → to Output's left circle

5. **Run:**
   - Click green "▶️ Run Workflow" button
   - Watch logs at bottom
   - See results in Output node!

- [ ] Workflow executes successfully
- [ ] Logs show execution progress
- [ ] Output node displays LLM response

## 🎉 Success!

If all checkboxes are checked, you're ready to build amazing workflows!

## 📚 Next Steps

1. **Try Example Workflows:**
   - Click "Load" button
   - Open files from `examples/` folder
   - Run and experiment!

2. **Explore Features:**
   - Try different LLM models (GPT-4, Claude, Gemini)
   - Build a web scraper workflow
   - Create structured data extraction
   - Save your workflows as JSON

3. **Learn More:**
   - Read [README.md](./README.md) for full documentation
   - Check [SETUP.md](./SETUP.md) for detailed setup info
   - Review [PRD.md](./PRD.md) for architecture details

## ❓ Troubleshooting

### Backend won't start?
- Check Python version: `python --version` (need 3.8+)
- Make sure venv is activated (you should see `(venv)` in terminal)
- Verify all packages installed: `pip list`

### Frontend won't start?
- Check Node version: `node --version` (need 18+)
- Try: `rm -rf node_modules .next && npm install`

### Execution fails?
- Check both servers are running (ports 3000 and 8000)
- Verify OPENROUTER_API_KEY in `fastapi-backend/.env`
- Check browser console (F12) for errors
- Look at logs panel for error messages

### Can't connect nodes?
- Make sure you're dragging from right side (source) to left side (target)
- Can't connect Input nodes as targets
- Can't connect Output nodes as sources

## 🆘 Need Help?

- Check the logs panel (bottom of screen)
- Open browser console (F12)
- Review terminal output for both servers
- See [SETUP.md](./SETUP.md) for common issues

---

**Pro Tip:** Keep both terminal windows visible side-by-side to monitor logs from both frontend and backend!

Happy building! 🚀

