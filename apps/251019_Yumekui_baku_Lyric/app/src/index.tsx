import { registerRoot } from "remotion";
import { LoadSkia } from "@shopify/react-native-skia/lib/module/web";

(async () => {
  try {
    await LoadSkia();
  } catch (error) {
    console.warn("⚠️ Skia initialization failed, falling back to DOM rendering.", error);
  }

  const { RemotionRoot } = await import("./RemotionRoot");
  registerRoot(RemotionRoot);
})();

