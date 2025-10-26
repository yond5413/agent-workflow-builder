# Media Export & Playback Feature

## Overview
Added comprehensive media playback and export functionality to all media-generating nodes, enabling users to listen to audio, view images/videos, and download generated media files. Also fixed template variable display issue where nodes showed `{{input}}` instead of actual resolved values.

## Changes Made

### 1. Text to Speech Node (`TextToSpeechNode.tsx`)
**Features Added:**
- ✅ **Audio Player**: HTML5 audio element with playback controls
- ✅ **Download Button**: Export generated audio as `.mp3` file
- ✅ **Real-time Playback**: Listen to audio immediately after generation

**Implementation:**
- Displays audio player when `data.output.audioBase64` is available
- Download function creates a data URL link and triggers download
- Compact UI design fits within node constraints

### 2. Text to Image Node (`TextToImageNode.tsx`)
**Features Added:**
- ✅ **Image Preview**: Display generated image directly in node
- ✅ **Download Button**: Export image as `.jpg` file
- ✅ **Click-to-Download**: Image preview is clickable for quick download
- ✅ **Hover Effects**: Visual feedback for interactive elements

**Implementation:**
- Fixed image display bug (was using `data.output` instead of `data.output.imageBase64`)
- Added download button below image preview
- Responsive sizing with proper aspect ratio handling

### 3. Image to Video Node (`ImageToVideoNode.tsx`)
**Features Added:**
- ✅ **Video Player**: HTML5 video element with full controls
- ✅ **Download Button**: Export generated video as `.mp4` file
- ✅ **Video Preview**: Watch video directly in the workflow canvas

**Implementation:**
- Video player appears when `data.output.videoBase64` is available
- Constrained height for better canvas integration
- Download functionality for video files

### 4. Output Node (`OutputNode.tsx`)
**Features Added:**
- ✅ **Output Preview**: Smart detection of output type (text/image/audio/video)
- ✅ **Media Indicators**: Shows icons for different media types
- ✅ **Export JSON**: Download complete workflow output as JSON file
- ✅ **Empty State**: Helpful message when no output is available

**Implementation:**
- Detects media types in output data
- Shows appropriate icons and labels
- JSON export with formatted output
- Handles arrays of media outputs

### 5. Documentation (`examples/README.md`)
**Updates:**
- Added "Media Outputs & Export" section
- Documented all playback and download features
- Provided usage tips and shortcuts
- Clear feature descriptions for each node type

## Technical Details

### File Formats
- **Audio**: MP3 format (`audio/mpeg`)
- **Images**: JPEG format (`image/jpeg`)
- **Video**: MP4 format (`video/mp4`)

### Data Handling
All media is encoded as base64 data URLs:
- Text-to-Speech: `data:audio/mpeg;base64,...`
- Text-to-Image: `data:image/jpeg;base64,...`
- Image-to-Video: `data:video/mp4;base64,...`

### Download Mechanism
```typescript
const handleDownload = () => {
  const link = document.createElement("a");
  link.href = data.output.mediaBase64;
  link.download = `filename-${id}-${Date.now()}.ext`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### UI Components
- **Buttons**: Blue theme (`bg-blue-500`) for media downloads
- **Output Export**: Green theme (`bg-green-500`) for final outputs
- **Compact Design**: All controls fit within standard node width
- **Responsive**: Works on different screen sizes

## User Benefits

1. **Immediate Feedback**: See/hear results without leaving the canvas
2. **Easy Export**: One-click download for all media types
3. **Workflow Testing**: Verify outputs during development
4. **Content Sharing**: Export media for use in other applications
5. **Batch Processing**: Download media from multiple nodes

## Example Workflows Enhanced

The following example workflows now have full media capabilities:
- `text-to-speech-workflow.json` - Listen and download audio
- `text-to-image-workflow.json` - View and download images
- `creative-content-pipeline.json` - Multiple media outputs with downloads

## Bug Fixes

### Template Variable Display Issue (CRITICAL FIX)
**Problem:** Nodes were displaying template variables (e.g., `{{input}}`) instead of the actual resolved values after workflow execution. The audio/images were being generated with the literal text "{{input}}" instead of the actual input content.

**Root Cause:** The workflow engine (`engine.ts`) was NOT interpolating template variables for text-to-speech and text-to-image nodes. The code only interpolated when the text/prompt field was empty, but if it contained a template like `"{{input}}"`, it was used as-is without interpolation.

**Solution (2-part fix):**

1. **Engine Fix** (`src/lib/engine.ts`):
   - **executeTextToSpeechNode**: Changed `let text = nodeData.text || ""` to `const text = this.interpolateInput(nodeData.text || "", input)` - now ALWAYS interpolates
   - **executeTextToImageNode**: Changed `let prompt = nodeData.prompt || ""` to `const prompt = this.interpolateInput(nodeData.prompt || "", input)` - now ALWAYS interpolates
   
2. **UI Display Fix** (Node components):
   - **TextToSpeechNode**: Now shows `data.output.text` (actual resolved text) instead of `data.text` (template)
   - **TextToImageNode**: Now shows `data.output.prompt` (actual resolved prompt) instead of `data.prompt` (template)
   - **LLMTaskNode**: Added response preview showing actual LLM output
   - **WebScraperNode**: Added scraped content preview
   - **StructuredOutputNode**: Added parsed JSON preview

### Output Previews
All processing nodes now show a green checkmark (✓) with a preview of their output after successful execution, making it easier to verify results without checking logs.

## Testing Checklist

- [x] Text-to-Speech: Audio plays correctly
- [x] Text-to-Speech: Download produces valid MP3
- [x] Text-to-Speech: Shows actual text, not template
- [x] Text-to-Image: Image displays in node
- [x] Text-to-Image: Download produces valid JPG
- [x] Text-to-Image: Shows actual prompt, not template
- [x] Image-to-Video: Video plays in node
- [x] Image-to-Video: Download produces valid MP4
- [x] Output Node: Detects media types correctly
- [x] Output Node: JSON export includes all data
- [x] LLM Node: Shows response preview
- [x] Web Scraper: Shows content preview
- [x] Structured Output: Shows parsed JSON preview
- [x] No linting errors
- [x] No console errors

## Future Enhancements

Potential improvements for future versions:
- [ ] Preview modal for full-screen media viewing
- [ ] Batch download all media from workflow
- [ ] Media library/history panel
- [ ] Share media directly to cloud storage
- [ ] Audio waveform visualization
- [ ] Video thumbnail preview before generation
- [ ] Custom filename input for downloads
- [ ] Format conversion options (e.g., PNG, WAV)

## Browser Compatibility

All features use standard HTML5 APIs and are compatible with:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- Base64 encoding increases data size by ~33%
- Large videos may impact browser performance
- Downloads use client-side data URLs (no server upload)
- All media stays in browser memory until page refresh

