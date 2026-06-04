import React, { useContext, useState } from 'react';
import { 
  Plus, Search, LayoutGrid, List, Wrench, AlertTriangle, 
  Clock, CheckCircle, ArrowRight, Eye, X, Check, ArrowLeft 
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Talepler() {
  const { requests, updateRequestStatus, addRequest, currentRole, currentUser, showNotification } = useContext(AppContext);

  // Görünüm State'i: 'kanban' ya da 'list'
  const [viewMode, setViewMode] = useState('kanban');

  // Filtre State'leri
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [priorityFilter, setPriorityFilter] = useState('Tümü');

  // Modallar
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Yeni Talep Formu State'i
  const [newRequest, setNewRequest] = useState({
    title: '',
    category: 'Arıza',
    priority: 'Orta',
    description: ''
  });

  // Yeni talep gönderme
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.description) {
      alert('Lütfen gerekli alanları doldurunuz.');
      return;
    }
    addRequest(newRequest);
    setShowAddModal(false);
    setNewRequest({ title: '', category: 'Arıza', priority: 'Orta', description: '' });
    showNotification('Talebiniz başarıyla iletildi!', 'success');
  };

  // Kategori ikon eşleştirmesi
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Arıza': return 'bg-red-50 text-red-700 border-red-100';
      case 'Temizlik': return 'bg-green-50 text-green-700 border-green-100';
      case 'Güvenlik': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Peyzaj': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Öncelik etiket renk eşleştirmesi
  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Yüksek': return 'bg-rose-100 text-rose-800';
      case 'Orta': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Sakin modunda sadece kendi talepleri görünsün
  const baseRequests = currentRole === 'sakin'
    ? requests.filter(r => r.residentName === currentUser?.name || r.unit === currentUser?.unit)
    : requests;

  // Arama ve filtreleri uygula
  const filteredRequests = baseRequests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase()) ||
                          r.residentName.toLowerCase().includes(search.toLowerCase()) ||
                          r.unit.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Tümü' || r.category === categoryFilter;
    const matchesPriority = priorityFilter === 'Tümü' || r.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Kanban Sütunları
  const statuses = ['Beklemede', 'İşlemde', 'Tamamlandı'];

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Görünüm Seçimi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Talep Takip Sistemi</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {currentRole === 'sakin'
              ? 'Kendi arıza ve bakım taleplerinizi buradan takip edin'
              : 'Bina genelindeki arıza, temizlik ve bakım isteklerini gerçek zamanlı takip edin'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Görünüm Değiştirici Butonlar */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
               onClick={() => setViewMode('kanban')}
               className={`p-1.5 rounded-lg transition-all ${
                 viewMode === 'kanban' ? 'bg-[var(--bg-card)] text-blue-600 shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
               }`}
               title="Panoya Geç"
            >
               <LayoutGrid size={16} />
            </button>
            <button
               onClick={() => setViewMode('list')}
               className={`p-1.5 rounded-lg transition-all ${
                 viewMode === 'list' ? 'bg-[var(--bg-card)] text-blue-600 shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
               }`}
               title="Listeye Geç"
            >
               <List size={16} />
            </button>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1A237E] hover:bg-[#151c66] text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} /> Yeni Talep Bildir
          </button>
        </div>
      </div>

      {/* Arama ve Filtre Paneli */}
      <div className="bg-[var(--bg-card)] p-4 rounded-2xl shadow-sm border border-[var(--border-light)] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Talep adı, detay, sakin adı..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[var(--border)] rounded-xl outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
           <select 
             value={categoryFilter}
             onChange={(e) => setCategoryFilter(e.target.value)}
             className="text-xs border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-blue-500"
           >
              <option value="Tümü">Tüm Kategoriler</option>
              <option value="Arıza">Arıza / Onarım</option>
              <option value="Temizlik">Temizlik</option>
              <option value="Güvenlik">Güvenlik</option>
              <option value="Peyzaj">Peyzaj</option>
              <option value="Diğer">Diğer</option>
           </select>
           <select 
             value={priorityFilter}
             onChange={(e) => setPriorityFilter(e.target.value)}
             className="text-xs border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-blue-500"
           >
              <option value="Tümü">Tüm Öncelikler</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Orta">Orta</option>
              <option value="Düşük">Düşük</option>
           </select>
        </div>
      </div>

      {/* KANBAN PANOSU GÖRÜNÜMÜ */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map(status => {
            const statusReqs = filteredRequests.filter(r => r.status === status);
            return (
              <div key={status} className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-light)] flex flex-col h-[600px]">
                {/* Sütun Başlığı */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'Beklemede' ? 'bg-orange-400' : status === 'İşlemde' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></span>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{status}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                    {statusReqs.length}
                  </span>
                </div>

                {/* Sütun Kart Listesi */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {statusReqs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)] italic border-2 border-dashed border-[var(--border)] rounded-xl py-12">
                      Talep bulunmuyor
                    </div>
                  ) : (
                    statusReqs.map(req => (
                      <div 
                        key={req.id} 
                        className="bg-[var(--bg-page)] p-4 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between min-h-[140px]"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <div>
                          <div className="flex justify-between items-center gap-2 mb-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-md ${getCategoryColor(req.category)}`}>
                              {req.category}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getPriorityBadge(req.priority)}`}>
                              {req.priority}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{req.title}</h4>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">{req.description}</p>
                        </div>

                        <div className="border-t border-[var(--border-light)] mt-4 pt-2.5 flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                          <div>
                            <span className="font-semibold text-[var(--text-primary)]">{req.residentName}</span>
                            <span className="mx-1">•</span>
                            <span>{req.unit}</span>
                          </div>
                          <span>{req.date}</span>
                        </div>

                        {/* Yönetici Hızlı İşlem Butonları */}
                        {currentRole === 'yonetici' && (
                          <div className="flex gap-1.5 mt-3 border-t border-[var(--border-light)] pt-2" onClick={(e) => e.stopPropagation()}>
                            {status === 'Beklemede' && (
                              <button
                                onClick={() => updateRequestStatus(req.id, 'İşlemde')}
                                className="w-full flex items-center justify-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] py-1.5 font-bold rounded-lg transition-colors"
                              >
                                İşleme Al <ArrowRight size={10} />
                              </button>
                            )}
                            {status === 'İşlemde' && (
                              <>
                                <button
                                  onClick={() => updateRequestStatus(req.id, 'Beklemede')}
                                  className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px] py-1.5 font-bold rounded-lg transition-colors"
                                >
                                  <ArrowLeft size={10} /> İptal
                                </button>
                                <button
                                  onClick={() => updateRequestStatus(req.id, 'Tamamlandı')}
                                  className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 text-[10px] py-1.5 font-bold rounded-lg transition-colors"
                                >
                                  Tamamla <Check size={10} />
                                </button>
                              </>
                            )}
                            {status === 'Tamamlandı' && (
                              <button
                                onClick={() => updateRequestStatus(req.id, 'İşlemde')}
                                className="w-full flex items-center justify-center gap-1 bg-gray-100 text-gray-500 hover:bg-gray-200 text-[10px] py-1.5 font-bold rounded-lg transition-colors"
                              >
                                Geri Al
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LİSTE GÖRÜNÜMÜ */
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold border-b border-[var(--border-light)]">
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4">Blok/Daire</th>
                  <th className="px-6 py-4">Talep Eden</th>
                  <th className="px-6 py-4">Başlık</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Öncelik</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-right">Detay</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[var(--text-primary)] divide-y divide-[var(--border-light)]">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-[var(--text-muted)] italic">
                      Talep kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="px-6 py-4">{req.date}</td>
                      <td className="px-6 py-4 font-bold">{req.unit}</td>
                      <td className="px-6 py-4 font-medium">{req.residentName}</td>
                      <td className="px-6 py-4 truncate max-w-[180px]" title={req.title}>{req.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 border rounded text-[9px] font-bold ${getCategoryColor(req.category)}`}>
                          {req.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getPriorityBadge(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 font-bold ${
                          req.status === 'Beklemede' ? 'text-orange-500' : req.status === 'İşlemde' ? 'text-blue-500' : 'text-green-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'Beklemede' ? 'bg-orange-400' : req.status === 'İşlemde' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></span>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Talep Oluşturma Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Yeni Talep Gönder</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">Yönetime iletmek istediğiniz temizlik, arıza veya diğer konuları bildirin.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Konu / Talep Başlığı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Sorunu kısaca özetleyin"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="Arıza">Arıza / Onarım</option>
                    <option value="Temizlik">Temizlik</option>
                    <option value="Güvenlik">Güvenlik</option>
                    <option value="Peyzaj">Peyzaj / Çevre</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Öncelik Seviyesi</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="Düşük">Düşük</option>
                    <option value="Orta">Orta</option>
                    <option value="Yüksek">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Detaylı Açıklama *</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Yönetici ve teknisyene iletilecek açıklama..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2"
              >
                Talebi Oluştur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Talep Detay Modalı */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-md ${getCategoryColor(selectedRequest.category)}`}>
                {selectedRequest.category}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getPriorityBadge(selectedRequest.priority)}`}>
                {selectedRequest.priority} Öncelik
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">{selectedRequest.date}</span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">{selectedRequest.title}</h3>
            
            <div className="bg-[var(--bg-page)] p-3 rounded-xl mb-4 space-y-1.5 text-xs text-[var(--text-primary)] border border-[var(--border-light)]">
              <div className="flex justify-between">
                <span>Bildiren Sakin:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedRequest.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Blok / Daire:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedRequest.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mevcut Durum:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  selectedRequest.status === 'Beklemede' ? 'bg-orange-50 text-orange-600' : selectedRequest.status === 'İşlemde' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Detaylar / Açıklama</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-page)] p-3 rounded-lg border border-[var(--border-light)] whitespace-pre-wrap">{selectedRequest.description}</p>
            </div>

            {/* Yönetici Durum Değiştirici Butonları */}
            {currentRole === 'yonetici' ? (
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Talep Durumunu Güncelle</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { updateRequestStatus(selectedRequest.id, 'Beklemede'); showNotification('Talep durumu güncellendi: Beklemede', 'info'); setSelectedRequest(null); }}
                    className={`text-[10px] font-bold py-2 rounded-lg transition-colors border ${
                      selectedRequest.status === 'Beklemede' 
                        ? 'bg-orange-50 text-orange-600 border-orange-200' 
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    Beklemede
                  </button>
                  <button
                    onClick={() => { updateRequestStatus(selectedRequest.id, 'İşlemde'); showNotification('Talep işleme alındı.', 'info'); setSelectedRequest(null); }}
                    className={`text-[10px] font-bold py-2 rounded-lg transition-colors border ${
                      selectedRequest.status === 'İşlemde' 
                        ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    İşlemde
                  </button>
                  <button
                    onClick={() => { updateRequestStatus(selectedRequest.id, 'Tamamlandı'); showNotification('Talep başarıyla tamamlandı!', 'success'); setSelectedRequest(null); }}
                    className={`text-[10px] font-bold py-2 rounded-lg transition-colors border ${
                      selectedRequest.status === 'Tamamlandı' 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    Tamamlandı
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Kapat
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
