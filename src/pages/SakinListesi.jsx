import React, { useContext, useState } from 'react';
import { 
  Mail, Phone, MoreVertical, AlertTriangle, CheckCircle2, 
  User, Search, Plus, Trash2, Edit, X, Send, Check 
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function SakinListesi() {
  const { residents, addResident, updateResident, deleteResident, sendDuesReminder } = useContext(AppContext);

  // Filtreleme ve Arama State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tümü');
  const [statusFilter, setStatusFilter] = useState('Tümü');

  // Modallar için State'ler
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  // Satır bazlı açılır aksiyon menüsü takibi
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Yeni Sakin Form State
  const [newResident, setNewResident] = useState({
    name: '',
    unit: 'Blok A / Daire ',
    type: 'Kiracı',
    email: '',
    phone: '',
    status: 'paid',
    dues: 0
  });

  // Toast (Bildirim) State
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  // Sakin Ekleme Kaydetme
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newResident.name || !newResident.email || !newResident.phone) {
      alert('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }
    
    const duesVal = newResident.status === 'warning' ? Number(newResident.dues || 1200) : 0;
    addResident({
      ...newResident,
      dues: duesVal
    });
    
    setShowAddModal(false);
    setNewResident({
      name: '',
      unit: 'Blok A / Daire ',
      type: 'Kiracı',
      email: '',
      phone: '',
      status: 'paid',
      dues: 0
    });
    showToast('Yeni sakin başarıyla kaydedildi.');
  };

  // Sakin Düzenleme Kaydetme
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedResident.name || !selectedResident.email || !selectedResident.phone) {
      alert('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    const updated = {
      ...selectedResident,
      dues: selectedResident.status === 'warning' ? Number(selectedResident.dues || 1200) : 0
    };

    updateResident(updated);
    setShowEditModal(false);
    setSelectedResident(null);
    showToast('Sakin bilgileri güncellendi.');
  };

  // Sakin Silme
  const handleDeleteClick = (id, name) => {
    if (window.confirm(`${name} isimli sakini silmek istediğinize emin misiniz?`)) {
      deleteResident(id);
      showToast('Sakin listeden silindi.');
    }
    setActiveMenuId(null);
  };

  // Hatırlatma Gönderme
  const handleReminderClick = (resident) => {
    sendDuesReminder(resident.id);
    showToast(`${resident.name} sakinine SMS ve E-posta uyarısı simüle edildi.`);
    setActiveMenuId(null);
  };

  const handleEditClick = (resident) => {
    setSelectedResident({ ...resident });
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  // Arama ve Filtreleme Uygulama
  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'Tümü' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'Tümü' || 
                          (statusFilter === 'Ödendi' && r.status === 'paid') ||
                          (statusFilter === 'Borçlu' && r.status === 'warning');

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Bildirim Alanı */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-green-500 rounded-full p-1 text-white"><Check size={14} /></div>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Bina Sakinleri Toplu Görünümü</h2>
          <p className="text-xs text-[var(--text-muted)]">Tüm kat maliklerinin ve kiracıların bilgilerini, iletişim izinlerini ve aidat durumlarını inceleyin</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#1A237E] hover:bg-[#151c66] text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} /> Yeni Sakin Ekle
        </button>
      </div>

      {/* Tablonun bulunduğu beyaz kart alanı */}
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden flex flex-col">
        
        {/* Tablo Üst Kısım: Arama ve Filtreleme Seçenekleri */}
        <div className="p-4 border-b border-[var(--border-light)] flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--bg-page)]">
          {/* Arama Barı */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)]">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Sakin adı, daire veya e-posta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-[var(--border)] rounded-xl outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
            />
          </div>

          {/* Filtreleme Menüleri */}
          <div className="flex gap-3 w-full md:w-auto justify-end">
             <select 
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
               className="text-xs border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-blue-500"
             >
                <option value="Tümü">Tüm Sakin Tipleri</option>
                <option value="Mal Sahibi">Mal Sahibi</option>
                <option value="Kiracı">Kiracı</option>
             </select>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="text-xs border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-blue-500"
             >
                <option value="Tümü">Tüm Aidat Durumları</option>
                <option value="Ödendi">Ödeyenler (Borçsuz)</option>
                <option value="Borçlu">Gecikmede (Borçlu)</option>
             </select>
          </div>
        </div>

        {/* Tablo İçeriği */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Tablo Başlıkları */}
            <thead>
              <tr className="bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold border-b border-[var(--border-light)]">
                <th className="px-6 py-4">Blok / Daire</th>
                <th className="px-6 py-4">Kişi Adı</th>
                <th className="px-6 py-4">Sakin Tipi</th>
                <th className="px-6 py-4">İletişim Bilgileri</th>
                <th className="px-6 py-4">Aidat Durumu</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            
            {/* Tablo Veri Satırları */}
            <tbody className="text-xs text-[var(--text-primary)] divide-y divide-[var(--border-light)]">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-[var(--text-muted)] italic">
                    Kriterlere uygun sakin bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-[var(--bg-subtle)] transition-colors group">
                    
                    {/* Blok/Daire Bilgisi */}
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{resident.unit}</td>
                    
                    {/* Kişi Adı Soyadı */}
                    <td className="px-6 py-4 font-medium">{resident.name}</td>
                    
                    {/* Sakin Tipi */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        resident.type === 'Mal Sahibi' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        <User className="w-3 h-3"/>
                        {resident.type}
                      </span>
                    </td>
                    
                    {/* İletişim İkonları */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-[11px] text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5"><Mail size={12} className="text-[var(--text-muted)]" /> <span>{resident.email}</span></div>
                        <div className="flex items-center gap-1.5"><Phone size={12} className="text-[var(--text-muted)]" /> <span>{resident.phone}</span></div>
                      </div>
                    </td>
                    
                    {/* Aidat Durumu */}
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${resident.status === 'paid' ? 'bg-green-500' : 'bg-red-400'}`} style={{width: resident.status === 'paid' ? '100%' : '50%'}}></div>
                          </div>
                          {resident.status === 'paid' ? (
                            <div className="flex items-center gap-1 text-green-600 font-bold text-[10px]">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span>Ödendi</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 font-bold text-[10px]" title={`${resident.dues} TL Borç`}>
                              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                              <span>{resident.dues} TL</span>
                            </div>
                          )}
                       </div>
                    </td>
                    
                    {/* Satır İşlem Menüsü */}
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditClick(resident)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-blue-600 rounded-lg hover:bg-[var(--bg-page)] transition-colors"
                          title="Düzenle"
                        >
                          <Edit size={14} />
                        </button>
                        {resident.status === 'warning' && (
                          <button 
                            onClick={() => handleReminderClick(resident)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-orange-500 rounded-lg hover:bg-[var(--bg-page)] transition-colors"
                            title="Aidat Hatırlat"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteClick(resident.id, resident.name)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--bg-page)] transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Yeni Sakin Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Yeni Daire Sakini Ekle</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">Bina listesine yeni sakin veya mülk sahibi kaydı tanımlayın.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Adı Soyadı *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ad Soyad"
                    value={newResident.name}
                    onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Daire / Birim *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Blok B / Daire 4"
                    value={newResident.unit}
                    onChange={(e) => setNewResident({ ...newResident, unit: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">E-Posta *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="sakin@example.com"
                    value={newResident.email}
                    onChange={(e) => setNewResident({ ...newResident, email: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Telefon *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="05XX XXX XX XX"
                    value={newResident.phone}
                    onChange={(e) => setNewResident({ ...newResident, phone: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Sakin Tipi</label>
                  <select
                    value={newResident.type}
                    onChange={(e) => setNewResident({ ...newResident, type: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="Kiracı">Kiracı</option>
                    <option value="Mal Sahibi">Mal Sahibi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Aidat Borç Durumu</label>
                  <select
                    value={newResident.status}
                    onChange={(e) => setNewResident({ ...newResident, status: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="paid">Ödendi (Borçsuz)</option>
                    <option value="warning">Borçlu</option>
                  </select>
                </div>
              </div>

              {newResident.status === 'warning' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Mevcut Borç Tutarı (TL)</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="1200"
                    value={newResident.dues}
                    onChange={(e) => setNewResident({ ...newResident, dues: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2"
              >
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Sakin Bilgilerini Düzenleme Modalı */}
      {showEditModal && selectedResident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowEditModal(false); setSelectedResident(null); }}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Sakin Bilgilerini Düzenle</h3>
            <p className="text-xs text-[var(--text-muted)] mb-6">Mevcut sakinin iletişim ve aidat kayıtlarını güncelleyin.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Adı Soyadı *</label>
                  <input 
                    type="text" 
                    required
                    value={selectedResident.name}
                    onChange={(e) => setSelectedResident({ ...selectedResident, name: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Daire / Birim *</label>
                  <input 
                    type="text" 
                    required
                    value={selectedResident.unit}
                    onChange={(e) => setSelectedResident({ ...selectedResident, unit: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">E-Posta *</label>
                  <input 
                    type="email" 
                    required
                    value={selectedResident.email}
                    onChange={(e) => setSelectedResident({ ...selectedResident, email: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Telefon *</label>
                  <input 
                    type="tel" 
                    required
                    value={selectedResident.phone}
                    onChange={(e) => setSelectedResident({ ...selectedResident, phone: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Sakin Tipi</label>
                  <select
                    value={selectedResident.type}
                    onChange={(e) => setSelectedResident({ ...selectedResident, type: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="Kiracı">Kiracı</option>
                    <option value="Mal Sahibi">Mal Sahibi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Aidat Borç Durumu</label>
                  <select
                    value={selectedResident.status}
                    onChange={(e) => setSelectedResident({ 
                      ...selectedResident, 
                      status: e.target.value, 
                      dues: e.target.value === 'paid' ? 0 : (selectedResident.dues || 1200) 
                    })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  >
                    <option value="paid">Ödendi (Borçsuz)</option>
                    <option value="warning">Borçlu</option>
                  </select>
                </div>
              </div>

              {selectedResident.status === 'warning' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Borç Tutarı (TL)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={selectedResident.dues}
                    onChange={(e) => setSelectedResident({ ...selectedResident, dues: e.target.value })}
                    className="w-full text-sm border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-blue-500 bg-[var(--bg-page)] text-[var(--text-primary)]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2"
              >
                Değişiklikleri Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
