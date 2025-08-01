# 🔧 Arduino Setup Guide - Fix Compilation Errors

## ❌ **Problem**
You have multiple Arduino files in the same sketch folder, causing redefinition errors:
- `estove.ino`
- `estove_with_database.ino` 
- `esp32_updated.ino`

## ✅ **Solution**

### **Step 1: Clean Up Your Arduino Project**

1. **Close Arduino IDE**

2. **Navigate to your Arduino sketch folder:**
   ```
   C:\Users\USER\Desktop\proje\estove\estove\
   ```

3. **Delete all existing .ino files:**
   - Delete `estove.ino`
   - Delete `estove_with_database.ino`
   - Delete `esp32_updated.ino`

4. **Keep only the new file:**
   - Keep `estove_final.ino` (the one I just created)

### **Step 2: Fix Library Issues**

#### **For LiquidCrystal_I2C Library:**
The warning about AVR architecture can be ignored, but if you want to fix it:

1. **Install ESP32-compatible LCD library:**
   - Open Arduino IDE
   - Go to **Tools → Manage Libraries**
   - Search for "LiquidCrystal I2C"
   - Install "LiquidCrystal I2C" by **Frank de Brabander**

2. **Alternative: Use ESP32-specific library:**
   ```cpp
   // Replace this line:
   #include <LiquidCrystal_I2C.h>
   
   // With this (if you have issues):
   #include <Wire.h>
   #include <LiquidCrystal_I2C.h>
   ```

### **Step 3: Required Libraries**

Make sure you have these libraries installed:

1. **WiFi** (built-in with ESP32)
2. **HTTPClient** (built-in with ESP32)
3. **Wire** (built-in)
4. **LiquidCrystal I2C** (install from Library Manager)
5. **MAX6675** (install from Library Manager)

### **Step 4: Install MAX6675 Library**

1. **Open Arduino IDE**
2. **Go to Tools → Manage Libraries**
3. **Search for "MAX6675"**
4. **Install "MAX6675" by Rob Tillaart**

### **Step 5: Board Configuration**

1. **Select correct board:**
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module

2. **Select correct port:**
   - Tools → Port → (your ESP32 COM port)

3. **Set upload speed:**
   - Tools → Upload Speed → 115200

### **Step 6: Test Compilation**

1. **Open `estove_final.ino` in Arduino IDE**
2. **Click "Verify" (✓) button**
3. **Should compile without errors**

## 🔧 **Troubleshooting**

### **If you still get errors:**

1. **Check library versions:**
   ```cpp
   // Make sure you have the latest versions
   // LiquidCrystal I2C: v1.1.4 or newer
   // MAX6675: v0.1.0 or newer
   ```

2. **Alternative LCD library:**
   ```cpp
   // If LiquidCrystal_I2C doesn't work, try:
   #include <Wire.h>
   #include <hd44780.h>
   #include <hd44780ioClass/hd44780_I2Cexp.h>
   ```

3. **Check ESP32 board package:**
   - Tools → Board → Boards Manager
   - Search for "ESP32"
   - Install "ESP32 by Espressif Systems"

### **If WiFi connection fails:**

1. **Check WiFi credentials:**
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

2. **Check server URL:**
   ```cpp
   const char* serverUrl = "https://your-deployed-server.onrender.com";
   ```

## 📋 **Final Checklist**

- [ ] Only one `.ino` file in sketch folder
- [ ] All required libraries installed
- [ ] Correct board selected (ESP32 Dev Module)
- [ ] Correct port selected
- [ ] Code compiles without errors
- [ ] WiFi credentials updated
- [ ] Server URL updated to your deployed server

## 🚀 **Next Steps**

After successful compilation:

1. **Upload to ESP32**
2. **Open Serial Monitor** (115200 baud)
3. **Check WiFi connection**
4. **Test web integration**
5. **Deploy your server** (if not already done)

Your ESP32 should now work with both physical switch and web controls! 🎉 