'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Percent, Banknote } from 'lucide-react';
import { useState } from 'react';

interface CommissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
  onConfirm: (rate: number, basePrice: number) => void;
}

export function CommissionModal({
  open,
  onOpenChange,
  contentTitle,
  onConfirm,
}: CommissionModalProps) {
  const [rate, setRate] = useState('30');
  const [basePrice, setBasePrice] = useState('150000');
  const [loading, setLoading] = useState(false);

  const rateNum = parseFloat(rate) || 0;
  const priceNum = parseInt(basePrice.replace(/\D/g, '')) || 0;
  const earned = Math.round((priceNum * rateNum) / 100);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm(rateNum, priceNum);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px]">
            Xét duyệt & Cài đặt hoa hồng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-[11px] text-gray-400 mb-0.5">Nội dung</p>
            <p className="text-[13px] font-medium text-gray-800 line-clamp-2">
              {contentTitle}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700">
              Tỉ lệ hoa hồng (%)
            </Label>
            <div className="relative">
              <Input
                value={rate}
                onChange={(e) =>
                  setRate(e.target.value.replace(/[^0-9.]/g, ''))
                }
                className="h-9 text-[13px] pr-8"
                max={100}
              />
              <Percent className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700">
              Giá gốc tác phẩm (VND)
            </Label>
            <div className="relative">
              <Input
                value={basePrice}
                onChange={(e) =>
                  setBasePrice(e.target.value.replace(/\D/g, ''))
                }
                className="h-9 text-[13px] pr-8"
              />
              <Banknote className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Calculated */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] text-emerald-600 mb-0.5">
              Hoa hồng mỗi lượt mua
            </p>
            <p className="text-[18px] font-bold text-[#1a3a2a]">
              {earned.toLocaleString('vi-VN')} ₫
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              = {rateNum}% × {priceNum.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-[13px]"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={loading || rateNum <= 0 || priceNum <= 0}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] min-w-25"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Xác nhận duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
