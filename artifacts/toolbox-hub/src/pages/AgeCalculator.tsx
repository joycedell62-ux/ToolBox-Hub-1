import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon, Gift } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    nextBirthdayDays: number;
    dayOfWeek: string;
  } | null>(null);

  const calculateAge = useCallback(() => {
    if (!dob) {
      setResult(null);
      return;
    }

    const birthDate = parseISO(dob);
    if (!isValid(birthDate)) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to accurately compare dates
    
    if (birthDate > today) {
      // Future date not allowed for basic age calc
      setResult(null);
      return;
    }

    // Full years
    const years = differenceInYears(today, birthDate);
    
    // Remaining months after subtracting years
    const dateAfterYears = new Date(birthDate);
    dateAfterYears.setFullYear(birthDate.getFullYear() + years);
    const months = differenceInMonths(today, dateAfterYears);
    
    // Remaining days
    const dateAfterMonths = new Date(dateAfterYears);
    dateAfterMonths.setMonth(dateAfterYears.getMonth() + months);
    const days = differenceInDays(today, dateAfterMonths);

    // Next birthday
    let nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(today.getFullYear());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const nextBirthdayDays = differenceInDays(nextBirthday, today);
    
    // Day of week born
    const dayOfWeek = format(birthDate, 'EEEE');

    setResult({
      years,
      months,
      days,
      nextBirthdayDays,
      dayOfWeek
    });
  }, [dob]);

  useEffect(() => {
    calculateAge();
  }, [dob, calculateAge]);

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Age Calculator</h1>
        <p className="text-muted-foreground">Find out your exact age and next birthday</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
        
        <div className="max-w-sm mx-auto mb-10 space-y-3">
          <Label htmlFor="dob" className="text-base font-semibold block text-center">
            Select your Date of Birth
          </Label>
          <div className="relative">
            <Input 
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="h-14 text-lg px-4 bg-gray-50 text-center"
              max={new Date().toISOString().split('T')[0]} // Max date is today
            />
          </div>
        </div>

        {result ? (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 text-center mb-6">
              <h3 className="text-gray-500 font-medium uppercase tracking-widest text-sm mb-6">Your exact age is</h3>
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-6xl font-black text-primary mb-2">{result.years}</span>
                  <span className="text-sm md:text-base font-semibold text-gray-600">Years</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-6xl font-black text-primary mb-2">{result.months}</span>
                  <span className="text-sm md:text-base font-semibold text-gray-600">Months</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-6xl font-black text-primary mb-2">{result.days}</span>
                  <span className="text-sm md:text-base font-semibold text-gray-600">Days</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-5 flex items-start gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Next Birthday in</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.nextBirthdayDays === 0 ? "It's today! 🎉" : `${result.nextBirthdayDays} days`}
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-xl p-5 flex items-start gap-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Day of birth</div>
                  <div className="text-2xl font-bold text-gray-900">{result.dayOfWeek}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Enter your birth date above to see results</p>
          </div>
        )}

      </div>
    </div>
  );
}