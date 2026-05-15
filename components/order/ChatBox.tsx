'use client';

import { useState } from 'react';
import { Message } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

interface ChatBoxProps {
  messages: any[];
  currentUserId: string;
  onSend: (content: string) => void;
}

export function ChatBox({ messages, currentUserId, onSend }: ChatBoxProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="border border-slate-200 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-medium text-slate-700">Percakapan</h3>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-4 max-h-96 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Belum ada pesan.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const senderName = msg.sender_name || (isMe ? 'Saya' : 'User');
          const senderAvatar = msg.sender_avatar;

          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar
                src={senderAvatar}
                name={senderName}
                size={32}
              />
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <span className="text-xs text-slate-400">{senderName}</span>
                <div
                  className={`px-3 py-2 text-sm ${
                    isMe
                      ? 'bg-[#3b5fa0] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-slate-400">{formatDate(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5fa0]"
        />
        <Button type="submit" size="sm">
          Kirim
        </Button>
      </form>
    </div>
  );
}
