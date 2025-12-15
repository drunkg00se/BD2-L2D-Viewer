import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { useCharacterStore } from "@/stores/characterStore";
import { applyUrlParams } from "@/utils/urlSync";
import App from "./App.vue";

import SpineInfo from "/SpineInfo.json?url";

async function loadSpine(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load json");
  }
  return res.json();
}

async function bootstrap() {
  const spineInfo = await loadSpine(SpineInfo);

  const pinia = createPinia();
  const store = useCharacterStore(pinia);
  applyUrlParams(store, window.location.search);

  const app = createApp(App);
  app.use(pinia);

  useCharacterStore().init(spineInfo);

  app.mount("#app");
}

bootstrap();
