# Thread - Error Handling & Troubleshooting Guide

## 🎯 Overview

Comprehensive error handling has been implemented in Thread with user-friendly error messages, automatic troubleshooting tips, and retry functionality.

---

## ✨ Features Implemented

### 1. **Error Detection & Classification**

The app now detects and categorizes various error types:

- **Timeout Errors** - When server takes too long to respond (10s timeout)
- **Offline Errors** - No internet connection detected
- **404 Not Found** - API endpoint doesn't exist
- **500 Server Errors** - Internal server errors
- **Network Errors** - Cannot reach server
- **Save Errors** - Failed to save data to server
- **Unknown Errors** - Unexpected errors with generic troubleshooting

### 2. **Error Severity Levels**

Each error is classified by severity with appropriate visual indicators:

- 🔴 **Error** (Red) - Critical issues requiring attention
- 🟠 **Warning** (Orange) - Issues that don't prevent app usage
- 🔵 **Info** (Blue) - Informational messages

### 3. **Online/Offline Detection**

- Real-time monitoring of internet connectivity
- Automatic retry when connection is restored
- Visual indicator in header showing offline status
- Graceful degradation - app continues working offline with local data

### 4. **User-Facing Error Messages**

Each error displays:
- **Clear title** - What went wrong
- **Details** - Why it happened
- **Troubleshooting tips** - Step-by-step guidance
- **Retry button** - One-click retry for recoverable errors
- **Dismiss button** - Close the error message

### 5. **Automatic Recovery**

- **Auto-sync on reconnection** - Data automatically loads when back online
- **Local state preservation** - Changes saved locally even if server save fails
- **Retry logic** - Smart retry with timeout handling
- **Loading states** - Visual feedback during operations

---

## 📋 Error Types & Solutions

### **Connection Timeout**
```
Message: "Connection timeout"
Details: "The server took too long to respond."
```

**Troubleshooting:**
- Check your internet connection
- The server might be experiencing high load
- Try refreshing the page

---

### **No Internet Connection**
```
Message: "No internet connection"
Details: "You appear to be offline."
```

**Troubleshooting:**
- Check your WiFi or mobile data connection
- Make sure airplane mode is off
- Your changes will be saved locally

**Visual Indicator:** Orange "Offline" badge in header

---

### **API Endpoint Not Found (404)**
```
Message: "API endpoint not found"
Details: "The data endpoint could not be reached."
```

**Troubleshooting:**
- Make sure the server is running
- Check if the API path is correct
- Contact support if the problem persists

**Tech Note:** Verify nginx configuration and server routing

---

### **Server Error (500)**
```
Message: "Server error"
Details: "The server encountered an error."
```

**Troubleshooting:**
- Wait a moment and try again
- The server might be restarting
- Check server logs for details

**Admin Note:** Check backend logs for stack traces

---

### **Save Timeout**
```
Message: "Save timeout"
Details: "Changes were saved locally but may not be synced to the server."
```

**Troubleshooting:**
- Your changes are saved locally
- Check your internet connection
- Click retry to sync with server

**Important:** Local state is preserved, no data loss

---

### **Failed to Save (Offline)**
```
Message: "Offline - changes saved locally"
Details: "Your changes will sync when you're back online."
```

**Troubleshooting:**
- Changes are saved in your browser
- Don't clear browser data
- Will auto-sync when connection returns

**Severity:** Info (non-critical)

---

### **Failed to Save to Server**
```
Message: "Failed to save to server"
Details: "Changes are saved locally."
```

**Troubleshooting:**
- Your changes are still visible locally
- Try clicking retry to sync
- Check if the server is running
- Refresh page as a last resort

---

## 🔧 Technical Implementation

### State Management

```javascript
const [error, setError] = useState(null);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [isLoading, setIsLoading] = useState(true);
const [retryCount, setRetryCount] = useState(0);
```

### Error Object Structure

```javascript
{
  type: 'timeout' | 'offline' | 'not_found' | 'server_error' | 'save_error' | 'unknown',
  message: 'User-friendly error title',
  details: 'More information about what happened',
  troubleshooting: ['Step 1', 'Step 2', 'Step 3'],
  severity: 'error' | 'warning' | 'info',
  canRetry: true | false,
  retryAction: () => {} // Optional custom retry function
}
```

