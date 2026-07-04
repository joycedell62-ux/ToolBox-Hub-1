import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function BmiCalculator() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [heightMetric, setHeightMetric] = useState('');
  const [weightMetric, setWeightMetric] = useState('');
  
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weightLbs, setWeightLbs] = useState('');

  const [result, setResult] = useState<{
    bmi: string;
    category: string;
    color: string;
    percentage: number;
  } | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    let bmiValue = 0;

    if (unit === 'metric') {
      const h = parseFloat(heightMetric) / 100; // cm to m
      const w = parseFloat(weightMetric);
      if (!h || !w) return;
      bmiValue = w / (h * h);
    } else {
      const h = (parseFloat(heightFt) * 12) + (parseFloat(heightIn) || 0); // feet+inches to inches
      const w = parseFloat(weightLbs);
      if (!h || !w) return;
      bmiValue = (w / (h * h)) * 703;
    }

    let category = '';
    let color = '';
    let percentage = 0; // Scale 15 to 40 roughly maps to 0-100%

    if (bmiValue < 18.5) {
      category = 'Underweight';
      color = 'text-blue-500';
      percentage = Math.max(0, ((bmiValue - 15) / 25) * 100);
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      category = 'Normal';
      color = 'text-green-500';
      percentage = ((bmiValue - 15) / 25) * 100;
    } else if (bmiValue >= 25 && bmiValue < 30) {
      category = 'Overweight';
      color = 'text-orange-500';
      percentage = ((bmiValue - 15) / 25) * 100;
    } else {
      category = 'Obese';
      color = 'text-red-500';
      percentage = Math.min(100, ((bmiValue - 15) / 25) * 100);
    }

    setResult({
      bmi: bmiValue.toFixed(1),
      category,
      color,
      percentage
    });
  };

  const clearForm = () => {
    setHeightMetric('');
    setWeightMetric('');
    setHeightFt('');
    setHeightIn('');
    setWeightLbs('');
    setResult(null);
  };

  return (
    <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">BMI Calculator</h1>
        <p className="text-muted-foreground">Check your Body Mass Index</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        
        {/* Results Banner */}
        {result && (
          <div className="bg-blue-50/50 p-6 border-b border-blue-100 text-center animate-in slide-in-from-top-2">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Your BMI is</p>
            <div className="text-5xl font-black text-gray-900 mb-2">{result.bmi}</div>
            <div className={`text-xl font-bold ${result.color}`}>{result.category}</div>
            
            <div className="mt-6 relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-[20%] bg-blue-400" />
              <div className="absolute top-0 left-[20%] h-full w-[26%] bg-green-400" />
              <div className="absolute top-0 left-[46%] h-full w-[20%] bg-orange-400" />
              <div className="absolute top-0 left-[66%] h-full w-[34%] bg-red-400" />
              
              {/* Marker */}
              <div 
                className="absolute top-0 w-1 h-full bg-black rounded-full transform -translate-x-1/2 z-10 transition-all duration-700 ease-out"
                style={{ left: `${result.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>
        )}

        <form onSubmit={calculateBMI} className="p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Measurement Unit</Label>
            <RadioGroup 
              defaultValue="metric" 
              value={unit} 
              onValueChange={(v: 'metric'|'imperial') => {
                setUnit(v);
                setResult(null);
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg px-4 py-3 flex-1 cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric" className="cursor-pointer font-medium">Metric (kg/cm)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg px-4 py-3 flex-1 cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="cursor-pointer font-medium">Imperial (lbs/ft)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-6">
            {unit === 'metric' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="heightMetric">Height (cm)</Label>
                  <Input 
                    id="heightMetric"
                    type="number" 
                    placeholder="e.g. 175" 
                    value={heightMetric}
                    onChange={(e) => setHeightMetric(e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightMetric">Weight (kg)</Label>
                  <Input 
                    id="weightMetric"
                    type="number" 
                    placeholder="e.g. 70" 
                    value={weightMetric}
                    onChange={(e) => setWeightMetric(e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Input 
                        type="number" 
                        placeholder="Feet" 
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                        required
                        className="h-12 text-lg pr-8"
                      />
                      <span className="absolute right-3 top-3 text-gray-400">ft</span>
                    </div>
                    <div className="relative flex-1">
                      <Input 
                        type="number" 
                        placeholder="Inches" 
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                        required
                        className="h-12 text-lg pr-8"
                      />
                      <span className="absolute right-3 top-3 text-gray-400">in</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightLbs">Weight (lbs)</Label>
                  <Input 
                    id="weightLbs"
                    type="number" 
                    placeholder="e.g. 150" 
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={clearForm} className="flex-1 h-12">
              Clear
            </Button>
            <Button type="submit" className="flex-1 h-12 text-base">
              Calculate BMI
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}