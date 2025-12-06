export enum DietaryRestriction {
  None = 'None',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  GlutenFree = 'Gluten Free',
  Keto = 'Keto',
  Paleo = 'Paleo',
  Halal = 'Halal'
}

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
  Dessert = 'Dessert'
}

export enum Cuisine {
  Any = 'Any',
  MalaysianChinese = 'Chinese (Malaysian Style)',
  Malay = 'Malay',
  Indian = 'Indian (Mamak Style)',
  Western = 'Western',
  Japanese = 'Japanese',
  Thai = 'Thai'
}

export enum Budget {
  Cheap = 'Budget Friendly ($)',
  Medium = 'Moderate ($$)',
  Expensive = 'Premium ($$$)'
}

export type PlanMode = 'single' | 'weekly';

export interface UserPreferences {
  dietaryRestriction: DietaryRestriction;
  mealType: MealType;
  cuisine: Cuisine;
  budget: Budget;
  ingredients: string;
  mood: string;
  cookingTimeMinutes: number;
  planMode: PlanMode;
}

export interface Macros {
  protein: string;
  carbs: string;
  fat: string;
}

export interface MealSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  cookingTime: number;
  calories: number;
  tags: string[];
  priceRange: string;
  macros?: Macros; // Optional for backward compatibility
}

export interface GeneratedMeal extends MealSuggestion {
  id: string;
  imageUrl?: string;
  timestamp: number;
}

export interface GroceryCategory {
  category: string;
  items: string[];
}

export interface WeeklyPlan {
  id: string;
  timestamp: number;
  meals: GeneratedMeal[];
  groceryList: GroceryCategory[];
}