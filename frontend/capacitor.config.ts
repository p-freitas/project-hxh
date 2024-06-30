import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "Project HxH",
  webDir: "build",
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      iosClientId:
        "655660941187-4cphnh8k4iml0lo2s6hanjk4pis0lcvp.apps.googleusercontent.com",
      clientId:
        "655660941187-i810s1lm2k7dghl7aemauq06o65c7mfj.apps.googleusercontent.com",
      androidClientId:
        "655660941187-i810s1lm2k7dghl7aemauq06o65c7mfj.apps.googleusercontent.com",
      serverClientId:
        "655660941187-i810s1lm2k7dghl7aemauq06o65c7mfj.apps.googleusercontent.com",
    },
  },
};

export default config;
