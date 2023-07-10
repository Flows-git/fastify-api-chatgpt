import { Recipe } from '@/types'

// Funktion zur Validierung des Rezepts
export default (recipe: Recipe) => {
  const { name, amount, duration, ingredients, instructions } = recipe

  // Prüfe, ob der Name vorhanden ist
  if (!name) {
    throw { error: 'recipe.name.missing', message: 'Recipe name is missing' }
  }

  // Prüfe, ob die Menge gültig ist
  if (!amount || isNaN(amount) || amount <= 0) {
    throw { error: 'recipe.amount.invalid', message: 'Invalid recipe amount' }
  }

  // Prüfe, ob die Dauer vorhanden ist
  if (!duration) {
    throw { error: 'recipe.duration.missing', message: 'Recipe duration is missing' }
  }

  // Prüfe, ob die Zutaten vorhanden sind und das Array nicht leer ist
  if (!ingredients || ingredients.length === 0) {
    throw { error: 'recipe.ingredients.missing', message: 'Recipe ingredients are missing' }
  }

  // Überprüfe jeden Eintrag in den Zutaten
  for (const ingredient of ingredients) {
    if (!ingredient.amount || !ingredient.ingredient) {
      throw { error: 'recipe.ingredients.invalid', message: 'Invalid recipe ingredients' }
    }
  }

  // Prüfe, ob die Anweisungen vorhanden sind und das Array nicht leer ist
  if (!instructions || instructions.length === 0) {
    throw { error: 'recipe.instructions.missing', message: 'Recipe instructions are missing' }
  }

  // Überprüfe jeden Eintrag in den Anweisungen
  for (const instruction of instructions) {
    if (!instruction.title || !instruction.description) {
      throw { error: 'recipe.instructions.invalid', message: 'Invalid recipe instructions' }
    }
  }
}