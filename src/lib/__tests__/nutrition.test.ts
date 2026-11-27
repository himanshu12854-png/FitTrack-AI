import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDailyDietTotals,
  calculateNetDailyCalories,
  calculateWorkoutCaloriesBurned,
  convertNutrientUnit,
  formatDateInTimezone,
} from '../nutrition.ts';

describe('nutrition calculations (server-side)', () => {
  it('calculates totals for a single meal', () => {
    const totals = calculateDailyDietTotals({
      breakfast: [
        {
          name: 'Oatmeal with Whey',
          calories: 320,
          protein: 28,
          carbs: 40,
          fats: 5,
          servingQuantity: 1.5,
          micronutrients: {
            fiber_g: 4,
            iron_mg: 2.1,
            calcium_mg: 120,
          },
        },
      ],
    });

    assert.equal(totals.totalCalories, 480);
    assert.equal(totals.totalProtein, 42);
    assert.equal(totals.totalCarbs, 60);
    assert.equal(totals.totalFats, 8);
    assert.equal(totals.totalMicronutrients.fiber_g, 6);
    assert.equal(totals.totalMicronutrients.iron_mg, 3.15);
    assert.equal(totals.totalMicronutrients.calcium_mg, 180);
  });

  it('calculates totals across multiple meals in one day', () => {
    const totals = calculateDailyDietTotals({
      breakfast: [{ name: 'Eggs', calories: 140, protein: 12, carbs: 1, fats: 10, servingQuantity: 2 }],
      lunch: [{ name: 'Chicken Rice', calories: 550, protein: 45, carbs: 65, fats: 10, servingQuantity: 1 }],
      dinner: [{ name: 'Salmon', calories: 420, protein: 38, carbs: 0, fats: 26, servingQuantity: 1 }],
      snacks: [{ name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0, servingQuantity: 1 }],
    });

    assert.equal(totals.totalCalories, 1355);
    assert.equal(totals.totalProtein, 108);
    assert.equal(totals.totalCarbs, 94);
    assert.equal(totals.totalFats, 56);
  });

  it('calculates workout calories burned and net daily calories', () => {
    const burned = calculateWorkoutCaloriesBurned({
      durationMinutes: 60,
      weightKg: 80,
      met: 5.0,
    });
    assert.equal(burned, 400);

    const net = calculateNetDailyCalories(2200, burned);
    assert.equal(net, 1800);
  });

  it('handles a day with no entries', () => {
    const totals = calculateDailyDietTotals(null);
    assert.equal(totals.totalCalories, 0);
    assert.equal(totals.totalProtein, 0);
    assert.equal(totals.totalCarbs, 0);
    assert.equal(totals.totalFats, 0);
    assert.equal(totals.totalMicronutrients.iron_mg, 0);
  });

  it('handles missing nutrient data and zero quantities safely', () => {
    const totals = calculateDailyDietTotals({
      lunch: [
        { name: 'Zero Qty Item', calories: 500, protein: 30, carbs: 40, fats: 20, servingQuantity: 0 },
        { name: 'Missing Macros', calories: 100, servingQuantity: 1 },
      ],
    });
    assert.equal(totals.totalCalories, 100);
    assert.equal(totals.totalProtein, 0);
    assert.equal(totals.totalMicronutrients.calcium_mg, 0);
  });

  it('converts nutrient units consistently and handles timezones', () => {
    assert.equal(convertNutrientUnit(1, 'g', 'mg'), 1000);
    assert.equal(convertNutrientUnit(2000, 'mcg', 'mg'), 2);
    assert.equal(convertNutrientUnit(418.4, 'kj', 'kcal'), 100);

    // Partial day boundary across UTC vs Asia/Kolkata (+05:30)
    const utcLateNight = new Date('2026-11-27T20:00:00.000Z');
    assert.equal(formatDateInTimezone(utcLateNight, 'UTC'), '2026-11-27');
    assert.equal(formatDateInTimezone(utcLateNight, 'Asia/Kolkata'), '2026-11-28');
  });
});
