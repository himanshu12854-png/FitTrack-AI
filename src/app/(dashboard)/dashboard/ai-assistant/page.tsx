'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle2,
  Dumbbell,
  Bot,
  User as UserIcon,
  Flame,
  Upload,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { IAIMessage } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { invalidateCachePrefix } from '@/lib/client-cache';

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chat' | 'builder' | 'roadmap'>('chat');

  // Chat State
  const [messages, setMessages] = useState<IAIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Builder State
  const [builderPrompt, setBuilderPrompt] = useState('');
  const [builderLoading, setBuilderLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [pdfImportLoading, setPdfImportLoading] = useState(false);
  const [pdfImportError, setPdfImportError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Exercise Roadmap State
  const [roadmapGoal, setRoadmapGoal] = useState('');
  const [roadmapWeeks, setRoadmapWeeks] = useState(12);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<any | null>(null);

  // Load latest conversation
  useEffect(() => {
    const fetchLatestConv = async () => {
      try {
        const res = await fetch('/api/ai/chat');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const latestId = json.data[0]._id;
          const convRes = await fetch(`/api/ai/chat?id=${latestId}`);
          const convJson = await convRes.json();
          if (convJson.success && convJson.data) {
            setConversationId(convJson.data._id);
            setMessages(convJson.data.messages || []);
          }
        }
      } catch {
      }
    };
    fetchLatestConv();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Optimistically add user message
    const tempUserMsg: IAIMessage = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId || undefined,
          message: userText,
          includeContext: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send message');

      setConversationId(json.data.conversationId);
      setMessages(json.data.history);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Unable to connect to AI server.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderPrompt.trim() || builderLoading) return;

    try {
      setBuilderLoading(true);
      setGeneratedPlan(null);
      setApplySuccess(null);

      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: builderPrompt }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate plan');

      setGeneratedPlan(json.data);
      toast({
        title: 'Plan generated',
        description: 'Review your personalized plan below before applying.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Generation failed',
        description: err.message || 'Error generating plan',
        variant: 'error',
      });
    } finally {
      setBuilderLoading(false);
    }
  };

  const handleApplyPlan = async (type: 'workout' | 'diet' | 'both') => {
    if (!generatedPlan) return;

    try {
      setApplying(true);
      const res = await fetch('/api/ai/apply-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applyType: type,
          workoutPlan: generatedPlan.workoutPlan,
          dietPlan: generatedPlan.dietPlan,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to apply plan');

      invalidateCachePrefix('dashboard');
      if (type === 'diet' || type === 'both') {
        invalidateCachePrefix('diet-');
      }
      const successMsg = `Successfully applied ${type} plan to your account!`;
      setApplySuccess(successMsg);
      toast({
        title: 'Plan applied',
        description: successMsg,
        variant: 'success',
      });
      setTimeout(() => setApplySuccess(null), 4000);
    } catch (err: any) {
      toast({
        title: 'Apply failed',
        description: err.message || 'Error applying plan',
        variant: 'error',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapGoal.trim() || roadmapLoading) return;

    try {
      setRoadmapLoading(true);
      setRoadmapError(null);
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: roadmapGoal.trim(), weeks: roadmapWeeks }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Unable to generate exercise roadmap.');
      }
      setRoadmapData(json.data);
      toast({
        title: 'Exercise roadmap ready',
        description: `${json.data.durationWeeks}-week progression roadmap generated.`,
        variant: 'success',
      });
    } catch (err: any) {
      const msg = err.message || 'Unable to generate exercise roadmap.';
      setRoadmapError(msg);
      toast({ title: 'Roadmap error', description: msg, variant: 'error' });
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handlePdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || pdfImportLoading) return;

    const isAllowedMime =
      !file.type ||
      file.type === 'application/pdf' ||
      file.type === 'application/x-pdf' ||
      file.type === 'application/octet-stream';

    if (!isAllowedMime || !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfImportError('Only PDF files (.pdf) are supported.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPdfImportError('PDF must be smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    try {
      setPdfImportLoading(true);
      setPdfImportError(null);
      setGeneratedPlan(null);
      setApplySuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/ai/import-plan', { method: 'POST', body: formData });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Unable to analyze this PDF.');

      setGeneratedPlan(json.data);
    } catch (error) {
      setPdfImportError(error instanceof Error ? error.message : 'Unable to analyze this PDF.');
    } finally {
      setPdfImportLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Fitness Coach Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Plan Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Exercise Roadmap</span>
          </button>
        </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini AI Active</span>
        </span>
      </div>

      {/* Tab 1: AI Chat Assistant */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[72vh] overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  FitTrack AI Coach Ready
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  I have instant access to your saved fitness profile, today&apos;s logged calories, and your workout split. Ask me for plan reviews, form cues, high-protein meal ideas, or progressive overload recommendations.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {[
                    'Analyze my current calorie & macro balance',
                    'How can I break through a bench press plateau?',
                    'Suggest 3 high-protein snack ideas under 300 kcal',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setInputMessage(preset)}
                      className="text-xs font-medium px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-slate-700 text-left transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {chatLoading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-center"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
                      transition={{
                        duration: 0.75,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your workout split, macros, progressive overload..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputMessage.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: AI Plan Builder */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Goal Input Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              Natural Language Plan Generator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Describe your training goals, available gym days, preferences, or dietary requirements. FitTrack AI will formulate a complete 7-day split and macronutrient guideline.
            </p>

            <form onSubmit={handleGeneratePlan} className="mt-4 space-y-3">
              <textarea
                rows={3}
                required
                value={builderPrompt}
                onChange={(e) => setBuilderPrompt(e.target.value)}
                placeholder="e.g. I want to build muscle and increase bench press strength. I can train 4 days a week with access to full barbell and dumbbell gym equipment. Aiming for clean bulk."
                className="w-full p-3.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Will generate structured preview before replacing any active plan</span>
                </div>

                <button
                  type="submit"
                  disabled={builderLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {builderLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{builderLoading ? 'Designing Plan...' : 'Generate Personalized Plan'}</span>
                </button>
              </div>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Import an existing diet or workout plan</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload a text-based PDF (up to 2 MB). AI will extract it into a reviewable plan; nothing changes until you apply it.
                  </p>
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfImport}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={pdfImportLoading || builderLoading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {pdfImportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{pdfImportLoading ? 'Analyzing PDF...' : 'Upload PDF Plan'}</span>
                </button>
              </div>
              {pdfImportError && <p className="mt-3 text-xs font-medium text-rose-700">{pdfImportError}</p>}
            </div>
          </div>

          {applySuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{applySuccess}</span>
            </div>
          )}

          {/* Generated Plan Review & Approval Workflow */}
          {generatedPlan && (
            <div className="space-y-6">
              {/* Approval Action Bar */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Plan Generated: Review & Approve
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Inspect the AI-designed workout routine and macro guidelines below. Click to apply directly to your account.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplyPlan('workout')}
                    disabled={applying}
                    className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition"
                  >
                    Apply Workout Only
                  </button>
                  <button
                    onClick={() => handleApplyPlan('diet')}
                    disabled={applying}
                    className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition"
                  >
                    Apply Diet Only
                  </button>
                  <button
                    onClick={() => handleApplyPlan('both')}
                    disabled={applying}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
                  >
                    Apply Both Plans
                  </button>
                </div>
              </div>

              {/* Diet Recommendation Card */}
              {generatedPlan.dietPlan && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Proposed Nutrition Targets
                      </h3>
                      <p className="text-xs text-slate-400">
                        {generatedPlan.dietPlan.overview || 'Customized for your metabolic rate and goals'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Calories
                      </span>
                      <span className="text-xl font-extrabold text-slate-900">
                        {generatedPlan.dietPlan.dailyCalorieTarget} kcal
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Protein
                      </span>
                      <span className="text-xl font-extrabold text-emerald-700">
                        {generatedPlan.dietPlan.proteinTarget}g
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Carbs
                      </span>
                      <span className="text-xl font-extrabold text-sky-700">
                        {generatedPlan.dietPlan.carbsTarget}g
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Fats
                      </span>
                      <span className="text-xl font-extrabold text-amber-700">
                        {generatedPlan.dietPlan.fatsTarget}g
                      </span>
                    </div>
                  </div>

                  {generatedPlan.dietPlan.mealSuggestions && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Sample Meal Suggestions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {generatedPlan.dietPlan.mealSuggestions.map((m: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 text-xs">
                            <div className="flex justify-between font-bold text-slate-900 mb-1">
                              <span>{m.meal}</span>
                              <span className="text-emerald-700">{m.calories} kcal</span>
                            </div>
                            <ul className="text-slate-600 list-disc list-inside space-y-0.5">
                              {m.items?.map((item: string, j: number) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Workout Routine Preview */}
              {generatedPlan.workoutPlan && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {generatedPlan.workoutPlan.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {generatedPlan.workoutPlan.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {generatedPlan.workoutPlan.days?.map((day: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {day.dayName}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{day.name}</span>
                        </div>

                        {day.exercises && day.exercises.length > 0 ? (
                          <div className="divide-y divide-slate-200/60 text-xs mt-2">
                            {day.exercises.map((ex: any, j: number) => (
                              <div key={j} className="py-1.5 flex justify-between items-center">
                                <span className="font-semibold text-slate-800">{ex.name}</span>
                                <span className="text-slate-500">
                                  {ex.sets} sets × {ex.reps} reps ({ex.restSeconds}s rest)
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Rest & Recovery</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: AI Exercise Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              Multi-Phase Exercise Roadmap
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Uses your saved profile and logged workout history to build a validated multi-phase progression roadmap.
            </p>

            <form onSubmit={handleGenerateRoadmap} className="mt-4 space-y-3">
              <textarea
                rows={3}
                required
                value={roadmapGoal}
                onChange={(e) => setRoadmapGoal(e.target.value)}
                placeholder="e.g. Build upper-body strength and hit a 100kg bench press over 12 weeks while training 4 days per week."
                className="w-full p-3.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Duration:</label>
                  <select
                    value={roadmapWeeks}
                    onChange={(e) => setRoadmapWeeks(Number(e.target.value))}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                  >
                    <option value={8}>8 Weeks</option>
                    <option value={12}>12 Weeks</option>
                    <option value={16}>16 Weeks</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={roadmapLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {roadmapLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                  <span>{roadmapLoading ? 'Building Roadmap...' : 'Generate Exercise Roadmap'}</span>
                </button>
              </div>
            </form>

            {roadmapError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{roadmapError}</span>
              </div>
            )}
          </div>

          {roadmapData && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {roadmapData.durationWeeks}-Week Progression
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1.5">{roadmapData.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{roadmapData.goalSummary}</p>
                </div>
              </div>

              <div className="space-y-4">
                {roadmapData.phases?.map((phase: any) => (
                  <div
                    key={phase.phaseNumber}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-bold">
                          Phase {phase.phaseNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{phase.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {phase.weekRange} • {phase.weeklyFrequency}x / week
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{phase.focus}</p>

                    <div className="divide-y divide-slate-200/70 bg-white rounded-lg border border-slate-200/70 px-3">
                      {phase.keyExercises?.map((ex: any, idx: number) => (
                        <div key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-semibold text-slate-800">{ex.name}</span>
                          <span className="text-slate-500">
                            {ex.sets} sets × {ex.reps} • <span className="text-emerald-700">{ex.progressionCue}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Milestone: {phase.milestone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
