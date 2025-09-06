import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { supabase, FAQ } from '@/lib/supabase';

interface FAQChatbotProps {
  variant?: 'floating' | 'embedded';
}

export default function FAQChatbot({ variant = 'floating' }: FAQChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot', content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      const filtered = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchTerm, faqs]);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching FAQs:', error);
        return;
      }

      setFaqs(data || []);
      setFilteredFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFAQ = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputMessage('');

    // Simular resposta do bot baseada nas FAQs
    setTimeout(() => {
      const matchingFaq = faqs.find(faq =>
        faq.question.toLowerCase().includes(userMessage.toLowerCase()) ||
        userMessage.toLowerCase().includes(faq.question.toLowerCase().split(' ')[0])
      );

      let botResponse = '';
      if (matchingFaq) {
        botResponse = matchingFaq.answer;
      } else {
        botResponse = 'Desculpe, não encontrei uma resposta específica para sua pergunta. Entre em contato conosco pelo WhatsApp para um atendimento personalizado: (82) 9 9999-9999';
      }

      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (variant === 'embedded') {
    return (
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre nossos serviços
            </p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar perguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-6 bg-slate-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 bg-slate-200 animate-pulse rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-blue-900">{category}</h3>
                  </div>
                  
                  <div className="divide-y divide-slate-200">
                    {categoryFaqs.map((faq) => (
                      <div key={faq.id} className="p-6">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full text-left flex items-center justify-between group"
                        >
                          <h4 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                            {faq.question}
                          </h4>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                          )}
                        </button>
                        
                        {expandedFaq === faq.id && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFaqs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhuma pergunta encontrada</h3>
              <p className="text-slate-600">Tente usar outros termos de busca ou entre em contato conosco.</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Assistente JAMAAW</h3>
                <p className="text-sm opacity-90">Como posso ajudar?</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setChatMode(false)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                  !chatMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setChatMode(true)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                  chatMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chat
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {chatMode ? (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                      <Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Olá! Como posso ajudar você hoje?</p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua pergunta..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-3">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="bg-slate-100 animate-pulse rounded-lg h-12"></div>
                    ))
                  ) : (
                    faqs.slice(0, 8).map((faq) => (
                      <button
                        key={faq.id}
                        onClick={() => {
                          setChatMode(true);
                          setMessages([
                            { type: 'user', content: faq.question },
                            { type: 'bot', content: faq.answer }
                          ]);
                        }}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                      >
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{faq.question}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

