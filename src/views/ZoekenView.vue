<script setup>
import { ref, onMounted, computed } from 'vue'
import PokemonSheet from '../components/PokemonSheet.vue'
import { getFavorieten, isFavoriet, voegFavorietToe, verwijderFavoriet } from '../data/favorieten.js'

const allePokemon   = ref([])
const isLoading     = ref(true)
const fout          = ref(null)

const zoekterm      = ref('')
const geselecteerdType = ref('alle')
const typePokemon   = ref([])     // namen die bij het geselecteerde type horen
const isTypeLoading = ref(false)

const toonAutocomplete = ref(false)

// Favorieten
const favorietIds = ref(getFavorieten().map(p => p.id))

// Sheet
const geselecteerd = ref(null)
const sheetOpen    = ref(false)

const types = [
  'alle', 'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

onMounted(async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()

    allePokemon.value = data.results.map((p, index) => ({
      naam: p.name,
      id:   index + 1
    }))
  } catch (e) {
    fout.value = 'Er ging iets mis. Probeer het later opnieuw.'
  } finally {
    isLoading.value = false
  }
})

async function selecteerType(type) {
  geselecteerdType.value = type

  if (type === 'alle') {
    typePokemon.value = []
    return
  }

  isTypeLoading.value = true

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    typePokemon.value = data.pokemon.map(p => p.pokemon.name)
  } catch (e) {
    fout.value = 'Er ging iets mis. Probeer het later opnieuw.'
  } finally {
    isTypeLoading.value = false
  }
}

// Lijst gefilterd op type
const lijstNaType = computed(() => {
  if (geselecteerdType.value === 'alle') {
    return allePokemon.value
  }
  return allePokemon.value.filter(p => typePokemon.value.includes(p.naam))
})

// Lijst gefilterd op type EN zoekterm
const resultaten = computed(() => {
  if (zoekterm.value === '') {
    return lijstNaType.value
  }
  return lijstNaType.value.filter(p =>
    p.naam.toLowerCase().includes(zoekterm.value.toLowerCase())
  )
})

// Autocomplete suggesties: max 5, op basis van de volledige pokemon-lijst (los van type-filter)
const suggesties = computed(() => {
  if (zoekterm.value === '') return []

  return allePokemon.value
    .filter(p => p.naam.toLowerCase().includes(zoekterm.value.toLowerCase()))
    .slice(0, 5)
})

function kiesSuggestie(naam) {
  zoekterm.value = naam
  toonAutocomplete.value = false
}

function verbergAutocomplete() {
  // kleine delay zodat een klik op een suggestie nog verwerkt kan worden
  setTimeout(() => {
    toonAutocomplete.value = false
  }, 150)
}

function toggleFavoriet(pokemon) {
  if (isFavoriet(pokemon.id)) {
    verwijderFavoriet(pokemon.id)
  } else {
    voegFavorietToe({
      id:       pokemon.id,
      naam:     pokemon.naam,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
    })
  }

  favorietIds.value = getFavorieten().map(p => p.id)
}

function openSheet(pokemon) {
  geselecteerd.value = pokemon
  sheetOpen.value    = true
}

function sluitSheet() {
  sheetOpen.value = false
}

function vorigeVolgende(verschil) {
  const huidigeIndex = resultaten.value.findIndex(p => p.id === geselecteerd.value.id)
  const nieuweIndex  = huidigeIndex + verschil

  if (nieuweIndex < 0 || nieuweIndex >= resultaten.value.length) return

  geselecteerd.value = resultaten.value[nieuweIndex]
}

function ververs() {
  favorietIds.value = getFavorieten().map(p => p.id)
}
</script>

