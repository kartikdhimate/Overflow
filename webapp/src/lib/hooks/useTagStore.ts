import { Tag } from "@/lib/types"
import { create } from "zustand/react";

type TagStore = {
    tags: Tag[];
    setTags: (tags: Tag[]) => void;
    getTagBySlug: (slug: string) => Tag | undefined;
}

export const useTagStore = create<TagStore>((set, get) => ({
    tags: [],
    setTags: (tags: Tag[]) => set({ tags: tags }),
    getTagBySlug: (slug: string) => get().tags.find(t => t.slug === slug)
}));