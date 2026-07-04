import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const charset = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
};

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatePassword = useCallback(() => {
    let chars = '';
    if (options.uppercase) chars += charset.uppercase;
    if (options.lowercase) chars += charset.lowercase;
    if (options.numbers) chars += charset.numbers;
    if (options.symbols) chars += charset.symbols;

    if (chars === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    
    // Guarantee at least one of each selected character type
    const guaranteedChars = [];
    if (options.uppercase) guaranteedChars.push(charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)]);
    if (options.lowercase) guaranteedChars.push(charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)]);
    if (options.numbers) guaranteedChars.push(charset.numbers[Math.floor(Math.random() * charset.numbers.length)]);
    if (options.symbols) guaranteedChars.push(charset.symbols[Math.floor(Math.random() * charset.symbols.length)]);

    generatedPassword += guaranteedChars.join('');

    for (let i = generatedPassword.length; i < length[0]; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }
    
    // Shuffle the generated password
    generatedPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(generatedPassword);
    setCopied(false);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  const getStrength = () => {
    let score = 0;
    if (!password) return { label: 'None', color: 'bg-gray-200', text: 'text-gray-500' };
    
    if (length[0] > 8) score += 1;
    if (length[0] > 12) score += 1;
    if (options.uppercase) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 1;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600', bars: 1 };
    if (score === 3) return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-600', bars: 2 };
    if (score === 4) return { label: 'Strong', color: 'bg-green-500', text: 'text-green-600', bars: 3 };
    return { label: 'Very Strong', color: 'bg-green-600', text: 'text-green-700', bars: 4 };
  };

  const strength = getStrength();

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Password Generator</h1>
        <p className="text-muted-foreground">Create strong, secure, and random passwords</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-8">
        
        {/* Output Area */}
        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-2xl md:text-3xl break-all text-gray-900 font-medium tracking-wide">
              {password || <span className="text-gray-400">Select options</span>}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-blue-200/50">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${strength.text}`}>{strength.label}</span>
              <div className="flex gap-1 h-1.5 w-16">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`h-full w-full rounded-full transition-colors ${
                      bar <= (strength.bars || 0) ? strength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={generatePassword}
                title="Regenerate"
                className="hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleCopy}
                disabled={!password}
                className="gap-2 min-w-[100px]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Password Length</Label>
              <span className="text-lg font-bold text-primary bg-blue-50 px-3 py-1 rounded-md">{length[0]}</span>
            </div>
            <Slider
              value={length}
              onValueChange={setLength}
              max={64}
              min={8}
              step={1}
              className="py-4"
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold block mb-4">Characters used</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <Checkbox 
                  checked={options.uppercase}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, uppercase: !!checked }))}
                />
                <span className="font-medium">Uppercase (A-Z)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <Checkbox 
                  checked={options.lowercase}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, lowercase: !!checked }))}
                />
                <span className="font-medium">Lowercase (a-z)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <Checkbox 
                  checked={options.numbers}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, numbers: !!checked }))}
                />
                <span className="font-medium">Numbers (0-9)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-200">
                <Checkbox 
                  checked={options.symbols}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, symbols: !!checked }))}
                />
                <span className="font-medium">Symbols (!-$^+)</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}