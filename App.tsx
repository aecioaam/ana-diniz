import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  ChevronRight, 
  ChevronLeft, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  Send, 
  Plus,
  Minus,
  Clock,
  CheckCircle2,
  Lock,
  User,
  X,
  ChevronDown,
  Key,
  Banknote,
  Store,
  Bike
} from 'lucide-react';
import { Product, CartItem, OrderDetails, Neighborhood, PaymentMethod, Category, ProductOption } from './types';
import { 
  getStoredProducts, 
  saveProducts, 
  getStoredNeighborhoods, 
  saveNeighborhoods,
  getStoredCategories,
  saveCategories,
  getStoredWhatsAppNumber,
  saveWhatsAppNumber,
  getStoredAdminPassword,
  saveAdminPassword
} from './services/storage';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [storedAdminPassword, setStoredAdminPassword] = useState('dev123');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);
  const [isOrdered, setIsOrdered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);

  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: '',
    type: 'entrega',
    paymentMethod: 'pix',
    customMessage: '',
    street: '',
    number: '',
    reference: '',
    changeFor: undefined
  });

  useEffect(() => {
    setProducts(getStoredProducts());
    setNeighborhoods(getStoredNeighborhoods());
    setCategories(getStoredCategories());
    setWhatsappNumber(getStoredWhatsAppNumber());
    setStoredAdminPassword(getStoredAdminPassword());

    // Recuperar carrinho do storage se houver
    const savedCart = localStorage.getItem('ana_diniz_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('ana_diniz_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const categoryNames = useMemo(() => {
    return ['Todas', ...categories.map(c => c.name)];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return activeCategory === 'Todas' 
      ? products 
      : products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleAddToCart = (product: Product, option?: ProductOption) => {
    const finalPrice = option?.price ?? product.price;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        (item.selectedOption?.name === option?.name)
      );
      
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { ...product, price: finalPrice, quantity: 1, selectedOption: option }];
    });
    setSelectedProductForOptions(null);
  };

  const updateQuantity = (id: string, optionName: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedOption?.name === optionName) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = orderDetails.type === 'entrega' && orderDetails.neighborhoodId
    ? (neighborhoods.find(n => n.id === orderDetails.neighborhoodId)?.fee || 0)
    : 0;
  const total = subtotal + deliveryFee;

  const handleTryLogin = () => {
    if (adminPasswordInput === storedAdminPassword) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPasswordInput('');
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleFinalize = () => {
    const neighborhood = neighborhoods.find(n => n.id === orderDetails.neighborhoodId);
    let msg = `*🍰 NOVO PEDIDO - ANA DINIZ DOCERIA*\n\n`;
    msg += `*Cliente:* ${orderDetails.customerName}\n\n`;
    msg += `*Itens:*\n`;
    cart.forEach(item => {
      const optionStr = item.selectedOption ? ` (${item.selectedOption.name})` : '';
      msg += `• ${item.quantity}x ${item.name}${optionStr} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
    });
    msg += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    if (orderDetails.type === 'entrega') {
      msg += `*Tipo:* Entrega 🛵\n*Bairro:* ${neighborhood?.name || 'Não informado'}\n*Endereço:* ${orderDetails.street}, Nº ${orderDetails.number}\n`;
      if (orderDetails.reference) msg += `*Referência:* ${orderDetails.reference}\n`;
      msg += `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n`;
    } else {
      msg += `*Tipo:* Retirada 🏪\n`;
    }
    msg += `\n*Pagamento:* ${orderDetails.paymentMethod.toUpperCase()}\n`;
    if (orderDetails.paymentMethod === 'dinheiro' && orderDetails.changeFor) {
      msg += `*Troco para:* R$ ${orderDetails.changeFor.toFixed(2)}\n`;
    }
    if (orderDetails.customMessage) msg += `\n*Observação:* ${orderDetails.customMessage}\n`;
    msg += `\n*TOTAL:* R$ ${total.toFixed(2)}\n`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    setIsOrdered(true);
    setCart([]);
  };

  if (isAdmin) {
    return (
      <AdminPanel 
        products={products}
        neighborhoods={neighborhoods}
        categories={categories}
        whatsappNumber={whatsappNumber}
        onUpdateProducts={(p) => { setProducts(p); saveProducts(p); }}
        onUpdateNeighborhoods={(n) => { setNeighborhoods(n); saveNeighborhoods(n); }}
        onUpdateCategories={(c) => { setCategories(c); saveCategories(c); }}
        onUpdateWhatsAppNumber={(n) => { setWhatsappNumber(n); saveWhatsAppNumber(n); }}
        onUpdateAdminPassword={(p) => { setStoredAdminPassword(p); saveAdminPassword(p); }}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#FDF4F4] shadow-2xl flex flex-col font-sans relative">
      {/* Header Premium */}
      <header className="bg-white/80 backdrop-blur-md p-6 sticky top-0 z-50 flex justify-between items-center rounded-b-[2rem] shadow-sm border-b border-[#F2E4E4]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D4A3A3] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#5D4037] tracking-tight">Ana Diniz</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Loja Aberta</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAdminLogin(true)} 
            className="p-3 text-[#D4A3A3] hover:bg-[#FDF4F4] rounded-2xl transition-colors"
          >
            <Lock size={20} />
          </button>
        </div>
      </header>

      {/* Progress Stepper */}
      {!isOrdered && (
        <div className="px-6 pt-6 flex items-center justify-between">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step === s ? 'bg-[#5D4037] text-white scale-110 shadow-md' : step > s ? 'bg-[#D4A3A3] text-white' : 'bg-white text-[#D4A3A3] border border-[#F2E4E4]'}`}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 4 && <div className={`h-[2px] flex-1 mx-2 rounded-full transition-all duration-500 ${step > s ? 'bg-[#D4A3A3]' : 'bg-[#F2E4E4]'}`} />}
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 pb-32">
        {isOrdered ? (
          <div className="p-12 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white">
              <CheckCircle2 size={64} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#5D4037]">Pedido Realizado!</h2>
              <p className="text-[#8C6B6B] font-medium leading-relaxed">Sua solicitação foi enviada para o nosso WhatsApp. Agora é só aguardar a nossa confirmação!</p>
            </div>
            <button 
              onClick={() => { setIsOrdered(false); setStep(1); }} 
              className="w-full py-5 bg-[#D4A3A3] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Fazer outro pedido
            </button>
          </div>
        ) : (
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Categorias */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2 sticky top-[88px] z-40 bg-[#FDF4F4]/80 backdrop-blur-sm">
                  {categoryNames.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-wider ${activeCategory === cat ? 'bg-[#5D4037] text-white shadow-lg' : 'bg-white text-[#8C6B6B] border border-[#F2E4E4]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid de Produtos */}
                <div className="grid gap-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      onClick={() => product.options ? setSelectedProductForOptions(product) : handleAddToCart(product)}
                      className="flex gap-4 p-4 bg-white rounded-[2.5rem] border border-[#F2E4E4] shadow-sm active:scale-95 transition-all group relative overflow-hidden"
                    >
                      <img src={product.image} className="w-24 h-24 rounded-[2rem] object-cover flex-shrink-0 shadow-sm" alt={product.name} />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-extrabold text-[#5D4037] text-sm group-hover:text-[#D4A3A3] transition-colors">{product.name}</h3>
                          <p className="text-[10px] text-[#8C6B6B] line-clamp-2 mt-1 font-medium leading-relaxed italic">{product.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-[#D4A3A3] font-black text-sm">R$ {product.price.toFixed(2)}</span>
                          <div className="bg-[#FDF4F4] p-2 rounded-xl text-[#D4A3A3]">
                            {product.options ? <ChevronRight size={18} /> : <Plus size={18} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 px-2">
                  <div className="bg-[#D4A3A3] p-2 rounded-xl"><ShoppingCart className="text-white" size={20} /></div>
                  <h2 className="text-xl font-black text-[#5D4037]">Seu Carrinho</h2>
                </div>
                
                {cart.length === 0 ? (
                  <div className="bg-white p-12 rounded-[3rem] text-center space-y-4 border border-[#F2E4E4]">
                    <p className="text-[#8C6B6B] font-bold">Opa! Seu carrinho está vazio.</p>
                    <button onClick={() => setStep(1)} className="text-[#D4A3A3] font-black uppercase text-xs tracking-widest">Voltar ao cardápio</button>
                  </div>
                ) : (
                  <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-[#F2E4E4] space-y-6">
                    {cart.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex justify-between items-center pb-6 border-b border-[#FDF4F4] last:border-0 last:pb-0">
                        <div className="flex-1 pr-4">
                          <p className="font-black text-[#5D4037] text-sm">{item.name}</p>
                          {item.selectedOption && <p className="text-[10px] text-[#D4A3A3] font-black uppercase tracking-widest mt-0.5">• {item.selectedOption.name}</p>}
                          <p className="text-xs font-bold text-[#8C6B6B] mt-1">R$ {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-[#FDF4F4] px-4 py-2.5 rounded-2xl border border-[#F2E4E4]">
                          <button onClick={() => updateQuantity(item.id, item.selectedOption?.name, -1)} className="text-[#D4A3A3] transition-transform active:scale-125"><Minus size={16}/></button>
                          <span className="font-black text-[#5D4037] text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.selectedOption?.name, 1)} className="text-[#D4A3A3] transition-transform active:scale-125"><Plus size={16}/></button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 space-y-2">
                       <label className="text-[10px] font-black text-[#8C6B6B] uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <MessageSquare size={14} className="text-[#D4A3A3]" /> Alguma observação?
                      </label>
                      <textarea 
                        className="w-full bg-[#FDF4F4] border border-[#F2E4E4] rounded-[1.5rem] p-5 text-sm outline-none focus:ring-2 focus:ring-[#D4A3A3]/20 min-h-[100px] shadow-inner"
                        placeholder="Ex: Sem cebola, colocar em embalagem de presente..."
                        value={orderDetails.customMessage}
                        onChange={e => setOrderDetails({...orderDetails, customMessage: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <section className="space-y-4">
                  <h2 className="text-xl font-black text-[#5D4037] flex items-center gap-3 px-2"><User className="text-[#D4A3A3]" size={22} /> Identificação</h2>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#F2E4E4]">
                    <input 
                      type="text" 
                      placeholder="Qual o seu nome? *" 
                      className="w-full bg-[#FDF4F4] border border-[#F2E4E4] p-5 rounded-2xl text-base font-bold text-[#5D4037] outline-none focus:ring-2 focus:ring-[#D4A3A3]/20 shadow-inner" 
                      value={orderDetails.customerName} 
                      onChange={e => setOrderDetails({...orderDetails, customerName: e.target.value})} 
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-black text-[#5D4037] flex items-center gap-3 px-2"><MapPin className="text-[#D4A3A3]" size={22} /> Como deseja receber?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setOrderDetails({...orderDetails, type: 'entrega'})} 
                      className={`py-5 rounded-[2rem] border-2 font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${orderDetails.type === 'entrega' ? 'border-[#D4A3A3] bg-[#FDF4F4] text-[#D4A3A3] shadow-inner' : 'border-white bg-white text-gray-300 shadow-sm'}`}
                    >
                      <Bike size={20} /> Entrega
                    </button>
                    <button 
                      onClick={() => setOrderDetails({...orderDetails, type: 'retirada'})} 
                      className={`py-5 rounded-[2rem] border-2 font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${orderDetails.type === 'retirada' ? 'border-[#D4A3A3] bg-[#FDF4F4] text-[#D4A3A3] shadow-inner' : 'border-white bg-white text-gray-300 shadow-sm'}`}
                    >
                      <Store size={20} /> Retirada
                    </button>
                  </div>

                  {orderDetails.type === 'entrega' && (
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#F2E4E4] space-y-4 animate-in slide-in-from-top duration-500">
                      <div className="relative">
                        <select 
                          className="w-full bg-[#FDF4F4] border border-[#F2E4E4] p-5 rounded-2xl text-base font-bold text-[#5D4037] appearance-none shadow-inner" 
                          value={orderDetails.neighborhoodId || ''} 
                          onChange={e => setOrderDetails({...orderDetails, neighborhoodId: e.target.value})}
                        >
                          <option value="">Selecione seu bairro *</option>
                          {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name} (+ R$ {n.fee.toFixed(2)})</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#D4A3A3]" size={20} />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <input type="text" placeholder="Rua *" className="col-span-3 bg-[#FDF4F4] border border-[#F2E4E4] p-5 rounded-2xl font-bold shadow-inner outline-none" value={orderDetails.street || ''} onChange={e => setOrderDetails({...orderDetails, street: e.target.value})} />
                        <input type="text" placeholder="Nº *" className="col-span-1 bg-[#FDF4F4] border border-[#F2E4E4] p-5 rounded-2xl font-bold shadow-inner outline-none" value={orderDetails.number || ''} onChange={e => setOrderDetails({...orderDetails, number: e.target.value})} />
                      </div>
                      <input type="text" placeholder="Referência (ex: perto da padaria)" className="w-full bg-[#FDF4F4] border border-[#F2E4E4] p-5 rounded-2xl font-bold shadow-inner outline-none" value={orderDetails.reference || ''} onChange={e => setOrderDetails({...orderDetails, reference: e.target.value})} />
                    </div>
                  )}
                </section>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <section className="space-y-4">
                  <h2 className="text-xl font-black text-[#5D4037] px-2">Resumo do Pedido</h2>
                  <div className="bg-[#5D4037] text-white p-8 rounded-[3.5rem] shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="space-y-4 relative z-10">
                      {cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex justify-between items-start text-sm border-b border-white/10 pb-4 last:border-0 last:pb-0">
                          <span className="font-bold pr-4">{item.quantity}x {item.name} {item.selectedOption && `(${item.selectedOption.name})`}</span>
                          <span className="font-black text-[#D4A3A3] whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-white/20 space-y-3 relative z-10">
                      <div className="flex justify-between text-xs opacity-70 uppercase tracking-widest font-black"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                      {orderDetails.type === 'entrega' && (
                        <div className="flex justify-between text-xs opacity-70 uppercase tracking-widest font-black"><span>Taxa</span><span>R$ {deliveryFee.toFixed(2)}</span></div>
                      )}
                      <div className="flex justify-between text-3xl font-black pt-4 text-[#D4A3A3]"><span>TOTAL</span><span>R$ {total.toFixed(2)}</span></div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-black text-[#5D4037] flex items-center gap-3 px-2"><CreditCard className="text-[#D4A3A3]" size={22} /> Pagamento</h2>
                  <div className="grid gap-3">
                    {(['pix', 'dinheiro', 'cartao'] as PaymentMethod[]).map(m => (
                      <div key={m} className="space-y-3">
                        <button 
                          onClick={() => setOrderDetails({...orderDetails, paymentMethod: m})} 
                          className={`w-full p-5 rounded-[2rem] border-2 font-black text-sm flex items-center justify-between transition-all ${orderDetails.paymentMethod === m ? 'border-[#D4A3A3] bg-white text-[#5D4037] shadow-md' : 'border-white bg-white text-gray-300'}`}
                        >
                          <span className="capitalize">{m === 'cartao' ? 'Cartão' : m}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${orderDetails.paymentMethod === m ? 'border-[#D4A3A3]' : 'border-gray-100'}`}>
                            {orderDetails.paymentMethod === m && <div className="w-3 h-3 rounded-full bg-[#D4A3A3] shadow-sm" />}
                          </div>
                        </button>
                        {m === 'dinheiro' && orderDetails.paymentMethod === 'dinheiro' && (
                          <div className="bg-white p-6 rounded-[2.5rem] border border-[#F2E4E4] space-y-4 animate-in slide-in-from-top duration-300 shadow-sm">
                            <label className="text-[10px] font-black text-[#8C6B6B] uppercase tracking-widest flex items-center gap-2">
                              <Banknote size={16} className="text-[#D4A3A3]" /> Troco para quanto?
                            </label>
                            <input 
                              type="number" 
                              placeholder="0,00" 
                              className="w-full bg-[#FDF4F4] border border-[#F2E4E4] p-4 rounded-xl text-lg font-black text-[#5D4037] outline-none shadow-inner"
                              value={orderDetails.changeFor || ''}
                              onChange={e => setOrderDetails({...orderDetails, changeFor: parseFloat(e.target.value)})}
                            />
                            <p className="text-[10px] text-gray-400 italic font-medium">Deixe em branco se não precisar de troco.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Fixo */}
      {!isOrdered && (
        <footer className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto p-4 bg-white/90 backdrop-blur-xl border-t border-[#F2E4E4] z-[55] rounded-t-[3rem] shadow-2xl safe-bottom">
          <div className="flex gap-4">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)} 
                className="p-4 bg-[#FDF4F4] text-[#5D4037] rounded-3xl border border-[#F2E4E4] active:scale-90 transition-transform"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <button 
              disabled={
                (step === 1 && cart.length === 0) || 
                (step === 2 && cart.length === 0) ||
                (step === 3 && (!orderDetails.customerName || (orderDetails.type === 'entrega' && (!orderDetails.neighborhoodId || !orderDetails.street || !orderDetails.number))))
              }
              onClick={() => step < 4 ? setStep(s => s + 1) : handleFinalize()}
              className={`flex-1 font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-[11px] transition-all active:scale-95 disabled:opacity-30 ${step === 4 ? 'bg-[#5D4037] text-white' : 'bg-[#D4A3A3] text-white hover:bg-[#C28E8E]'}`}
            >
              {step === 4 ? <><Send size={18} /> Finalizar Pedido</> : <>Próximo Passo <ChevronRight size={18} /></>}
            </button>
          </div>
        </footer>
      )}

      {/* Modal de Variações */}
      {selectedProductForOptions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-t-[3.5rem] p-8 space-y-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-[#5D4037]">{selectedProductForOptions.name}</h3>
                <p className="text-sm font-medium text-[#8C6B6B] mt-1 italic">Escolha sua variação favorita:</p>
              </div>
              <button onClick={() => setSelectedProductForOptions(null)} className="p-3 bg-[#FDF4F4] rounded-full text-[#D4A3A3]"><X size={24}/></button>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
              {selectedProductForOptions.options?.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAddToCart(selectedProductForOptions, opt)} 
                  className="w-full p-6 bg-[#FDF4F4] rounded-[2rem] border border-[#F2E4E4] hover:border-[#D4A3A3] transition-all flex justify-between items-center group active:scale-[0.98]"
                >
                  <span className="font-black text-[#5D4037] text-sm group-hover:text-[#D4A3A3]">{opt.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#D4A3A3] text-sm">R$ {(opt.price ?? selectedProductForOptions.price).toFixed(2)}</span>
                    <Plus size={18} className="text-[#D4A3A3]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Admin Login */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#5D4037]/90 backdrop-blur-md p-6">
          <div className="w-full max-w-xs bg-white rounded-[3.5rem] p-10 space-y-10 shadow-2xl animate-in zoom-in duration-300 border-b-8 border-[#D4A3A3]">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-[#FDF4F4] text-[#D4A3A3] rounded-[2rem] flex items-center justify-center mx-auto shadow-inner transform rotate-12"><Key size={36} /></div>
              <h2 className="text-2xl font-black text-[#5D4037]">Acesso Restrito</h2>
              <p className="text-xs text-[#8C6B6B] font-bold uppercase tracking-widest">Painel Administrativo</p>
            </div>
            <div className="space-y-6">
              <input 
                type="password" 
                placeholder="Senha" 
                autoFocus
                className="w-full bg-[#FDF4F4] border-2 border-[#F2E4E4] p-5 rounded-[2rem] text-center text-xl font-black focus:border-[#D4A3A3] outline-none transition-all shadow-inner"
                value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTryLogin()}
              />
              <div className="flex flex-col gap-3">
                <button onClick={handleTryLogin} className="w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-white bg-[#5D4037] shadow-xl active:scale-95 transition-all">Entrar</button>
                <button onClick={() => { setShowAdminLogin(false); setAdminPasswordInput(''); }} className="text-[#8C6B6B] font-black text-[10px] uppercase tracking-widest py-2">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;