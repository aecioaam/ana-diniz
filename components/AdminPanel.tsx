
import React, { useState } from 'react';
import { Product, Neighborhood, Category, ProductOption } from '../types';
import { Plus, Trash2, Package, Truck, Layers, Settings, LogOut, Pencil, Check, X, Phone, ListTree, ShieldCheck } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  neighborhoods: Neighborhood[];
  categories: Category[];
  whatsappNumber: string;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateNeighborhoods: (neighborhoods: Neighborhood[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateWhatsAppNumber: (number: string) => void;
  onUpdateAdminPassword: (password: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  neighborhoods, 
  categories,
  whatsappNumber,
  onUpdateProducts, 
  onUpdateNeighborhoods,
  onUpdateCategories,
  onUpdateWhatsAppNumber,
  onUpdateAdminPassword
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'delivery' | 'categories' | 'settings'>('products');
  
  // Estados para Produtos
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', description: '', price: 0, category: '', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400', options: []
  });

  // Estados para Variações (no cadastro de produto)
  const [tempOptionName, setTempOptionName] = useState('');
  const [tempOptionPrice, setTempOptionPrice] = useState<number | ''>('');

  // Estados para Categorias
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Estados para Bairros
  const [newNeighborhood, setNewNeighborhood] = useState({ name: '', fee: 0 });

  // Estados para Configurações
  const [tempWhatsApp, setTempWhatsApp] = useState(whatsappNumber);
  const [newPassword, setNewPassword] = useState('');

  // Lógica de Produtos
  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Preencha nome, preço e categoria!");
      return;
    }

    const productData = { 
      ...newProduct, 
      id: editingProductId || Date.now().toString() 
    } as Product;

    if (editingProductId) {
      onUpdateProducts(products.map(p => p.id === editingProductId ? productData : p));
      setEditingProductId(null);
      alert("Produto atualizado!");
    } else {
      onUpdateProducts([productData, ...products]);
      alert("Produto adicionado!");
    }

    setNewProduct({ 
      name: '', description: '', price: 0, category: '', 
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400',
      options: []
    });
  };

  const handleAddOption = () => {
    if (!tempOptionName.trim()) return;
    const currentOptions = newProduct.options || [];
    setNewProduct({
      ...newProduct,
      options: [...currentOptions, { 
        name: tempOptionName.trim(), 
        price: tempOptionPrice === '' ? undefined : tempOptionPrice 
      }]
    });
    setTempOptionName('');
    setTempOptionPrice('');
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = [...(newProduct.options || [])];
    currentOptions.splice(index, 1);
    setNewProduct({ ...newProduct, options: currentOptions });
  };

  const startEditProduct = (product: Product) => {
    setNewProduct({ ...product, options: product.options || [] });
    setEditingProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setNewProduct({ 
      name: '', description: '', price: 0, category: '', 
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400',
      options: []
    });
  };

  // Lógica de Categorias
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onUpdateCategories([...categories, { id: Date.now().toString(), name: newCategoryName.trim() }]);
    setNewCategoryName('');
  };

  const handleRenameCategory = (id: string) => {
    const oldCategory = categories.find(c => c.id === id);
    if (!oldCategory || !editingCategoryName.trim()) return;
    const newName = editingCategoryName.trim();
    onUpdateCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
    onUpdateProducts(products.map(p => p.category === oldCategory.name ? { ...p, category: newName } : p));
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 4) {
      alert("A senha deve ter pelo menos 4 caracteres!");
      return;
    }
    onUpdateAdminPassword(newPassword);
    setNewPassword('');
    alert("Senha administrativa alterada com sucesso!");
  };

  const handleExit = () => {
    window.location.hash = '';
    // Força o reload para garantir que o estado isAdmin seja limpo no App.tsx
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FDF4F4] flex flex-col font-sans">
      <header className="bg-white p-6 shadow-md flex justify-between items-center rounded-b-[3rem] sticky top-0 z-50">
        <h1 className="text-xl font-black text-[#5D4037] flex items-center gap-3">
          <div className="bg-[#FDF4F4] p-2 rounded-2xl text-[#D4A3A3]"><Settings size={22} /></div>
          Painel de Gestão
        </h1>
        <button onClick={handleExit} className="p-3 bg-red-50 text-red-500 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition">
          <LogOut size={18} /> Sair
        </button>
      </header>

      <nav className="p-6 flex gap-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'products', icon: Package, label: 'Produtos' },
          { id: 'categories', icon: Layers, label: 'Categorias' },
          { id: 'delivery', icon: Truck, label: 'Bairros' },
          { id: 'settings', icon: Settings, label: 'Geral' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-sm ${activeTab === tab.id ? 'bg-[#5D4037] text-white' : 'bg-white text-[#5D4037] border border-[#F2E4E4]'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 pb-24 space-y-8 max-w-4xl mx-auto w-full">
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 transition-all ${editingProductId ? 'border-[#D4A3A3]' : 'border-[#F2E4E4]'} space-y-6`}>
              <h2 className="text-xs font-black text-[#8C6B6B] uppercase tracking-[0.2em] border-b border-[#FDF4F4] pb-4 flex justify-between items-center">
                {editingProductId ? 'Editando Produto' : 'Cadastrar Novo Produto'}
                {editingProductId && <button onClick={cancelEditProduct} className="text-[#D4A3A3]"><X size={18}/></button>}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8C6B6B] ml-1">Nome do Produto</label>
                  <input placeholder="Ex: Brownie de Ninho" className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none focus:border-[#D4A3A3]" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8C6B6B] ml-1">Categoria</label>
                  <select className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none focus:border-[#D4A3A3]" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option value="">Escolha...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8C6B6B] ml-1">Preço Base (R$)</label>
                  <input type="number" placeholder="0,00" className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4]" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#8C6B6B] ml-1">Link da Imagem</label>
                  <input placeholder="https://..." className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4]" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#8C6B6B] ml-1">Descrição</label>
                <textarea placeholder="Ingredientes e detalhes..." className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] h-24 outline-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              </div>

              {/* Seção de Variações */}
              <div className="p-6 bg-[#FDF4F4] rounded-[2rem] border border-[#F2E4E4] space-y-4">
                <h3 className="text-[10px] font-black text-[#5D4037] uppercase tracking-widest flex items-center gap-2">
                  <ListTree size={16} className="text-[#D4A3A3]" /> Opções / Variações (Sabores, Recheios...)
                </h3>
                
                <div className="flex gap-3">
                  <input placeholder="Nome da Opção" className="flex-[2] p-3 bg-white rounded-xl border border-[#F2E4E4] outline-none text-sm" value={tempOptionName} onChange={e => setTempOptionName(e.target.value)} />
                  <input type="number" placeholder="Preço Diferente? (Opcional)" className="flex-[1] p-3 bg-white rounded-xl border border-[#F2E4E4] outline-none text-sm" value={tempOptionPrice} onChange={e => setTempOptionPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                  <button onClick={handleAddOption} className="bg-[#D4A3A3] text-white p-3 rounded-xl shadow-md active:scale-95 transition"><Plus size={20}/></button>
                </div>

                <div className="space-y-2">
                  {newProduct.options?.map((opt, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#F2E4E4] animate-in slide-in-from-left-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#5D4037] text-sm">{opt.name}</span>
                        {opt.price && <span className="text-[10px] bg-[#D4A3A3]/10 text-[#D4A3A3] px-2 py-0.5 rounded-full font-black">R$ {opt.price.toFixed(2)}</span>}
                      </div>
                      <button onClick={() => handleRemoveOption(i)} className="text-red-300 hover:text-red-500"><X size={18}/></button>
                    </div>
                  ))}
                  {(!newProduct.options || newProduct.options.length === 0) && (
                    <p className="text-[10px] text-gray-400 italic text-center py-2">Nenhuma variação adicionada.</p>
                  )}
                </div>
              </div>
              
              <button onClick={handleSaveProduct} className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg active:scale-95 transition flex items-center justify-center gap-3 ${editingProductId ? 'bg-[#5D4037] text-white' : 'bg-[#D4A3A3] text-white'}`}>
                {editingProductId ? <><Pencil size={20} /> Atualizar Produto</> : <><Plus size={20} /> Salvar Produto</>}
              </button>
            </div>

            <div className="grid gap-4">
              <h3 className="text-xs font-black text-[#8C6B6B] uppercase tracking-[0.2em] px-2">Produtos Atuais ({products.length})</h3>
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-[#F2E4E4] flex items-center gap-4 group">
                  <img src={p.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-inner" alt={p.name} />
                  <div className="flex-1">
                    <h4 className="font-black text-[#5D4037] text-sm">{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] bg-[#FDF4F4] text-[#D4A3A3] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{p.category}</span>
                      {p.options && p.options.length > 0 && <span className="text-[8px] text-[#8C6B6B] font-bold">({p.options.length} variações)</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditProduct(p)} className="p-2 text-blue-300 hover:text-blue-500 transition"><Pencil size={18} /></button>
                    <button onClick={() => { if(confirm('Excluir produto?')) onUpdateProducts(products.filter(item => item.id !== p.id)) }} className="p-2 text-red-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2E4E4] space-y-6">
              <h2 className="text-xs font-black text-[#8C6B6B] uppercase tracking-[0.2em]">Nova Categoria</h2>
              <div className="flex gap-3">
                <input placeholder="Ex: Bebidas" className="flex-1 p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                <button onClick={handleAddCategory} className="bg-[#5D4037] text-white px-8 rounded-2xl font-black shadow-lg hover:bg-[#4A322C] transition">Criar</button>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-[#F2E4E4] divide-y divide-[#FDF4F4] overflow-hidden shadow-sm">
              {categories.map(c => (
                <div key={c.id} className="p-5 flex justify-between items-center group bg-white">
                  {editingCategoryId === c.id ? (
                    <div className="flex-1 flex gap-2">
                      <input autoFocus className="flex-1 p-2 bg-[#FDF4F4] rounded-xl border-2 border-[#D4A3A3] outline-none font-black text-[#5D4037]" value={editingCategoryName} onChange={e => setEditingCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRenameCategory(c.id)} />
                      <button onClick={() => handleRenameCategory(c.id)} className="p-2 bg-green-50 text-green-500 rounded-xl"><Check size={20}/></button>
                      <button onClick={() => setEditingCategoryId(null)} className="p-2 bg-gray-50 text-gray-400 rounded-xl"><X size={20}/></button>
                    </div>
                  ) : (
                    <>
                      <span className="font-black text-[#5D4037]">{c.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingCategoryId(c.id); setEditingCategoryName(c.name); }} className="text-blue-300 hover:text-blue-500 p-2"><Pencil size={18} /></button>
                        <button onClick={() => { if(confirm(`Excluir categoria "${c.name}"?`)) onUpdateCategories(categories.filter(item => item.id !== c.id)) }} className="text-red-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2E4E4] space-y-6">
              <h2 className="text-xs font-black text-[#8C6B6B] uppercase tracking-[0.2em]">Configurar Bairros</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Nome do Bairro" className="p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none" value={newNeighborhood.name} onChange={e => setNewNeighborhood({...newNeighborhood, name: e.target.value})} />
                <input type="number" placeholder="Taxa de Entrega (R$)" className="p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none" value={newNeighborhood.fee || ''} onChange={e => setNewNeighborhood({...newNeighborhood, fee: parseFloat(e.target.value)})} />
              </div>
              <button onClick={() => { if(!newNeighborhood.name) return; onUpdateNeighborhoods([...neighborhoods, {...newNeighborhood, id: Date.now().toString()}]); setNewNeighborhood({name: '', fee: 0}) }} className="w-full bg-[#5D4037] text-white py-5 rounded-[1.5rem] font-black shadow-lg hover:bg-[#4A322C] transition">Adicionar Bairro</button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-[#F2E4E4] divide-y divide-[#FDF4F4] shadow-sm overflow-hidden">
              {neighborhoods.map(n => (
                <div key={n.id} className="p-5 flex justify-between items-center group">
                  <div><p className="font-black text-[#5D4037]">{n.name}</p><p className="text-xs text-[#D4A3A3] font-black uppercase tracking-tighter">Taxa: R$ {n.fee.toFixed(2)}</p></div>
                  <button onClick={() => onUpdateNeighborhoods(neighborhoods.filter(item => item.id !== n.id))} className="text-red-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2E4E4] space-y-6">
              <h2 className="text-xs font-black text-[#8C6B6B] uppercase tracking-[0.2em] flex items-center gap-2">
                <Phone size={14} className="text-[#D4A3A3]" /> Configuração de WhatsApp
              </h2>
              <div className="space-y-4">
                <input placeholder="Ex: 5531998725041" className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none focus:border-[#D4A3A3] font-black text-[#5D4037]" value={tempWhatsApp} onChange={e => setTempWhatsApp(e.target.value)} />
                <button onClick={() => { onUpdateWhatsAppNumber(tempWhatsApp); alert("WhatsApp atualizado!"); }} className="w-full bg-[#D4A3A3] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg active:scale-95 transition">Atualizar WhatsApp</button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2E4E4] space-y-6">
              <h2 className="text-xs font-black text-[#8C6B6B] uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#D4A3A3]" /> Segurança do Painel
              </h2>
              <p className="text-sm text-[#8C6B6B] italic font-medium leading-relaxed">Altere a senha de acesso à área administrativa para garantir que apenas pessoas autorizadas façam mudanças.</p>
              <div className="space-y-4">
                <input type="password" placeholder="Nova Senha" className="w-full p-4 bg-[#FDF4F4] rounded-2xl border-2 border-[#F2E4E4] outline-none focus:border-[#D4A3A3] font-black text-[#5D4037]" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button onClick={handleUpdatePassword} className="w-full bg-[#5D4037] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg active:scale-95 transition">Alterar Senha</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
