<template>
  <div class="w-full lg:w-64 lg:h-full bg-gray-800 text-white flex flex-col min-h-0">
    <div class="flex-1 min-h-0 px-2 hidden lg:flex flex-col gap-2">
      <span class="pt-2">Skins</span>
      <div>
        <template v-for="skin in skins" :key="skin">
          <label
            :for="skin"
            class="block bg-gray-700 hover:bg-gray-500 text-white cursor-pointer p-1 has-checked:bg-gray-500"
          >
            <span> {{ skin }} </span>
            <input
              type="radio"
              :id="skin"
              name="skin"
              :value="skin"
              v-model="store.selectedSkin"
              hidden
            />
          </label>
        </template>
      </div>

      <span>Animations</span>
      <div class="overflow-y-auto sidebar-scroll flex-1">
        <div
          v-for="name in animations"
          :key="name"
          class="py-2 pl-2 cursor-pointer"
          :class="{ 'bg-gray-700': name === selectedAnimation }"
          @click="select(name)"
        >
          {{ name }}
        </div>
      </div>
    </div>
    <div class="lg:mt-auto flex flex-col">
      <div v-if="!currentChar?.customFiles" class="p-2">
        <span>Animation Category</span>
        <label
          for="cate-character"
          class="mt-1 block p-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer has-checked:bg-gray-600 has-disabled:text-gray-500 has-disabled:bg-gray-700 has-disabled:hover:bg-gray-700 has-disabled:cursor-not-allowed"
        >
          <input
            type="radio"
            id="cate-character"
            value="character"
            v-model="store.animationCategory"
            :disabled="!currentChar?.spine"
            hidden
          />
          Character</label
        >
        <label
          :disabled="!currentChar?.cutscene"
          for="cate-ultimate"
          class="block p-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer has-checked:bg-gray-600 has-disabled:text-gray-500 has-disabled:bg-gray-700 has-disabled:hover:bg-gray-700 has-disabled:cursor-not-allowed"
        >
          <input
            type="radio"
            id="cate-ultimate"
            value="ultimate"
            v-model="store.animationCategory"
            :disabled="!currentChar?.cutscene"
            hidden
          />
          Ultimate</label
        >
        <label
          :disabled="!currentChar?.dating"
          for="cate-dating"
          class="block p-1 bg-gray-700 hover:bg-gray-500 text-white cursor-pointer has-checked:bg-gray-600 has-disabled:text-gray-500 has-disabled:bg-gray-700 has-disabled:hover:bg-gray-700 has-disabled:cursor-not-allowed"
        >
          <input
            type="radio"
            id="cate-dating"
            value="dating"
            v-model="store.animationCategory"
            :disabled="!currentChar?.dating"
            hidden
          />
          Fated Guest</label
        >
      </div>
      <div class="p-2">
        <span>Animation Speed</span>
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            v-model.number="store.animationSpeed"
            class="flex-1"
          />
          <span class="w-12 text-right">{{ store.animationSpeed.toFixed(2) }}x</span>
        </div>
      </div>
      <div class="p-2 gap-2 hidden lg:flex">
        <button
          class="bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="emit('reset-camera')"
        >
          Reset View
        </button>
        <button
          class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition px-4 py-2"
          @click="store.playing = !store.playing"
        >
          {{ toggleLabel }}
        </button>
      </div>
      <div class="p-2 flex">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="colorInput?.click()"
        >
          BG Color
        </button>
        <input ref="colorInput" type="color" class="hidden" @input="onColorChange" />
      </div>
      <div class="p-2 flex gap-2 items-center">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="onScreenshot"
          :disabled="screenshotting"
        >
          <LoadingIcon v-if="screenshotting" />
          <span v-else>Screenshot</span>
        </button>
        <label class="flex items-center gap-1 text-sm whitespace-nowrap">
          <input type="checkbox" v-model="transparentBg" />
          <span>Transparent<br />image/export</span>
        </label>
      </div>
      <div class="p-2 hidden md:flex relative" ref="desktopExportRef">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="showExportMenu = !showExportMenu"
          :disabled="exporting"
        >
          <LoadingIcon v-if="exporting" />
          <span v-else>Export Animation</span>
        </button>
        <div
          v-if="showExportMenu"
          class="absolute right-2 bottom-full mb-1 w-48 bg-gray-700 rounded shadow z-10"
        >
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('video')"
          >
            Export as WebM
          </button>
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('frames')"
          >
            Export as Frames (ZIP)
          </button>
        </div>
      </div>
      <div class="p-2 flex md:hidden relative" ref="mobileExportRef">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="showExportMenu = !showExportMenu"
          :disabled="exporting"
        >
          <LoadingIcon v-if="exporting" />
          <span v-else>Export Animation</span>
        </button>
        <div
          v-if="showExportMenu"
          class="absolute right-2 top-full mt-1 w-48 bg-gray-700 rounded shadow z-10"
        >
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('video')"
          >
            Export as WebM
          </button>
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('frames')"
          >
            Export as Frames (ZIP)
          </button>
        </div>
      </div>
      <div class="p-2">
        <label class="flex items-center gap-1 text-sm whitespace-nowrap">
          <input type="checkbox" v-model="store.useCurrentCamera" />
          <span>Use current camera in image/export</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref, watch, onMounted, onUnmounted } from "vue";
import { useCharacterStore } from "@/stores/characterStore";

import LoadingIcon from "@/components/icons/LoadingIcon.vue";

const props = defineProps<{
  animations: string[];
  skins: string[];
  exporting: boolean;
  screenshotting: boolean;
}>();
const { animations, skins, exporting, screenshotting } = toRefs(props);

const store = useCharacterStore();
const colorInput = ref<HTMLInputElement | null>(null);
const transparentBg = ref(false);
const showExportMenu = ref(false);
const desktopExportRef = ref<HTMLElement | null>(null);
const mobileExportRef = ref<HTMLElement | null>(null);

const emit = defineEmits([
  "select",
  "reset-camera",
  "screenshot",
  "export-animation",
  "category-change",
]);

function select(name: string) {
  emit("select", name);
  store.selectedAnimation = name;
}

function onColorChange(e: Event) {
  const input = e.target as HTMLInputElement;
  store.backgroundColor = input.value;
}

function onScreenshot() {
  emit("screenshot", transparentBg.value);
}

function onExport(format: "video" | "frames") {
  emit("export-animation", { format, transparent: transparentBg.value });
  showExportMenu.value = false;
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (desktopExportRef.value?.contains(target) || mobileExportRef.value?.contains(target)) return;
  showExportMenu.value = false;
}

const selectedAnimation = computed(() => store.selectedAnimation);
const toggleLabel = computed(() => (store.playing ? "Pause" : "Play"));
const currentChar = computed(() =>
  store.characters.find((c) => c.id === store.selectedCharacterId)
);

watch(
  () => store.animationCategory,
  () => {
    emit("category-change");
  }
);

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));
</script>
