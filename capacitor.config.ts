import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.61fccfbcb6c24808ad5fd692a4e939eb',
  appName: 'mensageira-digital',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://61fccfbc-b6c2-4808-ad5f-d692a4e939eb.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;