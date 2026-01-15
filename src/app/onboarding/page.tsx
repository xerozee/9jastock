'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, TrendingUp, Shield, Clock, Building2, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const investmentGoals = [
  { value: 'wealth-building', label: 'Build Long-term Wealth', icon: TrendingUp, description: 'Grow my money steadily over time' },
  { value: 'retirement', label: 'Retirement Planning', icon: Target, description: 'Save for a comfortable retirement' },
  { value: 'passive-income', label: 'Generate Passive Income', icon: Building2, description: 'Earn regular dividends and returns' },
  { value: 'short-term-gains', label: 'Short-term Gains', icon: Clock, description: 'Capitalize on market opportunities' },
  { value: 'learning', label: 'Learn Investing', icon: Shield, description: 'Understand how the stock market works' },
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting my investment journey' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience with stocks and investments' },
  { value: 'advanced', label: 'Advanced', description: 'Comfortable with technical analysis' },
  { value: 'expert', label: 'Expert', description: 'Professional-level knowledge and experience' },
];

const riskTolerances = [
  { value: 'conservative', label: 'Conservative', description: 'Prefer stable, low-risk investments', color: 'bg-green-500' },
  { value: 'moderate', label: 'Moderate', description: 'Balance between growth and safety', color: 'bg-yellow-500' },
  { value: 'aggressive', label: 'Aggressive', description: 'Willing to take risks for higher returns', color: 'bg-red-500' },
];

const investmentHorizons = [
  { value: 'less-than-1-year', label: 'Less than 1 year' },
  { value: '1-3-years', label: '1-3 years' },
  { value: '3-5-years', label: '3-5 years' },
  { value: '5-10-years', label: '5-10 years' },
  { value: '10-plus-years', label: '10+ years' },
];

const sectors = [
  'Banking', 'Oil & Gas', 'Insurance', 'Consumer Goods', 'Agriculture',
  'Industrial', 'Healthcare', 'Real Estate', 'Telecommunications', 'Technology',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    investmentGoal: '',
    experienceLevel: '',
    riskTolerance: '',
    investmentHorizon: '',
    interestedSectors: [] as string[],
    bio: '',
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      interestedSectors: prev.interestedSectors.includes(sector)
        ? prev.interestedSectors.filter(s => s !== sector)
        : [...prev.interestedSectors, sector],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        router.push('/profile');
      } else {
        console.error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.investmentGoal;
      case 2: return !!formData.experienceLevel;
      case 3: return !!formData.riskTolerance;
      case 4: return !!formData.investmentHorizon;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">What's your investment goal?</h1>
                <p className="text-gray-400">This helps us personalize your experience</p>
              </div>
              <div className="grid gap-3">
                {investmentGoals.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.value}
                      onClick={() => setFormData(prev => ({ ...prev, investmentGoal: goal.value }))}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        formData.investmentGoal === goal.value
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${formData.investmentGoal === goal.value ? 'bg-green-500' : 'bg-gray-600'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-white">{goal.label}</div>
                        <div className="text-sm text-gray-400">{goal.description}</div>
                      </div>
                      {formData.investmentGoal === goal.value && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">What's your experience level?</h1>
                <p className="text-gray-400">We'll tailor content to match your expertise</p>
              </div>
              <div className="grid gap-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData(prev => ({ ...prev, experienceLevel: level.value }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      formData.experienceLevel === level.value
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="text-left flex-1">
                      <div className="font-medium text-white">{level.label}</div>
                      <div className="text-sm text-gray-400">{level.description}</div>
                    </div>
                    {formData.experienceLevel === level.value && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">What's your risk tolerance?</h1>
                <p className="text-gray-400">This helps us suggest appropriate stocks</p>
              </div>
              <div className="grid gap-3">
                {riskTolerances.map((risk) => (
                  <button
                    key={risk.value}
                    onClick={() => setFormData(prev => ({ ...prev, riskTolerance: risk.value }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      formData.riskTolerance === risk.value
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                    <div className="text-left flex-1">
                      <div className="font-medium text-white">{risk.label}</div>
                      <div className="text-sm text-gray-400">{risk.description}</div>
                    </div>
                    {formData.riskTolerance === risk.value && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Investment time horizon?</h1>
                <p className="text-gray-400">How long do you plan to invest?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {investmentHorizons.map((horizon) => (
                  <button
                    key={horizon.value}
                    onClick={() => setFormData(prev => ({ ...prev, investmentHorizon: horizon.value }))}
                    className={`p-4 rounded-xl border transition-all text-center ${
                      formData.investmentHorizon === horizon.value
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="font-medium text-white">{horizon.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Which sectors interest you?</h1>
                <p className="text-gray-400">Select all that apply (optional)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      formData.interestedSectors.includes(sector)
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tell us about yourself (optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share your investment journey, interests, or goals..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                step === 1
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  canProceed()
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push('/profile')}
          className="block mx-auto mt-4 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
