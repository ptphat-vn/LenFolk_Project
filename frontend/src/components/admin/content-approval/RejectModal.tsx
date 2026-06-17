'use client';

import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/admin/FormDialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
  onConfirm: (reason: string) => void;
}

export function RejectModal({
  open,
  onOpenChange,
  contentTitle,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    onConfirm(reason.trim());
    setLoading(false);
    setReason('');
    setError('');
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setReason('');
          setError('');
        }
        onOpenChange(v);
      }}
      icon={XCircle}
      title="Từ chối nội dung"
      description="Nhập lý do từ chối để gửi cho tác giả."
      tone="danger"
      className="sm:max-w-md"
      footer={
        <>
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
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white text-[13px] min-w-25"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Từ chối
          </Button>
        </>
      }
    >
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-[11px] text-gray-400 mb-0.5">Nội dung</p>
            <p className="text-[13px] font-medium text-gray-800 line-clamp-2">
              {contentTitle}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700">
              Lý do từ chối <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="VD: Nội dung chưa đạt chất lượng yêu cầu, thiếu phần mô tả..."
              rows={4}
              className="text-[13px] resize-none"
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[12px] text-red-600">
            Tác giả sẽ nhận được thông báo từ chối kèm theo lý do này.
          </div>
        </div>
    </FormDialog>
  );
}
