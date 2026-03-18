import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  FileSpreadsheet, 
  Hospital,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { DEPARTMENTS, DEFAULT_CATEGORIES, type Expense, type Department, type Category, type CashIn } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashIn, setCashIn] = useState<CashIn[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'entry' | 'add-cash' | 'history' | 'sheets' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<Department | 'All'>('All');

  // Load data from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('cd_petty_cash_data');
    const savedCashIn = localStorage.getItem('cd_petty_cash_in');
    const savedCategories = localStorage.getItem('cd_petty_cash_categories');
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error('Failed to parse saved expenses', e);
      }
    }
    if (savedCashIn) {
      try {
        setCashIn(JSON.parse(savedCashIn));
      } catch (e) {
        console.error('Failed to parse saved cash in', e);
      }
    }
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Failed to parse saved categories', e);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cd_petty_cash_data', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('cd_petty_cash_in', JSON.stringify(cashIn));
  }, [cashIn]);

  useEffect(() => {
    localStorage.setItem('cd_petty_cash_categories', JSON.stringify(categories));
  }, [categories]);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setExpenses([newExpense, ...expenses]);
    setActiveTab('history');
  };

  const addCash = (entry: Omit<CashIn, 'id' | 'createdAt'>) => {
    const newEntry: CashIn = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setCashIn([newEntry, ...cashIn]);
    setActiveTab('dashboard');
  };

  const deleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCashIn = cashIn.reduce((sum, c) => sum + c.amount, 0);
  const remainingCash = totalCashIn - totalSpent;

  const today = new Date();
  const todayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), today));
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const currentMonthExpenses = expenses.filter(e => {
    const date = parseISO(e.date);
    return isWithinInterval(date, {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    });
  });
  const monthlyTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const deptData = DEPARTMENTS.map(dept => ({
    name: dept,
    value: expenses.filter(e => e.department === dept).reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.value > 0);

  const categoryData = categories.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col">
        <div className="p-6 border-bottom border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Hospital size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">CD PATH & HOSPITAL</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Petty Cash System</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label="Daily Report" 
            active={activeTab === 'daily'} 
            onClick={() => setActiveTab('daily')} 
          />
          <NavItem 
            icon={<PlusCircle size={20} />} 
            label="New Expense" 
            active={activeTab === 'entry'} 
            onClick={() => setActiveTab('entry')} 
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Add Cash" 
            active={activeTab === 'add-cash'} 
            onClick={() => setActiveTab('add-cash')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Expense History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <div className="pt-4 pb-2 px-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Resources</p>
          </div>
          <NavItem 
            icon={<FileSpreadsheet size={20} />} 
            label="Google Sheets Guide" 
            active={activeTab === 'sheets'} 
            onClick={() => setActiveTab('sheets')} 
          />
          <NavItem 
            icon={<Filter size={20} />} 
            label="Manage Categories" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs font-medium text-emerald-800 mb-1">Eco-Friendly Tip</p>
            <p className="text-[10px] text-emerald-600 leading-relaxed">
              Always upload a digital voucher to keep our hospital 100% paperless.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Financial Overview'}
              {activeTab === 'daily' && 'Daily Petty Cash Dashboard'}
              {activeTab === 'entry' && 'Record Expense'}
              {activeTab === 'add-cash' && 'Add Petty Cash'}
              {activeTab === 'history' && 'Transaction History'}
              {activeTab === 'sheets' && 'Google Sheets Integration'}
              {activeTab === 'settings' && 'Category Management'}
            </h2>
            <p className="text-slate-500 text-sm">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('entry')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <PlusCircle size={18} />
              Quick Entry
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  label="Total Cash In" 
                  value={`৳${totalCashIn.toLocaleString()}`} 
                  icon={<ArrowUpRight className="text-blue-600" />}
                  trend="Total Fund"
                />
                <StatCard 
                  label="Total Spent" 
                  value={`৳${totalSpent.toLocaleString()}`} 
                  icon={<ArrowDownRight className="text-red-600" />}
                  trend="All Time"
                />
                <StatCard 
                  label="Remaining Balance" 
                  value={`৳${remainingCash.toLocaleString()}`} 
                  icon={<Wallet className="text-emerald-600" />}
                  trend="Available Cash"
                  highlight={remainingCash < 1000}
                />
                <StatCard 
                  label="Today's Expense" 
                  value={`৳${todayTotal.toLocaleString()}`} 
                  icon={<TrendingUp className="text-purple-600" />}
                  trend={format(today, 'MMM dd')}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Spending by Department
                  </h3>
                  <div className="h-[300px] w-full">
                    {deptData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {deptData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState message="No data to display yet." />
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6">Category Breakdown</h3>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState message="No data to display yet." />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.map((cat, i) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] text-slate-500 truncate">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <DailyDashboard 
              expenses={todayExpenses} 
              totalCashIn={totalCashIn}
              totalSpent={totalSpent}
              remainingCash={remainingCash}
              todayTotal={todayTotal}
            />
          )}

          {activeTab === 'entry' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <ExpenseForm onSubmit={addExpense} categories={categories} />
              </div>
            </div>
          )}

          {activeTab === 'add-cash' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <CashInForm onSubmit={addCash} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search expenses..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={18} className="text-slate-400" />
                  <select 
                    className="flex-1 md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value as any)}
                  >
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses
                        .filter(e => {
                          const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                              e.category.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesDept = filterDept === 'All' || e.department === filterDept;
                          return matchesSearch && matchesDept;
                        })
                        .map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {format(parseISO(expense.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                              {expense.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {expense.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                            ৳{expense.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {expense.receiptUrl && (
                                <a 
                                  href={expense.receiptUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Receipt"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                              <button 
                                onClick={() => deleteExpense(expense.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                            No transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sheets' && <SheetsGuide />}
          
          {activeTab === 'settings' && (
            <CategorySettings 
              categories={categories} 
              onAdd={(cat) => setCategories([...categories, cat])}
              onDelete={(cat) => setCategories(categories.filter(c => c !== cat))}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active 
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, trend, highlight }: { label: string, value: string, icon: React.ReactNode, trend: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm",
      highlight && "border-red-200 bg-red-50"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
    </div>
  );
}

function ExpenseForm({ onSubmit, categories }: { onSubmit: (expense: Omit<Expense, 'id' | 'createdAt'>) => void, categories: Category[] }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    department: DEPARTMENTS[0],
    category: categories[0] || '',
    amount: '',
    description: '',
    receiptUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      department: formData.department as Department,
      category: formData.category as Category
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (৳)</label>
          <input 
            type="number" 
            required
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.department}
            onChange={e => setFormData({...formData, department: e.target.value as any})}
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
        <textarea 
          required
          placeholder="What was this expense for? (e.g., 2 Light Bulbs for ICU)"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Digital Receipt Link (Optional)</label>
        <div className="relative">
          <Download className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="url" 
            placeholder="Paste Google Drive or Photo link here"
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.receiptUrl}
            onChange={e => setFormData({...formData, receiptUrl: e.target.value})}
          />
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
      >
        Save Expense Entry
      </button>
    </form>
  );
}

function CashInForm({ onSubmit }: { onSubmit: (entry: Omit<CashIn, 'id' | 'createdAt'>) => void }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    source: 'Hospital Fund'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (৳)</label>
          <input 
            type="number" 
            required
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source / Reference</label>
        <input 
          type="text" 
          required
          placeholder="e.g., Main Accounts, Hospital Fund"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          value={formData.source}
          onChange={e => setFormData({...formData, source: e.target.value})}
        />
      </div>
      <button 
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
      >
        Add to Petty Cash Fund
      </button>
    </form>
  );
}

function DailyDashboard({ expenses, totalCashIn, totalSpent, remainingCash, todayTotal }: { 
  expenses: Expense[], 
  totalCashIn: number,
  totalSpent: number,
  remainingCash: number,
  todayTotal: number
}) {
  const handlePrint = () => {
    window.print();
  };

  const deptSpending = DEPARTMENTS.map(dept => ({
    name: dept,
    amount: expenses.filter(e => e.department === dept).reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.amount > 0);

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h3 className="text-lg font-bold text-slate-800">Daily Summary: {format(new Date(), 'MMM dd, yyyy')}</h3>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all"
        >
          <Download size={16} />
          Print Daily Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-slate-500 text-xs font-medium mb-1">Total Fund (Cash In)</p>
          <h4 className="text-xl font-bold text-slate-900">৳{totalCashIn.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-slate-500 text-xs font-medium mb-1">Today's Total Expense</p>
          <h4 className="text-xl font-bold text-red-600">৳{todayTotal.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-slate-500 text-xs font-medium mb-1">Remaining Balance</p>
          <h4 className="text-xl font-bold text-emerald-600">৳{remainingCash.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
        <h4 className="font-bold text-slate-800 mb-4">Department-wise Expense (Today)</h4>
        <div className="space-y-3">
          {deptSpending.length > 0 ? deptSpending.map(dept => (
            <div key={dept.name} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{dept.name}</span>
              <span className="text-sm font-bold text-slate-900">৳{dept.amount.toLocaleString()}</span>
            </div>
          )) : (
            <p className="text-sm text-slate-400 italic">No expenses recorded today.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-slate-300">
        <h4 className="font-bold text-slate-800 p-6 border-b border-slate-100">Detailed Transaction List (Today)</h4>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Dept</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Description</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(e => (
              <tr key={e.id}>
                <td className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">{e.department}</td>
                <td className="px-6 py-3 text-xs text-slate-900">{e.description}</td>
                <td className="px-6 py-3 text-xs font-bold text-slate-900 text-right">৳{e.amount.toLocaleString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic text-xs">No transactions today.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="hidden print:block mt-20 pt-10 border-t border-slate-200">
        <div className="flex justify-between">
          <div className="text-center">
            <div className="w-40 border-b border-slate-900 mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Prepared By</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-slate-900 mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Authorized By</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySettings({ categories, onAdd, onDelete }: { 
  categories: Category[], 
  onAdd: (cat: string) => void, 
  onDelete: (cat: string) => void 
}) {
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat && !categories.includes(newCat)) {
      onAdd(newCat);
      setNewCat('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Filter size={20} className="text-emerald-600" />
          Add New Category
        </h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g., Ventilation Service Fee"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Existing Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group">
              <span className="text-sm text-slate-700">{cat}</span>
              <button 
                onClick={() => onDelete(cat)}
                className="text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SheetsGuide() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="text-emerald-600" />
          Google Sheets Setup Guide
        </h3>
        <p className="text-slate-600 mb-6">
          Follow these steps to replicate this system in Google Sheets for backup or alternative tracking.
        </p>

        <div className="space-y-6">
          <section>
            <h4 className="font-bold text-slate-800 mb-2">1. Main Data Sheet (Name it: "Expenses")</h4>
            <p className="text-sm text-slate-500 mb-3">Create these headers in Row 1:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['Date', 'Dept', 'Category', 'Description', 'Amount', 'Receipt URL'].map(h => (
                <div key={h} className="bg-slate-50 border border-slate-200 p-2 text-center rounded text-[10px] font-bold text-slate-600">{h}</div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-bold text-slate-800 mb-2">2. Automated Formulas</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Department-wise Summary</p>
                <code className="text-xs text-emerald-700 block bg-white p-3 rounded border border-slate-100">
                  =SUMIF(Expenses!B:B, "Pathology", Expenses!E:E)
                </code>
                <p className="text-[10px] text-slate-500 mt-2">Replace "Pathology" with other department names to get their totals.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Month-wise Summary (Current Month)</p>
                <code className="text-xs text-emerald-700 block bg-white p-3 rounded border border-slate-100">
                  =SUMIFS(Expenses!E:E, Expenses!A:A, "&gt;="&amp;EOMONTH(TODAY(),-1)+1, Expenses!A:A, "&lt;="&amp;EOMONTH(TODAY(),0))
                </code>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-slate-800 mb-2">3. Digital Receipt Tip</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              In the "Receipt URL" column, use the <code className="bg-slate-100 px-1 rounded text-emerald-700">=HYPERLINK("url", "View Voucher")</code> formula to keep the sheet clean while maintaining paperless records.
            </p>
          </section>
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold mb-4">Smart Apps Script (Advanced)</h3>
        <p className="text-emerald-100 text-sm mb-6">
          Paste this code into Extensions &gt; Apps Script to create a custom menu in your Google Sheet.
        </p>
        <pre className="bg-emerald-950 p-4 rounded-xl text-[10px] overflow-x-auto text-emerald-300 border border-emerald-800">
{`function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏥 CD Hospital Admin')
      .addItem('Add New Expense', 'showForm')
      .addItem('Generate Monthly Report', 'generateReport')
      .addToUi();
}

function generateReport() {
  SpreadsheetApp.getUi().alert('Generating detailed PDF report for all departments...');
  // Logic to filter and export to PDF
}`}
        </pre>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
      <History size={48} strokeWidth={1} className="mb-2 opacity-20" />
      <p className="text-sm italic">{message}</p>
    </div>
  );
}
