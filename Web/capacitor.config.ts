import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.irvin.midespensa",
  appName: "Mi Despensa",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
