<script setup>
import { ref, watch } from "vue";

const props = defineProps(["pokemon", "open", "allePokemon"]);
const emit = defineEmits(["sluit", "vorigeVolgende"]);

const details = ref(null);
const isLoading = ref(false);
const fout = ref(null);

function sluit() {
  document.title = "Pokédex";
  const favicon = document.querySelector("link[rel='icon']");
  if (favicon) favicon.href = "/icons/favicon-32x32.png";
  emit("sluit");
}

function gaNaar(verschil) {
  emit("vorigeVolgende", verschil);
}

function getPokemonImage(id) {
  return new Promise((resolve) => {
    const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
    const pngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const img = new Image();
    img.onload = () => resolve(gifUrl);
    img.onerror = () => resolve(pngUrl);
    img.src = gifUrl;
  });
}

function leesKetting(chain) {
  const resultaat = [];
  let huidige = chain;

  while (huidige) {
    resultaat.push(huidige.species.name);
    huidige = huidige.evolves_to?.[0];
  }

  return resultaat;
}

watch(
  () => props.pokemon,
  async (nieuw) => {
    if (!nieuw) return;
    details.value = null;
    fout.value = null;
    isLoading.value = true;

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nieuw.id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const imageUrl = await getPokemonImage(nieuw.id);

      details.value = {
        naam: data.name,
        id: nieuw.id,
        imageUrl,
        types: data.types.map((t) => t.type.name),
        height: data.height / 10,
        weight: data.weight / 10,
        stats: data.stats.map((s) => ({ naam: s.stat.name, waarde: s.base_stat })),
        abilities: data.abilities.map((a) => ({
          naam: a.ability.name,
          verborgen: a.is_hidden,
        })),
      };

      // Evolution chain ophalen
      const speciesResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${nieuw.id}`
      );
      const speciesData = await speciesResponse.json();

      const chainResponse = await fetch(speciesData.evolution_chain.url);
      const chainData = await chainResponse.json();

      const namen = leesKetting(chainData.chain);

      details.value.evolutionChain = namen.map((naam) => {
        const gevonden = props.allePokemon.value.find((p) => p.naam === naam);
        return {
          naam,
          id: gevonden ? gevonden.id : null,
        };
      });

      // Tab titel en favicon
      document.title = `#${String(nieuw.id).padStart(3, "0")} - ${data.name
        .charAt(0)
        .toUpperCase()}${data.name.slice(1)}`;
      const favicon =
        document.querySelector("link[rel='icon']") || document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.href = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nieuw.id}.png`;
      document.head.appendChild(favicon);
    } catch (e) {
      fout.value = "Er ging iets mis. Probeer het later opnieuw.";
    } finally {
      isLoading.value = false;
    }
  }
);

function capitalize(naam) {
  if (!naam) return "";
  return naam.charAt(0).toUpperCase() + naam.slice(1);
}
</script>

