import React, { useContext, useState } from 'react';
import { 
  Bell, Megaphone, Search, Filter, Calendar, AlertTriangle, 
  X, Check, Plus, Eye 
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Duyurular() {
  const { announcements, addAnnouncement, currentRole } = useContext(AppContext);

  // Filtre State'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');

  // Modallar
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Yeni Duyuru Form State
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'Genel',
    priority: 'Normal'
  });

  // Yeni duyuru gönderme
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Lütfen gerekli alanları doldurunuz.');
      return;
    }
    addAnnouncement(newAnnouncement);
    setShowAddModal(false);
    setNewAnnouncement({ title: '', content: '', category: 'Genel', priority: 'Normal' });
  };

  // Kategori renkleri
  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Acil': return 'bg-red-50 text-red-700 border-red-100';
      case 'Finansal': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Bakım': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Arama ve filtreleri uygulama
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Tümü' || ann.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Tümü', 'Genel', 'Acil', 'Finansal', 'Bakım'];

  return (
    <div className="space-y-6">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Duyurular & Bildirimler</h2>
          <p className="text-xs text-[var(--text-muted)]">Yönetim tarafından yayınlanan resmi duyuru, bakım ve toplantı kararlarını takip edin</p>
        </div>
        {currentRole === 'yonetici' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1A237E] hover:bg-[#151c66] text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} /> Yeni Duyuru Yayınla
          </button>
        )}
      </div>

      {/* Arama ve Kategori Filtreleme Paneli */}
      <div className="bg-[var(--bg-card)] p-4 rounded-2xl shadow-sm border border-[var(--border-light)] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Kategori Sekmeleri */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                categoryFilter === cat 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Arama Barı */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Duyurularda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[var(--border)] rounded-xl outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Duyuru Kartları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl text-[var(--text-muted)] italic">
            Yayınlanmış duyuru bulunmuyor.
          </div>
        ) : (
          filteredAnnouncements.map(ann => (
            <div 
              key={ann.id}
              onClick={() => setSelectedAnn(ann)}
              className={`bg-[var(--bg-card)] rounded-2xl p-6 border shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden group ${
                ann.priority === 'Yüksek' ? 'border-red-100 bg-gradient-to-br from-[var(--bg-card)] to-red-50/5' : 'border-[var(--border-light)]'
              }`}
            >
              {/* Acil Duyuru Arka Plan Çizgi Efekti */}
              {ann.priority === 'Yüksek' && (
                <div className="absolute right-0 top-0 w-1.5 h-full bg-red-500"></div>
              )}

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-md uppercase tracking-wide ${getCategoryStyles(ann.category)}`}>
                    {ann.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Calendar size={12} />
                    <span>{ann.date}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  {ann.priority === 'Yüksek' && (
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug group-hover:text-blue-800 transition-colors">
                    {ann.title}
                  </h3>
                </div>
                
                <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="border-t border-[var(--border-light)] mt-5 pt-3 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span className="font-medium">Dijital Apartman Yönetimi</span>
                <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                  Detayları Oku <Eye size={12} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Duyuru Yayınlama Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Yeni Duyuru Yayınla</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">Tüm sakinlerin panolarında ve bildirimlerinde görünecek duyuru oluşturun.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Duyuru Başlığı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Başlık girin"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                  <select
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="Genel">Genel</option>
                    <option value="Acil">Acil Bildirim</option>
                    <option value="Finansal">Finansal Duyuru</option>
                    <option value="Bakım">Bakım / Kesinti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Önem Derecesi</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Yüksek">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Duyuru İçeriği *</label>
                <textarea 
                  required
                  rows="5"
                  placeholder="Duyuru mesajı buraya yazılır..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2"
              >
                Yayınla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Duyuru Detay Modalı */}
      {selectedAnn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedAnn(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-md uppercase tracking-wide ${getCategoryStyles(selectedAnn.category)}`}>
                {selectedAnn.category}
              </span>
              {selectedAnn.priority === 'Yüksek' && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                  Acil Öncelik
                </span>
              )}
              <span className="text-[10px] text-gray-400 ml-auto">{selectedAnn.date}</span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">{selectedAnn.title}</h3>
            
            <div className="space-y-1 mb-6">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-page)] p-4 rounded-xl border border-[var(--border-light)] whitespace-pre-wrap">
                {selectedAnn.content}
              </p>
            </div>

            <button
              onClick={() => setSelectedAnn(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
