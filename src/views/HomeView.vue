<script setup>
import { ref, onMounted } from "vue";
import PokemonSheet from "../components/PokemonSheet.vue";
import {
  getFavorieten,
  isFavoriet,
  voegFavorietToe,
  verwijderFavoriet,
} from "../data/favorieten.js";

// Alle pokemon (naam + id)
const allePokemon = ref([]);
// Wat er op het scherm staat (lazy loading)
const zichtbaar = ref([]);
const isLoading = ref(true);
const fout = ref(null);

// Sheet
const geselecteerd = ref(null);
const sheetOpen = ref(false);

// Lazy loading
const aantalPerKeer = 20;
let huidigIndex = 0;
const sentinel = ref(null); // onzichtbaar element onderaan

function laadVolgende() {
  const volgende = allePokemon.value.slice(huidigIndex, huidigIndex + aantalPerKeer);
  zichtbaar.value.push(...volgende);
  huidigIndex += aantalPerKeer;
}

onMounted(async () => {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    allePokemon.value = data.results.map((p, index) => ({
      naam: p.name,
      id: index + 1,
    }));

    laadVolgende(); // eerste 20 laden

    // Intersection Observer voor lazy loading
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && huidigIndex < allePokemon.value.length) {
        laadVolgende();
      }
    });

    if (sentinel.value) {
      observer.observe(sentinel.value);
    }
  } catch (e) {
    fout.value = "Er ging iets mis. Probeer het later opnieuw.";
  } finally {
    isLoading.value = false;
  }
});

function openSheet(pokemon) {
  geselecteerd.value = pokemon;
  sheetOpen.value = true;
}

function vorigeVolgende(verschil) {
  const huidigeIndex = allePokemon.value.findIndex((p) => p.id === geselecteerd.value.id);
  const nieuweIndex = huidigeIndex + verschil;

  if (nieuweIndex < 0 || nieuweIndex >= allePokemon.value.length) return;

  geselecteerd.value = null;

  setTimeout(() => {
    geselecteerd.value = allePokemon.value[nieuweIndex];
  }, 50);
}

function sluitSheet() {
  sheetOpen.value = false;
}

const favorietIds = ref(getFavorieten().map((p) => p.id));

function toggleFavoriet(pokemon) {
  if (isFavoriet(pokemon.id)) {
    verwijderFavoriet(pokemon.id);
  } else {
    voegFavorietToe({
      id: pokemon.id,
      naam: pokemon.naam,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
    });
  }

  favorietIds.value = getFavorieten().map((p) => p.id);
}

function ververs() {
  favorietIds.value = getFavorieten().map((p) => p.id);
}
</script>

<template>
  <div class="container">
    <p v-if="isLoading">Laden...</p>
    <p v-if="fout">{{ fout }}</p>

    <div class="grid">
      <div
        v-for="pokemon in zichtbaar"
        :key="pokemon.id"
        class="card"
        @click="openSheet(pokemon)"
      >
        <span class="favoriet-knop material-icons" @click.stop="toggleFavoriet(pokemon)">
          {{ favorietIds.includes(pokemon.id) ? "favorite" : "favorite_border" }}
        </span>
        <img
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`"
          :alt="pokemon.naam"
        />
        <p class="id">#{{ String(pokemon.id).padStart(3, "0") }}</p>
        <p class="naam">{{ pokemon.naam }}</p>
      </div>
    </div>

    <!-- Sentinel: als dit element zichtbaar wordt laadt lazy loading de volgende -->
    <div ref="sentinel" class="sentinel"></div>
  </div>

  <!-- Detail sheet -->
  <PokemonSheet
    v-show="geselecteerd"
    :pokemon="geselecteerd"
    :open="sheetOpen"
    :allePokemon="allePokemon"
    @sluit="sluitSheet"
    @vorigeVolgende="vorigeVolgende"
    @favorietGewijzigd="ververs"
  />
</template>

<style scoped>
.container {
  padding: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  position: relative;
}

.favoriet-knop {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
  color: #cc0000;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-3px);
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

.sentinel {
  height: 1px;
}
</style>
