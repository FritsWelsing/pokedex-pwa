<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function openDrawer() {
  window.openDrawer();
}

function navigeer(pad) {
  window.sluitDrawer();
  router.push(pad);
}
</script>

<template>
  <!-- Drawer -->
  <aside class="mdc-drawer mdc-drawer--modal">
    <div class="mdc-drawer__header">
      <h3 class="mdc-drawer__title">Pokédex</h3>
    </div>
    <div class="mdc-drawer__content">
      <nav class="mdc-list">
        <a class="mdc-list-item" @click="navigeer('/')" tabindex="0">
          <span class="mdc-list-item__ripple"></span>
          <i class="material-icons mdc-list-item__graphic">home</i>
          <span class="mdc-list-item__text">Home</span>
        </a>
        <a class="mdc-list-item" @click="navigeer('/zoeken')" tabindex="0">
          <span class="mdc-list-item__ripple"></span>
          <i class="material-icons mdc-list-item__graphic">search</i>
          <span class="mdc-list-item__text">Zoeken</span>
        </a>
        <a class="mdc-list-item" @click="navigeer('/favorieten')" tabindex="0">
          <span class="mdc-list-item__ripple"></span>
          <i class="material-icons mdc-list-item__graphic">favorite</i>
          <span class="mdc-list-item__text">Favorieten</span>
        </a>
      </nav>
    </div>
  </aside>

  <div class="mdc-drawer-scrim"></div>

  <!-- Top app bar -->
  <header class="mdc-top-app-bar mdc-top-app-bar--fixed">
    <div class="mdc-top-app-bar__row">
      <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
        <button
          class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button"
          @click="openDrawer"
        >
          menu
        </button>
        <span class="mdc-top-app-bar__title">Pokédex</span>
      </section>
    </div>
  </header>

  <!-- Pagina inhoud -->
  <main class="mdc-top-app-bar--fixed-adjust">
    <RouterView />
  </main>

  <!-- Install banner -->
  <div id="install-banner" style="display: none">
    <span>Voeg de app toe aan je homescreen</span>
    <button onclick="installApp()">Installeren</button>
    <button onclick="closeBanner()">Sluiten</button>
  </div>
</template>

<style>
:root {
  --mdc-theme-primary: #2563eb;
  --rood: #cc0000;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
}

.mdc-top-app-bar {
  background-color: var(--mdc-theme-primary);
}

.mdc-drawer__header {
  background-color: var(--mdc-theme-primary);
  color: white;
  padding: 16px;
}

.mdc-drawer__content .mdc-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  gap: 12px;
  text-decoration: none;
  color: black;
}

.mdc-drawer__content .mdc-list-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

#install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
  z-index: 99;
}
</style>
