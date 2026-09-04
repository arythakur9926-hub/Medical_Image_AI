# Medical Image AI - Web Application Guide

## Quick Start - Run on Your iPad

### Step 1: Install Docker (if not already installed)
- Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
- Install and start Docker

### Step 2: Clone/Download the Repository
```bash
git clone https://github.com/arythakur9926-hub/Medical_Image_AI.git
cd Medical_Image_AI
```

### Step 3: Start the Application with Docker
```bash
docker-compose up -d
```

The app will start on port 5000.

### Step 4: Access from iPad

#### Option A: Same Network (Recommended)
1. Find your computer's IP address:
   - **Windows:** Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux:** Open Terminal, type `hostname -I`
   - Example IP: `192.168.1.100`

2. On your iPad Safari, go to:
   ```
   http://<YOUR_COMPUTER_IP>:5000
   ```
   Example: `http://192.168.1.100:5000`

#### Option B: Local Computer (Testing)
```
http://localhost:5000
```

---

## Deployment Options

### Option 1: Local Network (Free)
✅ Pros: Free, fast, no registration needed
❌ Cons: Only works on same WiFi, need computer running

Access via: `http://<YOUR_IP>:5000`

---

### Option 2: Heroku (Recommended for iPad)
Best for mobile access from anywhere.

**Step 1:** Create Heroku account at [heroku.com](https://www.heroku.com)

**Step 2:** Install Heroku CLI from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

**Step 3:** Deploy
```bash
heroku login
heroku create medical-image-ai-yours
git push heroku main
heroku open
```

**Your iPad Link:**
```
https://medical-image-ai-yours.herokuapp.com
```

---

### Option 3: AWS (More Powerful)

**Step 1:** Sign up at [aws.amazon.com](https://aws.amazon.com)

**Step 2:** Use Elastic Beanstalk
```bash
pip install awsebcli
eb init -p python-3.9 medical-image-ai
eb create
eb open
```

**Your iPad Link:**
```
https://medical-image-ai-env.elasticbeanstalk.com
```

---

### Option 4: DigitalOcean (Affordable)

**Step 1:** Sign up at [digitalocean.com](https://www.digitalocean.com)

**Step 2:** Create App Platform deployment and connect GitHub repo

**Step 3:** Deploy and get URL

---

## Run Locally (Without Docker)

```bash
# Install dependencies
pip install -r requirements-web.txt

# Run
python web_app.py
```

Access at: `http://localhost:5000`

---

## Troubleshooting

### Can't access from iPad?
- ✅ Check both devices are on same WiFi
- ✅ Use correct IP address (not 127.0.0.1 or localhost)
- ✅ Check firewall isn't blocking port 5000
- ✅ Try `ping <IP>` from iPad to verify connection

### App slow to upload?
- Compress images before upload
- Use faster internet connection
- Close other network applications

### Docker not working?
```bash
# Check if running
docker ps

# View logs
docker logs medical-image-ai

# Stop and restart
docker-compose down
docker-compose up -d
```

---

## Features

✨ **On Your iPad:**
- 📤 Drag & drop image upload
- 📊 Real-time image analysis
- 📄 Generate reports
- 📋 Upload history
- 🟢 Connection status

---

## Recommended: Heroku Deployment for iPad

This is the easiest way to access from anywhere:

1. **Free tier available** - `https://your-app.herokuapp.com`
2. **Always accessible** - from any device, any WiFi
3. **No computer needed** - runs on Heroku servers
4. **Works on iPad** - fully mobile optimized

### Quick Heroku Deploy:
```bash
heroku login
heroku create your-medical-ai-app
git push heroku main
```

Then open: `https://your-medical-ai-app.herokuapp.com` on your iPad! 🎉

---

## Security Tips

- Use HTTPS (Heroku provides this free)
- Don't share your app link publicly
- Keep patient data private
- Regular backups of uploaded files

---

## Need Help?

- Check logs: `docker logs medical-image-ai`
- GitHub Issues: Open an issue on the repo
- Heroku Support: heroku.com/support
