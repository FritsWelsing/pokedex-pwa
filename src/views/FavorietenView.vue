<script setup>
import { ref } from "vue";
import { getFavorieten, verwijderFavoriet } from "../data/favorieten.js";
import PokemonSheet from "../components/PokemonSheet.vue";

const favorieten = ref(getFavorieten().sort((a, b) => a.id - b.id));

function verwijder(id) {
  verwijderFavoriet(id);
  favorieten.value = getFavorieten().sort((a, b) => a.id - b.id);
}

// Sheet
const geselecteerd = ref(null);
const sheetOpen = ref(false);

function openSheet(pokemon) {
  geselecteerd.value = pokemon;
  sheetOpen.value = true;
}

function sluitSheet() {
  sheetOpen.value = false;
}

function vorigeVolgende(verschil) {
  const huidigeIndex = favorieten.value.findIndex((p) => p.id === geselecteerd.value.id);
  const nieuweIndex = huidigeIndex + verschil;

  if (nieuweIndex < 0 || nieuweIndex >= favorieten.value.length) return;

  geselecteerd.value = favorieten.value[nieuweIndex];
}

function ververs() {
  favorieten.value = getFavorieten().sort((a, b) => a.id - b.id);
}
</script>

<template>
  <div class="container">
    <p v-if="favorieten.length === 0" class="leeg">
      Je hebt nog geen favorieten toegevoegd.
    </p>

    <div class="grid">
      <div
        v-for="pokemon in favorieten"
        :key="pokemon.id"
        class="card"
        @click="openSheet(pokemon)"
      >
        <span class="favoriet-knop material-icons" @click.stop="verwijder(pokemon.id)">
          favorite
        </span>
        <img :src="pokemon.imageUrl" :alt="pokemon.naam" />
        <p class="id">#{{ String(pokemon.id).padStart(3, "0") }}</p>
        <p class="naam">{{ pokemon.naam }}</p>
      </div>
    </div>
  </div>

  <PokemonSheet
    v-show="geselecteerd"
    :pokemon="geselecteerd"
    :open="sheetOpen"
    :allePokemon="favorieten"
    @sluit="sluitSheet"
    @vorigeVolgende="vorigeVolgende"
    @favorietGewijzigd="ververs"
  />
</template>

<style scoped>
.container {
  padding: 16px;
}

.leeg {
  text-align: center;
  color: #6c7381;
  margin-top: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  position: relative;
  background-color: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.card img {
  width: 100%;
}

.card .id {
  color: #6c7381;
  font-size: 0.75em;
  font-weight: 600;
}

.card .naam {
  font-weight: 600;
  text-transform: capitalize;
  font-size: 0.85em;
}

.favoriet-knop {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
  color: #cc0000;
  cursor: pointer;
}
</style>
