<script setup lang="ts">
import { onMounted, ref } from "vue";

export interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string; // ISO datetime string, e.g. "2024-03-16 14:22:00"
}

interface History {
  history: Comment[];
}

const props = defineProps<{ postSlug: string }>();
const comments = ref<Comment[]>([]);

onMounted(async () => {
  const res = await fetch(`/api/comments?slug=${props.postSlug}`);
  const data: History = await res.json();
  comments.value = data.history;
});
</script>

<template>
  <div class="w-full lg:max-w-5/12">
    <h2 class="text-4xl font-bold">Comments</h2>
    <div class="flex flex-col gap-2 mt-4">
      <div v-for="comment in comments" :key="comment.id">
        <div class="flex items-center justify-between">
          <span class="font-semibold">{{ comment.author_name }}</span>
          <time class="text-neutral-500 text-sm">
            at {{ new Date(comment.created_at).toLocaleString("en-US") }}
          </time>
        </div>
        <p>
          {{ comment.content }}
        </p>
      </div>
    </div>
  </div>
</template>