<template>
  <div :class="['sheet', { 'sheet--open': open }]">
    <!-- Header -->
    <header class="mdc-top-app-bar">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
          <button
            class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button"
            @click="sluit"
          >
            arrow_back
          </button>
          <span class="mdc-top-app-bar__title">
            {{ details ? capitalize(details.naam) : "..." }}
          </span>
        </section>
      </div>
    </header>

    <main class="mdc-top-app-bar--fixed-adjust sheet-main">
      <p v-if="isLoading" class="laden">Laden...</p>
      <p v-if="fout">{{ fout }}</p>

      <div v-if="details" class="inhoud">
        <!-- Hoofd kaart -->
        <div class="hoofd-kaart">
          <p class="pokemon-id">#{{ String(details.id).padStart(3, "0") }}</p>
          <p class="pokemon-naam">{{ capitalize(details.naam) }}</p>
          <div class="types">
            <span v-for="type in details.types" :key="type" :class="['type', type]">{{
              type
            }}</span>
          </div>
          <div class="afbeelding">
            <img :src="details.imageUrl" :alt="details.naam" />
          </div>
        </div>

        <!-- Stats -->
        <div class="kaart">
          <p class="kaart-titel">Base stats</p>
          <div class="stats">
            <div v-for="stat in details.stats" :key="stat.naam" class="stat">
              <p class="stat-naam">{{ stat.naam }}</p>
              <p class="stat-waarde">{{ stat.waarde }}</p>
            </div>
          </div>
        </div>

        <!-- Fysiek -->
        <div class="kaart">
          <p class="kaart-titel">Fysiek</p>
          <div class="fysiek">
            <div>
              <p class="stat-naam">Hoogte</p>
              <p class="stat-waarde">{{ details.height }}m</p>
            </div>
            <div>
              <p class="stat-naam">Gewicht</p>
              <p class="stat-waarde">{{ details.weight }}kg</p>
            </div>
          </div>
        </div>

        <!-- Abilities -->
        <div class="kaart">
          <p class="kaart-titel">Abilities</p>
          <div class="abilities">
            <div
              v-for="ability in details.abilities"
              :key="ability.naam"
              :class="['ability', { verborgen: ability.verborgen }]"
            >
              <p class="ability-titel">
                {{ ability.verborgen ? "Hidden ability" : "Ability" }}
              </p>
              <p class="ability-naam">{{ ability.naam.replace(/-/g, " ") }}</p>
            </div>
          </div>
        </div>

        <!-- Evolution chain -->
        <div
          class="kaart"
          v-if="details.evolutionChain && details.evolutionChain.length > 1"
        >
          <p class="kaart-titel">Evolution chain</p>
          <div class="chain">
            <div
              v-for="(evo, index) in details.evolutionChain"
              :key="evo.naam"
              class="chain-item"
            >
              <img
                v-if="evo.id"
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`"
                :alt="evo.naam"
              />
              <p class="chain-naam">{{ capitalize(evo.naam) }}</p>
              <span
                v-if="index < details.evolutionChain.length - 1"
                class="material-icons chain-pijl"
              >
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="sheet-footer">
      <button class="footer-knop" @click="gaNaar(-1)">
        <span class="material-icons">arrow_back</span>
      </button>
      <button class="footer-knop favoriet-knop">
        <span class="material-icons">favorite_border</span>
      </button>
      <button class="footer-knop" @click="gaNaar(1)">
        <span class="material-icons">arrow_forward</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.sheet {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  z-index: 150;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sheet--open {
  transform: translateX(0);
}

.sheet-main {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;
}

.laden {
  padding: 16px;
}

.inhoud {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Hoofd kaart */
.hoofd-kaart {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.pokemon-id {
  color: #6c7381;
  font-size: 0.8em;
  font-weight: 600;
}

.pokemon-naam {
  font-size: 2em;
  font-weight: 800;
  text-transform: capitalize;
  letter-spacing: -1px;
}

.types {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 8px 0;
}

.type {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  background-color: #e5e7eb;
  color: #6c7381;
}

.type.normal {
  background-color: #d8d7b4;
  color: #a8a77a;
}
.type.fire {
  background-color: #f3c7a3;
  color: #e8914e;
}
.type.water {
  background-color: #b7cdf7;
  color: #6390f0;
}
.type.electric {
  background-color: #fff4bf;
  color: #f0d362;
}
.type.grass {
  background-color: #c6e7b3;
  color: #8dc86b;
}
.type.ice {
  background-color: #ccefee;
  color: #96d9d6;
}
.type.fighting {
  background-color: #e6a7a5;
  color: #c85a57;
}
.type.poison {
  background-color: #d1a6d0;
  color: #a0569f;
}
.type.ground {
  background-color: #f1deb0;
  color: #e2bf65;
}
.type.flying {
  background-color: #d5c8f9;
  color: #a98ff3;
}
.type.psychic {
  background-color: #fcbcd0;
  color: #fc85a9;
}
.type.bug {
  background-color: #d6e47a;
  color: #a6b91a;
}
.type.rock {
  background-color: #e0d08f;
  color: #b6a136;
}
.type.ghost {
  background-color: #b5a4cc;
  color: #735797;
}
.type.dragon {
  background-color: #c3b1fb;
  color: #8d63f5;
}
.type.dark {
  background-color: #b5a396;
  color: #705746;
}
.type.steel {
  background-color: #d8d8e5;
  color: #b7b7ce;
}
.type.fairy {
  background-color: #f2c3da;
  color: #d790b4;
}

.afbeelding img {
  width: 60%;
  image-rendering: pixelated;
}

/* Kaarten */
.kaart {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.kaart-titel {
  text-transform: uppercase;
  font-size: 0.75em;
  font-weight: 700;
  letter-spacing: 1px;
  color: #6c7381;
  margin-bottom: 16px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-naam {
  text-transform: uppercase;
  font-size: 0.7em;
  font-weight: 700;
  color: #6c7381;
}

.stat-waarde {
  font-size: 1.6em;
  font-weight: 900;
}

.fysiek {
  display: flex;
  gap: 32px;
}

.abilities {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ability {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.ability.verborgen {
  border-color: rgba(204, 0, 0, 0.2);
  background-color: #fff9f9;
}

.ability-titel {
  text-transform: uppercase;
  font-size: 0.7em;
  font-weight: 700;
  color: #6c7381;
}

.ability.verborgen .ability-titel {
  color: #cc0000;
}

.ability-naam {
  font-size: 1em;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 4px;
}

/* Evolution chain */
.chain {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.chain-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.chain-item img {
  width: 64px;
  image-rendering: pixelated;
}

.chain-naam {
  font-size: 0.75em;
  font-weight: 600;
  text-transform: capitalize;
  text-align: center;
}

.chain-pijl {
  color: #cc0000;
  align-self: center;
  margin-bottom: 20px;
}

/* Footer */
.sheet-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #cc0000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  z-index: 160;
}

.footer-knop {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.footer-knop .material-icons {
  color: white;
  font-size: 28px;
}
</style>
