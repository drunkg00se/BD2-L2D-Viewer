import { defineStore } from "pinia";
// import charInfo from "@/CharInfo.json";
// import AtlasList from "@/atlas-list.json";

export type AnimationCategory = "character" | "ultimate" | "dating";

export interface Character {
  id: string;
  charName: string;
  costumeName: string;
  spine: string;
  cutscene: string;
  dating: string;
  datingHasNoBg?: boolean;
  customFiles?: {
    skel?: string;
    json?: string;
    atlas: string;
    images: Record<string, string>;
  };
}

type SpineInfo = {
  all: Character[];
  char: Character[];
  avatar: Record<string, string>;
};

export const useCharacterStore = defineStore("characterStore", {
  state: () => ({
    characters: [] as Character[],
    selectedCharacterId: "",
    selectedAnimation: "",
    selectedSkin: "",
    animationCategory: "character" as AnimationCategory,
    playing: true,
    animationSpeed: 1,
    backgroundColor: "#1f2937",
    useCurrentCamera: false,
    showDatingBg: true,
    customBackgroundImage: null as string | null,
    spineType: "character" as "character" | "all",
    spineInfo: {} as SpineInfo,
  }),

  actions: {
    init(spineInfo: SpineInfo) {
      console.log(spineInfo);

      this.spineInfo = spineInfo;
      this.spineType = "character";
      this.characters = spineInfo.char;
      this.selectedCharacterId = this.characters[0]?.id ?? "";
    },

    setSpineTypeCharacter() {
      if (this.spineType === "character") return;
      this.spineType = "character";
      this.characters = this.spineInfo.char;
      this.selectedCharacterId = this.characters[0]?.id ?? "";
    },

    setSpineTypeAll() {
      if (this.spineType === "all") return;
      this.spineType = "all";
      this.characters = this.spineInfo.all;
      this.selectedCharacterId = this.characters[0]?.id ?? "";
    },
  },
});
