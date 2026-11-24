'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  AlertCircle,
  RefreshCw,
  Edit2,
  X,
} from 'lucide-react';
import { getTodayDate } from '@/lib/utils';
import { IFoodEntry, MealType } from '@/types';

interface DietResponse {
  dietLog: {
    _id: string;
    date: string;
    meals: {
      breakfast: IFoodEntry[];
      lunch: IFoodEntry[];
      dinner: IFoodEntry[];
      snacks: IFoodEntry[];
    };
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function CaloriesPage() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDate());
  const [data, setData] = useState<DietResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [servingSize, setServingSize] = useState('1 serving');
  const [servingQuantity, setServingQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchDietLog = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/diet?date=${date}`);
      if (!res.ok) throw new Error('Failed to load diet data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch diet');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietLog(currentDate);
  }, [currentDate]);

  const changeDateByDays = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleOpenAdd = (meal: MealType) => {
    setActiveMealType(meal);
    setEditingEntryId(null);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setServingSize('1 serving');
    setServingQuantity(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meal: MealType, entry: IFoodEntry) => {
    setActiveMealType(meal);
    setEditingEntryId(entry._id?.toString() || null);
    setName(entry.name);
    setCalories(entry.calories);
    setProtein(entry.protein);
    setCarbs(entry.carbs);
    setFats(entry.fats);
    setServingSize(entry.servingSize || '1 serving');
    setServingQuantity(entry.servingQuantity || 1);
    setIsModalOpen(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || calories === '') return;

    try {
      setSubmitting(true);
      if (editingEntryId) {
        // Edit
        const res = await fetch('/api/diet/food', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: currentDate,
            mealType: activeMealType,
            entryId: editingEntryId,
            name,
            calories: Number(calories),
            protein: Number(protein || 0),
            carbs: Number(carbs || 0),
            fats: Number(fats || 0),
            servingSize,
            servingQuantity: Number(servingQuantity),
          }),
        });
        if (!res.ok) throw new Error('Failed to update food entry');
      } else {
        // Add
        const res = await fetch('/api/diet/food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: currentDate,
            mealType: activeMealType,
            name,
            calories: Number(calories),
            protein: Number(protein || 0),
            carbs: Number(carbs || 0),
            fats: Number(fats || 0),
            servingSize,
            servingQuantity: Number(servingQuantity),
          }),
        });
        if (!res.ok) throw new Error('Failed to add food');
      }

      setIsModalOpen(false);
      await fetchDietLog(currentDate);
    } catch (err: any) {
      alert(err.message || 'Error saving food');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFood = async (mealType: MealType, entryId?: string) => {
    if (!entryId) return;
    if (!confirm('Remove this food item?')) return;

    try {
      const res = await fetch(
        `/api/diet/food?date=${currentDate}&mealType=${mealType}&entryId=${entryId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete food entry');
      await fetchDietLog(currentDate);
    } catch (err: any) {
      alert(err.message || 'Error deleting food');
    }
  };

  const mealConfig: Array<{ type: MealType; label: string; icon: any }> = [
    { type: 'breakfast', label: 'Breakfast', icon: Coffee },
    { type: 'lunch', label: 'Lunch', icon: Sun },
    { type: 'dinner', label: 'Dinner', icon: Moon },
    { type: 'snacks', label: 'Snacks & Extras', icon: Cookie },
  ];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading food diary...</p>
      </div>
    );
  }

  const calorieTarget = data?.targets.calories || 2000;
  const consumed = data?.dietLog.totalCalories || 0;
  const remaining = Math.max(0, calorieTarget - consumed);
  const percentage = Math.min(100, Math.round((consumed / calorieTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{currentDate}</span>
          </div>
          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(getTodayDate())}
          className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
        >
          Today
        </button>
      </div>

      {/* Energy & Macros Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Main Calorie Gauge */}
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span>Calories</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{consumed}</span>
              <span className="text-sm font-medium text-slate-400">/ {calorieTarget} kcal</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{remaining} kcal</strong> remaining
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage > 100 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Protein</span>
              <span className="text-emerald-700">
                {data?.dietLog.totalProtein || 0}g / {data?.targets.protein}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((data?.dietLog.totalProtein || 0) / (data?.targets.protein || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Muscle repair & synthesis</p>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Carbohydrates</span>
              <span className="text-sky-700">
                {data?.dietLog.totalCarbs || 0}g / {data?.targets.carbs}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((data?.dietLog.totalCarbs || 0) / (data?.targets.carbs || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Primary training fuel</p>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Fats</span>
              <span className="text-amber-700">
                {data?.dietLog.totalFats || 0}g / {data?.targets.fats}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((data?.dietLog.totalFats || 0) / (data?.targets.fats || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Hormonal health & recovery</p>
          </div>
        </div>
      </div>

      {/* Meals Sections */}
      <div className="space-y-4">
        {mealConfig.map(({ type, label, icon: MealIcon }) => {
          const entries = data?.dietLog.meals[type] || [];
          const mealCalories = entries.reduce(
            (sum, item) => sum + (item.calories || 0) * (item.servingQuantity || 1),
            0
          );

          return (
            <div
              key={type}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <MealIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                    <p className="text-xs text-slate-500">
                      {Math.round(mealCalories)} kcal total
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAdd(type)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food</span>
                </button>
              </div>

              {entries.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {entries.map((item) => (
                    <div
                      key={item._id?.toString() || item.name}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.servingQuantity} × {item.servingSize || '1 serving'} •{' '}
                          <span className="font-semibold text-slate-700">
                            {Math.round((item.calories || 0) * (item.servingQuantity || 1))} kcal
                          </span>{' '}
                          (P: {Math.round((item.protein || 0) * (item.servingQuantity || 1))}g, C:{' '}
                          {Math.round((item.carbs || 0) * (item.servingQuantity || 1))}g, F:{' '}
                          {Math.round((item.fats || 0) * (item.servingQuantity || 1))}g)
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(type, item)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Edit food"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(type, item._id?.toString())}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 px-4 text-center text-slate-400 text-xs">
                  No foods logged in {label.toLowerCase()} yet.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEntryId ? 'Edit Food Item' : `Add Food to ${activeMealType.toUpperCase()}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Chicken Breast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 150g or 1 cup"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serving Quantity
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={servingQuantity}
                    onChange={(e) => setServingQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="250"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="30"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={fats}
                    onChange={(e) => setFats(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingEntryId ? 'Update Food' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
