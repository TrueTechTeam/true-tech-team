import { redirect } from 'next/navigation';

// Saved recipes are now shown directly on the main Recipes page, under the
// search bar — redirect anyone who had this route bookmarked.
export default function SavedRecipesPage() {
  redirect('/recipes');
}