### Event Listeners

```javascript
// Online/Offline detection
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Auto-retry on reconnection
const handleOnline = () => {
  setIsOnline(true);
  setError(null);
  loadData();
};
```

### Timeout Implementation

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

const response = await fetch('/api/data', {
  signal: controller.signal
});

clearTimeout(timeoutId);
```

---

## 🎨 UI Components

### Error Banner
- Positioned at top of content area
- Color-coded by severity
- Includes icon, message, details, troubleshooting tips
- Retry and Dismiss buttons
- Smooth animations
- Dark/Light theme support

### Offline Indicator
- Shows in header when offline
- Orange badge with WiFi icon
- Automatically disappears when back online

### Loading State
- Spinner with "Loading your contacts..." message
- Shows during initial data load
- Prevents interaction during loading

---

## 🚀 Usage Examples

### Handling Load Errors

```javascript
const loadData = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/data', { signal: controller.signal });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    // Update state...
    
  } catch (error) {
    // Set appropriate error object with troubleshooting
    setError({...});
  } finally {
    setIsLoading(false);
  }
};
```

### Handling Save Errors

```javascript
const saveData = async (updatedData) => {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) throw new Error('Save failed');
    
    // Update state...
    
  } catch (error) {
    // IMPORTANT: Still update local state to prevent data loss
    setContacts(updatedData);
    
    // Show error with retry option
    setError({
      canRetry: true,
      retryAction: () => saveData(updatedData)
    });
  }
};
```

---

## 📊 User Experience Benefits

1. **Transparency** - Users always know what's happening
2. **Guidance** - Clear steps to resolve issues
3. **No Data Loss** - Local changes preserved even with save errors
4. **Automatic Recovery** - Auto-sync when connection restored
5. **Non-Blocking** - App remains usable during errors
6. **Professional** - Enterprise-grade error handling

---

## 🔍 Debugging Tips

### For Users

1. **Check browser console** (F12) for detailed error logs
2. **Look for network tab** to see failed requests
3. **Verify server is running** on expected port
4. **Clear browser cache** if experiencing persistent issues
5. **Try incognito mode** to rule out extension conflicts

### For Developers

1. **Server logs** - Check backend for error stack traces
2. **Network inspection** - Use browser DevTools Network tab
3. **CORS issues** - Verify CORS headers are set correctly
4. **nginx config** - Ensure proxy_pass is configured properly
5. **Database connection** - Verify database is accessible
6. **File permissions** - Check write permissions for data files

---

## 🎯 Best Practices

### When Adding New Features

1. Always wrap API calls in try-catch
2. Use the AbortController for timeout handling
3. Update local state even if server save fails
4. Provide specific, actionable troubleshooting tips
5. Test offline behavior
6. Include retry functionality for recoverable errors

### Error Message Guidelines

✅ **Do:**
- Use simple, non-technical language
- Explain what happened and why
- Provide clear next steps
- Indicate if data was preserved
- Show severity appropriately

❌ **Don't:**
- Show raw error messages or stack traces
- Use jargon without explanation
- Leave users without guidance
- Block the entire UI unnecessarily
- Ignore errors silently

---

## 📝 Future Enhancements

Potential improvements to consider:

- [ ] Error logging to external service (e.g., Sentry)
- [ ] Automatic retry with exponential backoff
- [ ] Offline queue for save operations
- [ ] Service Worker for true offline support
- [ ] Error analytics and monitoring
- [ ] Custom error recovery strategies per error type
- [ ] Toast notifications for non-critical errors
- [ ] Error history/log viewer

---

## 🤝 Contributing

When contributing to error handling:

1. Follow existing error object structure
2. Provide 3-5 troubleshooting steps
3. Test all error scenarios
4. Update this guide with new error types
5. Ensure dark/light theme compatibility
6. Test offline behavior thoroughly

---

## 📞 Support

If you encounter errors not covered by this guide:

1. Check browser console for details
2. Review server logs
3. Consult the main README.md
4. Open an issue with error details and steps to reproduce

---

**Last Updated:** November 24, 2025
**Version:** 2.0.0
