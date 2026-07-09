# Troubleshooting & FAQ

## FAQ

### Does this work with ESP32?
**Yes.** The HTTP payload is standard JSON. As long as your ESP32 can connect to Wi-Fi and make a POST request with the correct `dustbinId`, the backend will accept the data.

### Can I use Firebase instead of MongoDB?
Not natively out-of-the-box. The backend relies heavily on Mongoose. You would need to rewrite the `controllers/` layer to utilize the Firebase Admin SDK.

### Can I deploy on Render?
**Yes.** Render handles WebSockets natively on their free and paid Web Service tiers perfectly.

### Does it support Docker?
Currently, a `Dockerfile` is not included in the root, but the standard Node environment makes it trivial to containerize.

---

## Troubleshooting

### MongoDB won't connect
- **Error:** `bad auth : Authentication failed.`
- **Fix:** Ensure you have replaced the `<db_username>` and `<db_password>` in your `.env` string with actual credentials created in MongoDB Atlas Database Access (not your MongoDB login).
- **Error:** `MongooseServerSelectionError`
- **Fix:** Ensure your MongoDB Atlas Network Access is set to allow connections from `0.0.0.0/0` (Anywhere), or specifically whitelist your deployment server's IP.

### ESP8266 is offline / Dashboard not updating
- **Check 1:** Ensure the ESP8266 is connected to a 2.4GHz Wi-Fi network (it does not support 5GHz).
- **Check 2:** Verify the URL in your C++ firmware matches your deployed backend URL + `/api/update`.
- **Check 3:** Ensure the `dustbinId` string hardcoded into the ESP8266 perfectly matches the ID you registered via the Dashboard.

### Google Maps not loading
- **Error:** Screen shows "Google Maps cannot load correctly on this page."
- **Fix:** Your Google Cloud Console API Key may have expired, or HTTP referrers restrictions might be blocking your domain. Check the Cloud Console for billing or quota limits.
