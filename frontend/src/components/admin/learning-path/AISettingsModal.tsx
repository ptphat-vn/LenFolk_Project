'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bot } from 'lucide-react';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trackLabel: string;
}

export function AISettingsModal({ open, onOpenChange, trackLabel }: Props) {
  const [model, setModel] = useState('gpt-4o');
  const [prompt, setPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a3a2a]/10 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 text-[#1a3a2a]" />
            </div>
            <div>
              <DialogTitle>Cài Đặt AI</DialogTitle>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Lộ Trình {trackLabel}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Model selector */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">Mô hình AI</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="h-8 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Khuyến nghị)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* System prompt */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">Prompt hướng dẫn AI</Label>
            <Textarea
              placeholder="Nhập hướng dẫn cho AI để tự động gợi ý sắp xếp lộ trình..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="text-[13px] resize-none"
            />
            <p className="text-[11px] text-gray-400">
              AI sẽ dùng prompt này để đề xuất cấu trúc lộ trình phù hợp với học
              viên.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white"
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
