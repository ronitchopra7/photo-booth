# 📷 Photo Booth

A modern, web-based photo booth application that lets you take 4 selfies and create beautiful, shareable photo strips. Perfect for sharing with friends on iMessage and other platforms!

## ✨ Features

- **4-Photo Capture**: Take 4 sequential selfies with a live camera preview
- **Countdown Timer**: 3-second countdown before each photo for perfect poses
- **Customizable Colors**: 
  - Choose from 10 preset colors (rainbow + grayscale) for backgrounds
  - Customize border colors independently
  - Full color picker for unlimited customization
- **Photo Strip Generation**: Automatically combines all 4 photos into a beautiful vertical strip
- **Download & Share**: 
  - Download your photo strip as PNG
  - Share directly via native share API (works on mobile)
  - Copy to clipboard for easy pasting
  - Custom share messages
- **Modern UI**: Beautiful, responsive design with animated gradient background
- **Mobile-Friendly**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- A modern web browser with camera access (Chrome, Firefox, Safari, Edge)
- Camera permissions enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photo-booth.git
cd photo-booth
```

2. Install dependencies (optional - for dev server):
```bash
npm install
```

3. Open `index.html` in your browser, or run a local server:
```bash
npm start
```

That's it! No build process required - it's a pure vanilla JavaScript application.

## 📖 How to Use

1. **Allow Camera Access**: When prompted, allow the browser to access your camera
2. **Take Photos**: Click "Take Photo" 4 times
   - A 3-second countdown will appear before each photo
   - See your photos appear in the preview grid as you capture them
3. **Customize Your Strip**:
   - Choose background color from presets or use the color picker
   - Choose border color to frame your photos
   - Both update in real-time
4. **Share Your Strip**:
   - Optionally customize your share message
   - Click "Download Strip" to save locally
   - Click "Share" to use native sharing (mobile) or copy to clipboard
5. **Start Over**: Click "New Strip" to create another one!

## 🎨 Color Options

The app includes 10 preset colors:
- **Rainbow Colors**: Red, Orange, Yellow, Green, Cyan, Blue, Purple (all in subtle, muted tones)
- **Grayscale**: White, Gray, Black

Plus a full color picker for unlimited customization!

## 🛠️ Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with animations and gradients
- **Vanilla JavaScript**: No frameworks - pure JavaScript
- **Canvas API**: For photo capture and strip generation
- **MediaDevices API**: Camera access
- **Web Share API**: Native sharing functionality
- **Clipboard API**: Copy to clipboard fallback

## 📱 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Camera access requires HTTPS in production (works on `localhost` for development).

## 🎯 Features in Detail

### Timer Functionality
- 3-second countdown before each photo
- Large, animated countdown display
- Prevents accidental multiple captures

### Color Customization
- Real-time preview of color changes
- Separate controls for background and borders
- Preset colors for quick selection
- Full color picker for custom colors

### Photo Strip Layout
- Compact, vertical layout
- Evenly spaced photos
- Continuous borders connecting all edges
- Professional photo booth aesthetic

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 🙏 Acknowledgments

Built with ❤️ for creating and sharing memories with friends!

---

**Enjoy creating your photo strips! 📸✨**
