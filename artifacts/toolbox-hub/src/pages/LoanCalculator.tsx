import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState('5');
  const [term, setTerm] = useState('60'); // default 5 years (60 months)

  const [results, setResults] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    schedule: AmortizationRow[];
  } | null>(null);

  const calculateLoan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12; // monthly interest rate
    const n = parseFloat(term); // number of months

    if (!p || p <= 0 || !n || n <= 0) return;

    let monthlyPayment = 0;
    
    if (r === 0) {
      monthlyPayment = p / n;
    } else {
      monthlyPayment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - p;

    // Generate schedule (first 6 months)
    let balance = p;
    const schedule: AmortizationRow[] = [];
    
    for (let i = 1; i <= Math.min(n, 6); i++) {
      const interestForMonth = balance * r;
      const principalForMonth = monthlyPayment - interestForMonth;
      balance -= principalForMonth;
      
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalForMonth,
        interest: interestForMonth,
        balance: Math.max(0, balance)
      });
    }

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Loan Calculator</h1>
        <p className="text-muted-foreground">Calculate payments, interest, and view amortization schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border p-6 h-fit sticky top-24">
          <h2 className="text-lg font-semibold mb-6">Loan Details</h2>
          <form onSubmit={calculateLoan} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount ($)</Label>
              <Input 
                id="amount"
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-lg"
                min="0"
                step="100"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate">Annual Interest Rate (%)</Label>
              <Input 
                id="rate"
                type="number" 
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="h-12 text-lg"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Loan Term (Months)</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Months (1 Year)</SelectItem>
                  <SelectItem value="24">24 Months (2 Years)</SelectItem>
                  <SelectItem value="36">36 Months (3 Years)</SelectItem>
                  <SelectItem value="48">48 Months (4 Years)</SelectItem>
                  <SelectItem value="60">60 Months (5 Years)</SelectItem>
                  <SelectItem value="72">72 Months (6 Years)</SelectItem>
                  <SelectItem value="84">84 Months (7 Years)</SelectItem>
                  <SelectItem value="120">120 Months (10 Years)</SelectItem>
                  <SelectItem value="180">180 Months (15 Years)</SelectItem>
                  <SelectItem value="360">360 Months (30 Years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-2">
              Calculate Loan
            </Button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-8">
          {results ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-600 text-white rounded-xl p-6 shadow-sm">
                  <div className="text-blue-100 text-sm font-medium mb-1">Monthly Payment</div>
                  <div className="text-3xl font-bold truncate">{formatCurrency(results.monthlyPayment)}</div>
                </div>
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="text-muted-foreground text-sm font-medium mb-1">Total Payment</div>
                  <div className="text-2xl font-bold text-gray-900 truncate">{formatCurrency(results.totalPayment)}</div>
                </div>
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                  <div className="text-muted-foreground text-sm font-medium mb-1">Total Interest</div>
                  <div className="text-2xl font-bold text-gray-900 truncate">{formatCurrency(results.totalInterest)}</div>
                </div>
              </div>

              {/* Amortization Table */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">Amortization Schedule (First 6 Months)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Breakdown of principal and interest over time.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">Month</th>
                        <th className="px-6 py-4 font-medium">Payment</th>
                        <th className="px-6 py-4 font-medium">Principal</th>
                        <th className="px-6 py-4 font-medium">Interest</th>
                        <th className="px-6 py-4 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {results.schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{row.month}</td>
                          <td className="px-6 py-4">{formatCurrency(row.payment)}</td>
                          <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(row.principal)}</td>
                          <td className="px-6 py-4 text-orange-600 font-medium">{formatCurrency(row.interest)}</td>
                          <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-white rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed">
                <span className="text-3xl text-gray-300">$</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calculations yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Enter your loan amount, interest rate, and term on the left to see your payment details.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}