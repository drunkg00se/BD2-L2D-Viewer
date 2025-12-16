<template>
  <div class="w-full lg:w-80 h-full bg-gray-800 text-white flex flex-col min-h-0">
    <div class="flex flex-row">
      <button
        @click="store.setSpineTypeCharacter"
        class="flex-1 bg-gray-600 hover:bg-gray-500 text-white shadow transition px-4 py-2 cursor-pointer"
        :class="{ 'bg-gray-500!': store.spineType === 'character' }"
      >
        Character
      </button>
      <button
        @click="store.setSpineTypeAll"
        class="flex-1 bg-gray-600 hover:bg-gray-500 text-white shadow transition px-4 py-2 cursor-pointer"
        :class="{ 'bg-gray-500!': store.spineType === 'all' }"
      >
        All
      </button>
    </div>

    <input
      v-model="filter"
      type="text"
      placeholder="Search..."
      class="bg-gray-700 text-white p-2 mb-2 outline-none w-full"
    />
    <div class="overflow-y-auto flex-1 px-2 sidebar-scroll">
      <div
        v-for="char in filteredCharacters"
        :key="char.id"
        class="flex items-center pt-1 cursor-pointer"
        :class="{ 'bg-gray-700': char.id === store.selectedCharacterId }"
        @click="select(char.id)"
      >
        <img
          :src="getAvatar(char.id)"
          :alt="char.costumeName"
          class="object-cover rounded-[50%] size-13"
        />
        <span class="pl-2">{{ char.charName + ": " + char.costumeName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCharacterStore } from "@/stores/characterStore";

const emit = defineEmits(["select"]);
const store = useCharacterStore();
const avatarMap = store.spineInfo.avatar;

const filter = ref("");

const filteredCharacters = computed(() =>
  store.characters.filter((c) =>
    (c.charName + " " + c.costumeName).toLowerCase().includes(filter.value.toLowerCase())
  )
);

function select(id: string) {
  if (id === store.selectedCharacterId) return;
  emit("select", id);
  store.selectedCharacterId = id;
}

function getAvatar(id: string) {
  const matchId = /[0-9]{6}/.exec(id);
  if (matchId) return avatarMap[matchId[0]] || avatarMap.unknown;
  return avatarMap.unknown;
}

onMounted(() => {
  emit("select", store.selectedCharacterId);
});
</script>
