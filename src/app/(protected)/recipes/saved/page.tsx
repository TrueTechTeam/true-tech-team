import RecipeApp from '../../../../components/recipes/RecipeApp';

export const metadata = { title: 'Saved Recipes' };

export default function SavedRecipesPage() {
  return <RecipeApp initialTab="saved" />;
}
