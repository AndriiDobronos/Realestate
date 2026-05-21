import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAppSelector } from '../app/hooks';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
    read: boolean;
}

interface ChatPreview {
    _id: string;
    buyerName: string;
    buyerId: string;
    messages: Message[];
    updatedAt: string;
}

const ChatPage = () => {
    const { listingId } = useParams<{ listingId: string }>();
    const [searchParams] = useSearchParams();
    const chatIdFromUrl = searchParams.get('chatId');
    const navigate = useNavigate();

    const { userId, userName } = useAppSelector(s => s.registration);
    const { isLogin } = useAppSelector(s => s.auth);
    const { language } = useLanguage();
    const c = (language === 'en' ? allEnTexts : allUaTexts).chat;

    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [sellerChats, setSellerChats] = useState<ChatPreview[]>([]);
    const [isSeller, setIsSeller] = useState(false);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLogin) navigate('/login');
    }, [isLogin, navigate]);

    // Init: визначаємо роль та отримуємо чат
    useEffect(() => {
        if (!listingId || !userId || !isLogin) return;

        const init = async () => {
            try {
                const { data: listing } = await axios.get(`${API_URL}/listing/${listingId}`);
                const ownerId: string = listing.ownerId;
                const isOwner = userId === ownerId;
                setIsSeller(isOwner);

                if (isOwner) {
                    if (chatIdFromUrl) {
                        const { data } = await axios.get(`${API_URL}/api/chat/${chatIdFromUrl}`, { withCredentials: true });
                        setMessages(data.messages);
                        setChatId(chatIdFromUrl);
                    } else {
                        const { data } = await axios.get(`${API_URL}/api/chat/listing/${listingId}`, { withCredentials: true });
                        setSellerChats(data);
                    }
                } else {
                    console.log('[Chat init]', { listingId, buyerId: userId, buyerName: userName, sellerId: ownerId });
                    const { data } = await axios.post(`${API_URL}/api/chat/init`, {
                        listingId,
                        buyerId: userId,
                        buyerName: userName,
                        sellerId: ownerId,
                    }, { withCredentials: true });
                    setMessages(data.messages);
                    setChatId(data._id);
                }
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [listingId, userId, isLogin, chatIdFromUrl, userName]);

    // Socket: підключаємось після того як chatId та isSeller відомі
    useEffect(() => {
        if (!chatId || !userId) return;

        const socket = io(API_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => console.log('[Socket] connected:', socket.id));
        socket.on('connect_error', (err) => console.error('[Socket] connect_error:', err.message));
        socket.on('disconnect', (reason) => console.log('[Socket] disconnected:', reason));
        socket.on('chat_error', (msg) => console.error('[Socket] chat_error:', msg));

        socket.emit('join_chat', chatId);
        if (isSeller) socket.emit('messages_read', chatId);

        socket.on('new_message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('messages_read', () => {
            setMessages(prev => prev.map(m => ({ ...m, read: true })));
        });

        return () => { socket.disconnect(); };
    }, [chatId, isSeller, userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim() || !chatId || !socketRef.current) return;
        console.log('[Chat] sending to chatId:', chatId, '| socket connected:', socketRef.current.connected);
        socketRef.current.emit('send_message', {
            chatId,
            text: inputText.trim(),
            senderId: userId,
            senderName: userName,
        });
        setInputText('');
    };

    const openChat = async (id: string) => {
        const { data } = await axios.get(`${API_URL}/api/chat/${id}`, { withCredentials: true });
        setMessages(data.messages);
        setChatId(id);
    };

    const formatTime = (ts: number) =>
        new Date(ts).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    if (!isLogin) return null;

    if (loading) return (
        <div className="mx-auto bg-gray-200 pt-20 min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // Продавець бачить список усіх розмов
    if (isSeller && !chatId) return (
        <div className="mx-auto bg-gray-200 pt-20 xl:px-6 px-3 pb-6 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                        <Link
                            to={`/details/${listingId}`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b7280">
                                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
                            </svg>
                        </Link>
                        <h1 className="font-bold text-gray-800 text-lg">{c.title}</h1>
                    </div>
                    {sellerChats.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm">{c.noMessages}</div>
                    ) : (
                        <ul>
                            {sellerChats.map(chat => (
                                <li key={chat._id}>
                                    <button
                                        onClick={() => openChat(chat._id)}
                                        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-left min-h-[44px]"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {chat.buyerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 text-sm">@{chat.buyerName}</p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {chat.messages[0]?.text || '—'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                            {chat.messages[0] ? formatTime(chat.messages[0].timestamp) : ''}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );

    // Вікно чату (покупець або продавець у конкретній розмові)
    return (
        <div className="bg-gray-200 pt-20 xl:px-6 px-3 pb-6" style={{ height: '100dvh' }}>
            <div className="max-w-2xl mx-auto flex flex-col h-full">
                <div className="bg-white rounded-2xl shadow-md flex flex-col overflow-hidden h-full">

                    {/* Хедер */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                        <Link
                            to={isSeller ? `/chat/${listingId}` : `/details/${listingId}`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b7280">
                                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
                            </svg>
                        </Link>
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                                <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Z"/>
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{c.chatTitle}</span>
                    </div>

                    {/* Повідомлення */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <p className="text-gray-400 text-sm text-center">{c.startConversation}</p>
                            </div>
                        )}
                        {messages.map((msg, i) => {
                            const isOwn = msg.senderId === userId;
                            return (
                                <div key={i} className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs text-gray-400 px-1">@{msg.senderName}</span>
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                                        isOwn
                                            ? 'bg-emerald-500 text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <div className={`flex items-center gap-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                                        {isOwn && (
                                            <svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 -960 960 960" width="12px"
                                                fill={msg.read ? '#10b981' : '#9ca3af'}>
                                                <path d="m381-240 424-424-57-56-368 367-169-170-57 57 226 226Zm0 0Z"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Поле вводу */}
                    <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
                        <textarea
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={c.placeholder}
                            rows={1}
                            style={{ outline: 'none', resize: 'none' }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:border-emerald-400 transition-colors min-h-[44px]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-40 !text-white !shadow-none !border-0 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChatPage;
