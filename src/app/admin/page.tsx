"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, ArrowLeft, Filter, 
  Database, RefreshCw, BarChart2, ShieldCheck, Check, 
  MapPin, HelpCircle, FileText, X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pagination } from '@/components/Pagination';

export default function AdminPage() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<any | null>(null);
  
  // Form fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Farmers');
  const [formCentralOrState, setFormCentralOrState] = useState<'Central' | 'State'>('Central');
  const [formStates, setFormStates] = useState('All');
  const [formDescription, setFormDescription] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formDocuments, setFormDocuments] = useState('Aadhaar Card, Income Certificate, Resident Proof');
  const [formLink, setFormLink] = useState('');
  const [formGender, setFormGender] = useState<'All' | 'Female' | 'Male'>('All');
  const [formOccupations, setFormOccupations] = useState('All');
  const [formMinAge, setFormMinAge] = useState('');
  const [formMaxAge, setFormMaxAge] = useState('');
  const [formIncomeLimit, setFormIncomeLimit] = useState('');
  const [formStudent, setFormStudent] = useState(false);
  const [formFarmer, setFormFarmer] = useState(false);
  const [formPregnant, setFormPregnant] = useState(false);
  const [formSenior, setFormSenior] = useState(false);
  const [formDailyWage, setFormDailyWage] = useState(false);
  const [formBpl, setFormBpl] = useState(false);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/schemes');
      const data = await res.json();
      if (data.schemes) {
        setSchemes(data.schemes);
      }
    } catch (e) {
      console.error('Failed to load schemes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleOpenAddModal = () => {
    setEditingScheme(null);
    setFormId('');
    setFormName('');
    setFormCategory('Farmers');
    setFormCentralOrState('Central');
    setFormStates('All');
    setFormDescription('');
    setFormBenefits('');
    setFormDocuments('Aadhaar Card, Income Certificate, Resident Proof');
    setFormLink('');
    setFormGender('All');
    setFormOccupations('All');
    setFormMinAge('');
    setFormMaxAge('');
    setFormIncomeLimit('');
    setFormStudent(false);
    setFormFarmer(false);
    setFormPregnant(false);
    setFormSenior(false);
    setFormDailyWage(false);
    setFormBpl(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (scheme: any) => {
    setEditingScheme(scheme);
    setFormId(scheme.id);
    setFormName(scheme.name);
    setFormCategory(scheme.category);
    setFormCentralOrState(scheme.central_or_state === 'State' ? 'State' : 'Central');
    
    // JSON arrays handling
    const states = Array.isArray(scheme.applicable_states) ? scheme.applicable_states.join(', ') : scheme.applicable_states;
    setFormStates(states || 'All');
    
    setFormDescription(scheme.description);
    setFormBenefits(scheme.benefits);
    
    const docs = Array.isArray(scheme.required_documents) ? scheme.required_documents.join(', ') : scheme.required_documents;
    setFormDocuments(docs || '');
    
    setFormLink(scheme.application_link || '');
    setFormGender(scheme.target_gender as any || 'All');
    
    const occupations = Array.isArray(scheme.target_occupations) ? scheme.target_occupations.join(', ') : scheme.target_occupations;
    setFormOccupations(occupations || 'All');
    
    setFormMinAge(scheme.min_age?.toString() || '');
    setFormMaxAge(scheme.max_age?.toString() || '');
    setFormIncomeLimit(scheme.income_limit?.toString() || '');
    
    setFormStudent(!!scheme.is_student_only);
    setFormFarmer(!!scheme.is_farmer_only);
    setFormPregnant(!!scheme.is_pregnant_only);
    setFormSenior(!!scheme.is_senior_only);
    setFormDailyWage(!!scheme.is_daily_wage_only);
    setFormBpl(!!scheme.is_bpl_only);
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;
    try {
      const res = await fetch(`/api/admin/schemes?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSchemes(schemes.filter(s => s.id !== id));
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formName) {
      alert('Scheme ID and Name are required');
      return;
    }

    const payload = {
      id: formId,
      name: formName,
      category: formCategory,
      central_or_state: formCentralOrState,
      applicable_states: formStates.split(',').map(s => s.trim()),
      description: formDescription,
      benefits: formBenefits,
      required_documents: formDocuments.split(',').map(d => d.trim()),
      application_link: formLink || null,
      tags: [formCategory.toLowerCase(), formCentralOrState.toLowerCase()],
      target_gender: formGender,
      target_occupations: formOccupations.split(',').map(o => o.trim()),
      min_age: formMinAge ? parseInt(formMinAge, 10) : null,
      max_age: formMaxAge ? parseInt(formMaxAge, 10) : null,
      income_limit: formIncomeLimit ? parseFloat(formIncomeLimit) : null,
      is_student_only: formStudent,
      is_farmer_only: formFarmer,
      is_pregnant_only: formPregnant,
      is_senior_only: formSenior,
      is_daily_wage_only: formDailyWage,
      is_bpl_only: formBpl
    };

    try {
      const method = editingScheme ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/schemes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSchemes();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const itemsPerPage = 100;
  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleSchemes = filteredSchemes.slice(startIndex, startIndex + itemsPerPage);

  const centralCount = schemes.filter(s => s.central_or_state === 'Central').length;
  const stateCount = schemes.filter(s => s.central_or_state === 'State').length;
  const categories = Array.from(new Set(schemes.map(s => s.category)));

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-cyan-500/30 pb-16">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-[#0B1120]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/demo" className="p-2 hover:bg-slate-800 rounded-lg text-zinc-400 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-extrabold text-xl text-white tracking-tight">JanSahayak<span className="text-cyan-400">.AI</span></span>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-xs font-bold font-mono">ADMIN PANEL</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchSchemes}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 rounded-lg text-zinc-300 transition-all flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900 to-[#121A2E] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Cloud Schemes</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{schemes.length}</h3>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Database className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-900 to-[#121A2E] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-400">Central Schemes</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{centralCount}</h3>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-900 to-[#121A2E] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-400">State-Specific Schemes</p>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-2">{stateCount}</h3>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <MapPin className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-900 to-[#121A2E] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-400">Welfare Categories</p>
              <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{categories.length}</h3>
            </div>
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <BarChart2 className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Search, Filter & Actions Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder="Search schemes by name, keyword or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl text-sm focus:outline-none transition-all placeholder:text-zinc-500 text-slate-100"
              />
            </div>
            
            <div className="relative w-full md:w-64">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer w-full"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleOpenAddModal}
            className="w-full md:w-auto shrink-0 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 active:scale-95 transition-all text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Add New Scheme
          </button>
        </div>

        {/* Database List Table */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <p>Fetching schemes from Supabase Cloud...</p>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <HelpCircle className="w-10 h-10 text-zinc-500" />
              <p className="font-semibold text-lg text-zinc-300">No Schemes Found</p>
              <p className="text-sm text-zinc-500">Try adjusting your filter or search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="px-6 py-4">ID / Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Scope</th>
                    <th className="px-6 py-4 max-w-xs">Description</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-zinc-300">
                  {visibleSchemes.map(scheme => (
                    <tr key={scheme.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-100">{scheme.name}</p>
                        <p className="text-xs text-mono text-zinc-500 font-mono mt-0.5">{scheme.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
                          {scheme.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                          scheme.central_or_state === 'Central' 
                            ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' 
                            : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
                        }`}>
                          {scheme.central_or_state}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md truncate">
                        {scheme.description}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(scheme)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-zinc-400 hover:text-cyan-400 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(scheme.id)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-zinc-400 hover:text-rose-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredSchemes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  langQuery="en-IN"
                  T={({ children }) => <>{children}</>}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  {editingScheme ? 'Edit Government Scheme' : 'Add New Government Scheme'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic fields */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scheme Unique ID (slug)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. pm-kisan (use lowercase and hyphens)"
                      value={formId}
                      onChange={e => setFormId(e.target.value)}
                      disabled={!!editingScheme}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm disabled:text-zinc-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scheme Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category (Sector)</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-zinc-300 focus:outline-none transition-all text-sm cursor-pointer"
                    >
                      <option value="Farmers">Farmers / Agriculture</option>
                      <option value="Students">Students / Education</option>
                      <option value="Women">Women / Maternity</option>
                      <option value="Seniors">Senior Citizens</option>
                      <option value="Social Welfare">Social Welfare</option>
                      <option value="Employment">Employment / Labour</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="General">General / Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scope</label>
                      <select
                        value={formCentralOrState}
                        onChange={e => setFormCentralOrState(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-zinc-300 focus:outline-none transition-all text-sm cursor-pointer"
                      >
                        <option value="Central">Central Govt</option>
                        <option value="State">State Govt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Applicable State(s)</label>
                      <input 
                        type="text" 
                        placeholder="All, or Andhra Pradesh, etc."
                        value={formStates}
                        onChange={e => setFormStates(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Text fields */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scheme Description</label>
                  <textarea 
                    placeholder="Describe the scheme objective, core target group, and overview..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Benefits Offered</label>
                  <textarea 
                    placeholder="Specify monetary benefit (e.g. ₹6,000 per year) or services provided..."
                    value={formBenefits}
                    onChange={e => setFormBenefits(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Required Documents (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Aadhaar Card, Income Certificate, Resident Proof"
                      value={formDocuments}
                      onChange={e => setFormDocuments(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Application Link / URL</label>
                    <input 
                      type="text" 
                      placeholder="e.g. https://pmkisan.gov.in/"
                      value={formLink}
                      onChange={e => setFormLink(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Eligibility rules */}
                <div className="border-t border-slate-800 pt-6">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">Rule-Based Eligibility Parameters</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Gender Constraint</label>
                      <select
                        value={formGender}
                        onChange={e => setFormGender(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-zinc-300 focus:outline-none transition-all text-sm cursor-pointer"
                      >
                        <option value="All">All Genders</option>
                        <option value="Female">Female Only</option>
                        <option value="Male">Male Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Occupation Filters</label>
                      <input 
                        type="text" 
                        placeholder="All, or Farmer, Student, etc."
                        value={formOccupations}
                        onChange={e => setFormOccupations(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Min Age</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 18"
                          value={formMinAge}
                          onChange={e => setFormMinAge(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Max Age</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 60"
                          value={formMaxAge}
                          onChange={e => setFormMaxAge(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Annual Income Limit (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 200000"
                        value={formIncomeLimit}
                        onChange={e => setFormIncomeLimit(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500/50 text-slate-100 focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Flag Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                    <label className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800/40 select-none">
                      <input 
                        type="checkbox" 
                        checked={formFarmer}
                        onChange={e => setFormFarmer(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm font-medium">Farmer Only</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800/40 select-none">
                      <input 
                        type="checkbox" 
                        checked={formStudent}
                        onChange={e => setFormStudent(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm font-medium">Student Only</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800/40 select-none">
                      <input 
                        type="checkbox" 
                        checked={formPregnant}
                        onChange={e => setFormPregnant(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm font-medium">Pregnant Only</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800/40 select-none">
                      <input 
                        type="checkbox" 
                        checked={formSenior}
                        onChange={e => setFormSenior(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm font-medium">Senior Only</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800/40 select-none">
                      <input 
                        type="checkbox" 
                        checked={formDailyWage}
                        onChange={e => setFormDailyWage(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm font-medium">Daily Wage Only</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800/40 select-none">
                      <input 
                        type="checkbox" 
                        checked={formBpl}
                        onChange={e => setFormBpl(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm font-medium">BPL Card Only</span>
                    </label>
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-850 hover:bg-slate-800 hover:text-white rounded-xl text-sm font-semibold transition-all text-zinc-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all text-white font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Save Scheme
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
