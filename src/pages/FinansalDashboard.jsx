import React, { useContext, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { 
  Download, Wallet, Building2, Plus, X, TrendingUp, TrendingDown,
  CheckCircle, AlertCircle, Filter, ChevronDown
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function FinansalDashboard() {
  const { 
    transactions, addTransaction, residents, 
    currentRole, showNotification, computeLateInterest
  } = useContext(AppContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [txFilter, setTxFilter] = useState('Tümü'); // 'Tümü' | 'income' | 'expense'
  const [showAllTx, setShowAllTx] = useState(false);

  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: 'Bakım',
    amount: '',
    method: 'Banka',
    description: ''
  });

  // ── Temel Hesaplamalar ──────────────────────────────────────────
  const initialBank = 150000;
  const initialCash  = 100000;

  const bankBalance = initialBank + transactions.reduce((acc, t) =>
    t.method === 'Banka' ? acc + (t.type === 'income' ? t.amount : -t.amount) : acc, 0);

  const cashBalance = initialCash + transactions.reduce((acc, t) =>
    t.method === 'Nakit' ? acc + (t.type === 'income' ? t.amount : -t.amount) : acc, 0);

  const totalBalance  = bankBalance + cashBalance;
  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense  = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netIncome     = totalIncome - totalExpense;

  // Aidat Tahsilat Oranı
  const totalRes          = residents.length;
  const paidRes           = residents.filter(r => r.status === 'paid').length;
  const collectionRate    = totalRes > 0 ? Math.round((paidRes / totalRes) * 100) : 100;

  // Gecikme Faizi dahil Toplam Alacak
  const totalLateInterest = residents.reduce((s, r) => s + computeLateInterest(r), 0);
  const totalOutstanding  = residents.reduce((s, r) => s + (r.dues || 0), 0) + totalLateInterest;

  // ── Aylık Grafik Verisi ─────────────────────────────────────────
  const monthLabels = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

  const monthlyData = monthLabels.map((label, idx) => {
    const m = String(idx + 1).padStart(2, '0');
    const monthTx = transactions.filter(t => t.date.split('-')[1] === m);
    const gelir   = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const gider   = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { name: label, gelir, gider, net: gelir - gider };
  }).filter(d => d.gelir > 0 || d.gider > 0); // Sadece veri olan ayları göster

  // ── Pasta Grafik: Gider Dağılımı ────────────────────────────────
  const expenseCatMap = {
    'Bakım':      { color: '#3b82f6' },
    'Personel':   { color: '#10b981' },
    'Ortak Alan': { color: '#f59e0b' },
    'Yönetim':    { color: '#8b5cf6' },
  };
  const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const pieData = Object.entries(expenseCatMap).map(([name, cfg]) => {
    const val = transactions
      .filter(t => t.type === 'expense' && t.category === name)
      .reduce((s, t) => s + t.amount, 0);
    return { name, value: val, pct: expenseTotal > 0 ? Math.round((val / expenseTotal) * 100) : 0, color: cfg.color };
  }).filter(d => d.value > 0);

  // ── Filtered İşlem Listesi ──────────────────────────────────────
  const filteredTx = transactions.filter(t =>
    txFilter === 'Tümü' || t.type === txFilter
  );
  const displayedTx = showAllTx ? filteredTx : filteredTx.slice(0, 8);

  // ── Form İşlemleri ──────────────────────────────────────────────
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTx.amount || isNaN(newTx.amount) || Number(newTx.amount) <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }
    addTransaction(newTx);
    setShowAddModal(false);
    setNewTx({ date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Bakım', amount: '', method: 'Banka', description: '' });
    showNotification(
      `${newTx.type === 'income' ? 'Gelir' : 'Gider'} kaydı oluşturuldu: ${Number(newTx.amount).toLocaleString('tr-TR')} TL`,
      newTx.type === 'income' ? 'success' : 'info'
    );
  };

  const downloadCSV = () => {
    let csv = 'Tarih,Tip,Kategori,Tutar,Odeme Yontemi,Aciklama\n';
    transactions.forEach(t => {
      csv += `${t.date},${t.type === 'income' ? 'Gelir' : 'Gider'},${t.category},${t.amount},${t.method},"${t.description}"\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + csv);
    link.download = `finans_raporu_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('CSV raporu indirildi.', 'success');
  };

  // ── KPI Kartları ────────────────────────────────────────────────
  const kpiCards = [
    {
      label: 'Toplam Kasa Bakiyesi',
      value: `${totalBalance.toLocaleString('tr-TR')} TL`,
      sub: `Banka: ${bankBalance.toLocaleString('tr-TR')} TL  •  Nakit: ${cashBalance.toLocaleString('tr-TR')} TL`,
      icon: Wallet,
      gradient: 'from-[#1A237E] to-blue-700',
      textColor: 'text-white',
      subColor: 'text-white/60',
    },
    {
      label: 'Dönem Net Kâr / Zarar',
      value: `${netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString('tr-TR')} TL`,
      sub: `Gelir: ${totalIncome.toLocaleString('tr-TR')} TL  •  Gider: ${totalExpense.toLocaleString('tr-TR')} TL`,
      icon: netIncome >= 0 ? TrendingUp : TrendingDown,
      gradient: netIncome >= 0 ? 'from-emerald-600 to-emerald-400' : 'from-red-600 to-red-400',
      textColor: 'text-white',
      subColor: 'text-white/60',
    },
    {
      label: 'Aidat Tahsilat Oranı',
      value: `%${collectionRate}`,
      sub: `${paidRes} / ${totalRes} daire ödedi`,
      icon: CheckCircle,
      gradient: collectionRate >= 80 ? 'from-teal-600 to-teal-400' : 'from-amber-500 to-amber-400',
      textColor: 'text-white',
      subColor: 'text-white/60',
      progress: collectionRate,
    },
    {
      label: 'Toplam Gecikmiş Alacak',
      value: `${totalOutstanding.toLocaleString('tr-TR')} TL`,
      sub: `Faiz dahil  •  ${residents.filter(r => r.dues > 0).length} borçlu daire`,
      icon: AlertCircle,
      gradient: totalOutstanding > 0 ? 'from-rose-600 to-rose-400' : 'from-gray-500 to-gray-400',
      textColor: 'text-white',
      subColor: 'text-white/60',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Başlık ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Mali Durum & Finansal Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Apartman bütçesi, tahsilat durumu ve harcama analizini buradan yönetin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm border border-[var(--border)] rounded-xl px-4 py-2 hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium transition-colors"
          >
            <Download size={15} /> Rapor İndir
          </button>
          {currentRole === 'yonetici' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#1A237E] hover:bg-[#151c66] text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={15} /> Kayıt Ekle
            </button>
          )}
        </div>
      </div>

      {/* ── 4 KPI Kartı ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 relative overflow-hidden shadow-md`}>
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="flex justify-between items-start mb-3">
                <p className={`text-[11px] font-semibold ${card.subColor} uppercase tracking-wide`}>{card.label}</p>
                <div className="bg-white/15 p-1.5 rounded-lg">
                  <Icon size={14} className={card.textColor} />
                </div>
              </div>
              <p className={`text-2xl font-extrabold ${card.textColor} leading-tight`}>{card.value}</p>
              {card.progress !== undefined && (
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              )}
              <p className={`text-[10px] ${card.subColor} mt-2 leading-snug`}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Grafik Satırı: Bar Chart + Pie Chart ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Aylık Gelir / Gider Bar Chart — 2 kolon */}
        <div className="md:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Aylık Gelir – Gider Karşılaştırması</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Veri girilen aylar gösterilmektedir</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[var(--text-secondary)]">Gelir</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[var(--text-secondary)]">Gider</span></div>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip
                  formatter={(v, n) => [`${v.toLocaleString('tr-TR')} TL`, n === 'gelir' ? 'Gelir' : 'Gider']}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '12px' }}
                />
                <Bar dataKey="gelir" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={22} />
                <Bar dataKey="gider" fill="#f43f5e" radius={[5, 5, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gider Dağılımı Pasta Grafik */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] shadow-sm p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Gider Kategori Dağılımı</h3>
          <p className="text-[11px] text-[var(--text-muted)] mb-4">Toplam harcama kırılımı</p>
          <div className="flex justify-center">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n, props) => [`%${props.payload.pct} (${v.toLocaleString('tr-TR')} TL)`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--text-secondary)] font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">%{item.pct}</span>
              </div>
            ))}
            {pieData.length === 0 && (
              <p className="text-center text-xs text-[var(--text-muted)] italic">Gider kaydı yok</p>
            )}
          </div>
        </div>
      </div>

      {/* ── İşlem Listesi ───────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-light)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Finansal İşlem Kayıtları</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Toplam {filteredTx.length} kayıt</p>
          </div>
          {/* Filtre Butonları */}
          <div className="flex gap-1.5 bg-[var(--bg-page)] p-1 rounded-xl">
            {['Tümü', 'income', 'expense'].map(f => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  txFilter === f
                    ? f === 'income' ? 'bg-emerald-500 text-white shadow-sm'
                    : f === 'expense' ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f === 'Tümü' ? 'Tümü' : f === 'income' ? 'Gelirler' : 'Giderler'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold border-b border-[var(--border-light)]">
                <th className="px-5 py-3.5">Tarih</th>
                <th className="px-5 py-3.5">Tür</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Açıklama</th>
                <th className="px-5 py-3.5">Yöntem</th>
                <th className="px-5 py-3.5 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] text-xs text-[var(--text-primary)]">
              {displayedTx.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-[var(--text-muted)] italic">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                displayedTx.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{t.date}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {t.type === 'income' ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {t.type === 'income' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[var(--text-primary)]">{t.category}</td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] max-w-[220px] truncate">{t.description}</td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)]">{t.method}</td>
                    <td className={`px-5 py-3.5 text-right font-bold ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('tr-TR')} TL
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Daha Fazla / Daha Az */}
        {filteredTx.length > 8 && (
          <div className="p-4 border-t border-[var(--border-light)] text-center">
            <button
              onClick={() => setShowAllTx(!showAllTx)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
            >
              {showAllTx ? 'Daha Az Göster' : `Tüm ${filteredTx.length} Kaydı Göster`}
              <ChevronDown size={13} className={`transition-transform ${showAllTx ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* ── Gelir / Gider Ekleme Modalı ─────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Yeni Finansal Kayıt</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">Gelir veya gider işlemini sisteme ekleyin.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Tip Seçici */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">İşlem Türü</label>
                <div className="grid grid-cols-2 gap-2 bg-[var(--bg-page)] p-1 rounded-xl">
                  <button type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'income', category: 'Aidat' })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      newTx.type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📈 Gelir (Tahsilat)
                  </button>
                  <button type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'expense', category: 'Bakım' })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      newTx.type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📉 Gider (Harcama)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                  <select value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-blue-500"
                  >
                    {newTx.type === 'income' ? (
                      <>
                        <option value="Aidat">Aidat Tahsilatı</option>
                        <option value="Diğer">Diğer Gelir</option>
                      </>
                    ) : (
                      <>
                        <option value="Bakım">Bakım / Onarım</option>
                        <option value="Personel">Personel Gideri</option>
                        <option value="Ortak Alan">Ortak Alan Gideri</option>
                        <option value="Yönetim">Yönetim Gideri</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ödeme Yöntemi</label>
                  <select value={newTx.method}
                    onChange={(e) => setNewTx({ ...newTx, method: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-blue-500"
                  >
                    <option value="Banka">Banka Havalesi</option>
                    <option value="Nakit">Nakit (Elden Kasa)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tarih</label>
                  <input type="date" required value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 text-[var(--text-primary)] bg-[var(--bg-page)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tutar (TL)</label>
                  <input type="number" required min="1" placeholder="0"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 text-[var(--text-primary)] bg-[var(--bg-page)] outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Açıklama</label>
                <input type="text" required placeholder="Örn: A Blok Asansör Onarımı"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 text-[var(--text-primary)] bg-[var(--bg-page)] outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit"
                className={`w-full text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1 ${
                  newTx.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                Kaydı Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
