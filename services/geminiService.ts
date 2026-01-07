
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, MealSuggestion, WeeklyPlan, GeneratedMeal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Reusable Meal Schema Parts
const mealProperties = {
  name: { type: Type.STRING, description: "Creative and appetizing name of the dish" },
  description: { type: Type.STRING, description: "A very short, 1-sentence description." },
  ingredients: { 
    type: Type.ARRAY, 
    items: { type: Type.STRING },
    description: "Extremely short ingredient format. Max 3-4 words per item. Format: 'Qty Item' (e.g. '2 Eggs', '1c Rice'). No long descriptions." 
  },
  instructions: { 
    type: Type.ARRAY, 
    items: { type: Type.STRING },
    description: "Short, punchy, imperative action steps. Max 10 words per step. Remove fluff. (e.g. 'Fry garlic until golden')"
  },
  tips: {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "Short pro tips. Max 10 words."
  },
  cookingTime: { type: Type.NUMBER, description: "Total preparation and cooking time in minutes" },
  calories: { type: Type.NUMBER, description: "Approximate calories per serving" },
  macros: {
    type: Type.OBJECT,
    properties: {
      protein: { type: Type.STRING, description: "e.g. '25g'" },
      carbs: { type: Type.STRING, description: "e.g. '40g'" },
      fat: { type: Type.STRING, description: "e.g. '15g'" }
    },
    required: ["protein", "carbs", "fat"],
    description: "Nutritional macronutrients estimates."
  },
  vegetableNutrients: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The vegetable name" },
        nutrients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key vitamins/minerals e.g. ['Vitamin A', 'Iron']" },
        healthBenefit: { type: Type.STRING, description: "Short benefit e.g. 'Boosts Immunity'" }
      },
      required: ["name", "nutrients", "healthBenefit"]
    },
    description: "Nutrient breakdown for key vegetables in the dish. Useful for dietary tracking."
  },
  tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Flavor profile tags" },
  priceRange: { type: Type.STRING, description: "Cost estimation: $, $$, or $$$" }
};

const mealSchema = {
  type: Type.OBJECT,
  properties: mealProperties,
  required: ["name", "description", "ingredients", "instructions", "tips", "cookingTime", "calories", "macros", "tags", "priceRange", "vegetableNutrients"],
};

const weeklyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    meals: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: mealProperties },
      description: "A list of 7 meals for the week."
    },
    groceryList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Category name e.g. Produce, Meat, Spices" },
          items: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of items in this category" }
        },
        required: ["category", "items"]
      },
      description: "Consolidated grocery list grouped by category."
    }
  },
  required: ["meals", "groceryList"]
};

export const generateMealIdea = async (prefs: UserPreferences): Promise<MealSuggestion> => {
  const prompt = `
    Suggest a single meal idea.
    Context: Malaysia.
    Cuisine: ${prefs.cuisine}
    Type: ${prefs.mealType}
    Diet: ${prefs.dietaryRestriction}
    Budget: ${prefs.budget}
    Time Limit: ${prefs.cookingTimeMinutes}m
    Ingredients: ${prefs.ingredients || "Any"}
    Mood: ${prefs.mood || "Any"}

    CRITICAL INSTRUCTIONS FOR DIETARY TRACKING:
    1. Always include the 'vegetableNutrients' array with at least 2-3 key vegetables from the dish.
    2. Ingredients must be VERY short.
    3. Instructions must be short actions.
    4. Focus on the health benefits of the vegetables for people with dietary needs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealSchema,
        systemInstruction: "You are a health-conscious chef who specializes in dietary tracking and nutrient-rich cooking. You prioritize brevity and clarity.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as MealSuggestion;
  } catch (error) {
    console.error("Error generating meal:", error);
    throw error;
  }
};

export const generateWeeklyPlan = async (prefs: UserPreferences): Promise<WeeklyPlan> => {
  const prompt = `
    Generate a 7-day meal plan.
    Context: Malaysia.
    Cuisine: ${prefs.cuisine}
    Budget: ${prefs.budget}
    Diet: ${prefs.dietaryRestriction}
    
    CRITICAL: 
    1. Each meal MUST have 'vegetableNutrients' breakdown.
    2. Ingredients and Instructions must be EXTREMELY SHORT. 
    3. Group grocery list items by category.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: weeklyPlanSchema,
        systemInstruction: "You are a minimalist health-focused meal planner. Include nutrient data for all meals.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const rawData = JSON.parse(text);
    
    const processedPlan: WeeklyPlan = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      groceryList: rawData.groceryList,
      meals: rawData.meals.map((m: any) => ({
        ...m,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      }))
    };
    
    return processedPlan;
  } catch (error) {
    console.error("Error generating weekly plan:", error);
    throw error;
  }
};

export const generateMealImage = async (mealName: string, description: string): Promise<string | null> => {
  const imagePrompt = `Professional food photography of ${mealName}. ${description}. High resolution, 4k, appetizing, photorealistic, studio lighting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: {}
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null; 
  }
};
