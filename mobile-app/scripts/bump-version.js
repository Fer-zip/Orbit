const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');

try {
  const data = fs.readFileSync(appJsonPath, 'utf8');
  const appJson = JSON.parse(data);

  // Incrementar versionCode de Android
  let currentVersionCode = appJson.expo.android.versionCode || 1;
  appJson.expo.android.versionCode = currentVersionCode + 1;

  // Incrementar la versión pública (ej. 1.0.1 -> 1.0.2)
  let currentVersion = appJson.expo.version || "1.0.0";
  let versionParts = currentVersion.split('.');
  
  if (versionParts.length === 3) {
    let patch = parseInt(versionParts[2], 10);
    versionParts[2] = (patch + 1).toString();
    appJson.expo.version = versionParts.join('.');
  }

  // Escribir los cambios de vuelta al archivo
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

  console.log(`✅ Versión actualizada exitosamente: v${appJson.expo.version} (Build: ${appJson.expo.android.versionCode})`);
} catch (error) {
  console.error("❌ Error al actualizar la versión en app.json:", error);
  process.exit(1);
}
