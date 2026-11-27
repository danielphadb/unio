/**
 * Rezepte aus src/engine/reference/recipes.json: Typografie-Rezepte bekannter Marken und die Pruefung,
 * ob eine Schrift zu einem Rezept passt (engine `Bu` ... `Fu`).
 */
import recipesData from "./reference/recipes.json";
import type { FontRef } from "../types";
import { fontForm } from "./tracking";
import { getFont } from "./fonts";

const RECIPE_DATA = recipesData;

const RECIPE_BOOK = {
  rezepte: RECIPE_DATA,
};

export const RECIPES = RECIPE_BOOK.rezepte;

export function weightClass(font: FontRef) {
  const n = getFont(font.key);
  return font.weight <= 300 ||
    (n.tags?.includes("fein") &&
      font.weight <= Math.min(...n.weights) &&
      font.weight <= 400)
    ? "light"
    : font.weight >= 600
      ? "bold"
      : "regular";
}

export function recipeAcceptsFont(recipe: any, font: FontRef) {
  if (!recipe.name.forms.includes(fontForm(font.key))) return false;
  const t = getFont(font.key);
  if (
    (recipe.name.tag && !t.tags?.includes(recipe.name.tag)) ||
    (recipe.name.case === "upper" && (t.noCaps || t.cat === "script")) ||
    (recipe.name.case !== "upper" && t.capsOnly)
  )
    return false;
  const r = weightClass(font);
  const i = recipe.name.weight;
  return i ? (i === "notbold" ? r !== "bold" : r === i) : true;
}

export function getRecipe(id: string | undefined) {
  return id ? RECIPES.find((n) => n.id === id) : undefined;
}
