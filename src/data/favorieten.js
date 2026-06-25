// Haal alle favorieten op uit localStorage
export function getFavorieten() {
  const data = localStorage.getItem('favorieten')
  return data ? JSON.parse(data) : []
}

// Check of een pokemon al favoriet is
export function isFavoriet(id) {
  const favorieten = getFavorieten()
  return favorieten.some(p => p.id === id)
}

// Voeg een pokemon toe aan favorieten
export function voegFavorietToe(pokemon) {
  const favorieten = getFavorieten()
  favorieten.push(pokemon)
  localStorage.setItem('favorieten', JSON.stringify(favorieten))
}

// Verwijder een pokemon uit favorieten
export function verwijderFavoriet(id) {
  const favorieten = getFavorieten().filter(p => p.id !== id)
  localStorage.setItem('favorieten', JSON.stringify(favorieten))
}