<template>
  <div class="container">

    <!-- Zoekveld + autocomplete -->
    <div class="zoek-wrapper">
      <input
        type="text"
        v-model="zoekterm"
        placeholder="Zoek een pokemon..."
        class="zoekveld"
        @focus="toonAutocomplete = true"
        @blur="verbergAutocomplete"
      >

      <div v-if="toonAutocomplete && suggesties.length > 0" class="autocomplete">
        <div
          v-for="suggestie in suggesties"
          :key="suggestie.id"
          class="suggestie"
          @click="kiesSuggestie(suggestie.naam)"
        >
          <img
            :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${suggestie.id}.png`"
            :alt="suggestie.naam"
            @error="(e) => e.target.src = '/icons/icon-192x192.png'"
          >
          <span>{{ suggestie.naam }}</span>
        </div>
      </div>
    </div>

    <!-- Type tabs -->
    <div class="tabs">
      <button
        v-for="type in types"
        :key="type"
        :class="['tab', type, { actief: geselecteerdType === type }]"
        @click="selecteerType(type)"
      >
        {{ type }}
      </button>
    </div>

    <p v-if="isLoading">Laden...</p>
    <p v-if="isTypeLoading">Type laden...</p>
    <p v-if="fout">{{ fout }}</p>

    <!-- Resultaten -->
    <div class="grid">
      <div
        v-for="pokemon in resultaten"
        :key="pokemon.id"
        class="card"
        @click="openSheet(pokemon)"
      >
        <span
          class="favoriet-knop material-icons"
          @click.stop="toggleFavoriet(pokemon)"
        >
          {{ favorietIds.includes(pokemon.id) ? 'favorite' : 'favorite_border' }}
        </span>
        <img
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`"
          :alt="pokemon.naam"
          @error="(e) => e.target.src = '/icons/icon-192x192.png'"
        >
        <p class="id">#{{ String(pokemon.id).padStart(3, '0') }}</p>
        <p class="naam">{{ pokemon.naam }}</p>
      </div>
    </div>

  </div>

  <PokemonSheet
    v-show="geselecteerd"
    :pokemon="geselecteerd"
    :open="sheetOpen"
    :allePokemon="resultaten"
    @sluit="sluitSheet"
    @vorigeVolgende="vorigeVolgende"
    @favorietGewijzigd="ververs"
  />
</template>

<style scoped>
.container {
  padding: 16px;
}

/* Zoekveld */
.zoek-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.zoekveld {
  width: 100%;
  padding: 12px 16px;
  border-radius: 100px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 1em;
  box-sizing: border-box;
}

.autocomplete {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  overflow: hidden;
}

.suggestie {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  text-transform: capitalize;
}

.suggestie:hover {
  background-color: #f5f5f5;
}

.suggestie img {
  width: 32px;
}

/* Type tabs */
.tabs {
  display: flex;
  overflow-x: scroll;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.tab {
  flex: 0 0 30vw;
  padding: 16px 8px;
  border: none;
  font-size: 0.9em;
  font-weight: 600;
  text-transform: capitalize;
  cursor: pointer;
  background-color: rgba(211, 211, 211, 0.5);
  color: #4a4a4a;
  border-bottom: 4px solid transparent;
}

.tab.actief {
  border-bottom: 4px solid black;
}

.tab.alle      { background-color: rgba(211, 211, 211, 0.5); color: #374151; }
.tab.normal    { background-color: rgba(168, 167, 122, 0.5); color: #4a4a4a; }
.tab.fire      { background-color: rgba(238, 129, 48, 0.5);  color: #4a4a4a; }
.tab.water     { background-color: rgba(99, 144, 240, 0.5);  color: #4a4a4a; }
.tab.electric  { background-color: rgba(247, 208, 44, 0.5);  color: #4a4a4a; }
.tab.grass     { background-color: rgba(122, 199, 76, 0.5);  color: #4a4a4a; }
.tab.ice       { background-color: rgba(150, 217, 214, 0.5); color: #4a4a4a; }
.tab.fighting  { background-color: rgba(194, 46, 40, 0.5);   color: #4a4a4a; }
.tab.poison    { background-color: rgba(163, 62, 161, 0.5);  color: #4a4a4a; }
.tab.ground    { background-color: rgba(226, 191, 101, 0.5); color: #4a4a4a; }
.tab.flying    { background-color: rgba(169, 143, 243, 0.5); color: #4a4a4a; }
.tab.psychic   { background-color: rgba(249, 85, 135, 0.5);  color: #4a4a4a; }
.tab.bug       { background-color: rgba(166, 185, 26, 0.5);  color: #4a4a4a; }
.tab.rock      { background-color: rgba(182, 161, 54, 0.5);  color: #4a4a4a; }
.tab.ghost     { background-color: rgba(115, 87, 151, 0.5);  color: #4a4a4a; }
.tab.dragon    { background-color: rgba(111, 53, 252, 0.5);  color: #4a4a4a; }
.tab.dark      { background-color: rgba(112, 87, 70, 0.5);   color: #4a4a4a; }
.tab.steel     { background-color: rgba(183, 183, 206, 0.5); color: #4a4a4a; }
.tab.fairy     { background-color: rgba(214, 133, 173, 0.5); color: #4a4a4a; }

/* Grid */
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
  color: var(--rood);
  cursor: pointer;
}
</style>
