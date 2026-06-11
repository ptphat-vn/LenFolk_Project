'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2, QrCode, Landmark, Save, Percent, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { systemSettingApi } from '@/lib/api/system-setting.api';
import { SystemSetting, UpdateSystemSettingInput } from '@/types/system-setting.types';
import { systemSettingSchema, firstZodError } from '@/schema/form.schema';

/**
 * Cấu hình thanh toán hệ thống — 1 mã QR cố định + tài khoản ngân hàng dùng chung
 * cho toàn bộ đơn mua (course & tiết mục). GET/PUT /system-settings.
 */
export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [commission, setCommission] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await systemSettingApi.get();
        const s = res.data;
        setSettings(s);
        setBankName(s.bankName ?? '');
        setBankAccountNumber(s.bankAccountNumber ?? '');
        setBankAccountName(s.bankAccountName ?? '');
        setTransferNote(s.transferNote ?? '');
        setCommission(
          s.defaultCommissionPercentage !== undefined
            ? String(s.defaultCommissionPercentage)
            : '',
        );
      } catch {
        toast.error('Lỗi khi tải cấu hình thanh toán');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onPickQr = (file?: File) => {
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateSystemSettingInput = {
      bankName: bankName.trim() || undefined,
      bankAccountNumber: bankAccountNumber.trim() || undefined,
      bankAccountName: bankAccountName.trim() || undefined,
      transferNote: transferNote.trim() || undefined,
      defaultCommissionPercentage: commission === '' ? undefined : Number(commission),
      ...(qrFile ? { qrCode: qrFile } : {}),
    };
    const parsed = systemSettingSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(firstZodError(parsed.error));
      return;
    }
    try {
      setSaving(true);
      const res = await systemSettingApi.update(payload);
      setSettings(res.data);
      setQrFile(null);
      setQrPreview(null);
      toast.success('Đã lưu cấu hình thanh toán');
    } catch {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const currentQr = qrPreview ?? settings?.paymentQrUrl ?? null;

  return (
    <div className="p-6 space-y-5 w-full max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Cấu hình thanh toán</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Mã QR cố định &amp; tài khoản ngân hàng dùng chung cho mọi đơn mua khóa học và tiết mục
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* QR */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#2d6a4f]" />
              <h2 className="text-sm font-semibold text-gray-900">Mã QR thanh toán</h2>
            </div>
            <div className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 min-h-52">
              {currentQr ? (
                <Image
                  src={currentQr}
                  alt="QR thanh toán"
                  width={200}
                  height={200}
                  className="rounded-lg object-contain"
                  unoptimized
                />
              ) : (
                <p className="text-[13px] text-gray-400 text-center">
                  Chưa có mã QR. Tải lên ảnh QR để người dùng quét chuyển khoản.
                </p>
              )}
            </div>
            <label className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              {qrFile ? qrFile.name : 'Chọn ảnh QR (jpg/png/webp)'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onPickQr(e.target.files?.[0])}
              />
            </label>
          </div>

          {/* Bank info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#2d6a4f]" />
              <h2 className="text-sm font-semibold text-gray-900">Tài khoản ngân hàng</h2>
            </div>
            <div className="space-y-1.5">
              <Label>Ngân hàng</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="VD: Vietcombank" />
            </div>
            <div className="space-y-1.5">
              <Label>Số tài khoản</Label>
              <Input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="VD: 0123456789"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Chủ tài khoản</Label>
              <Input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="VD: CONG TY LENFOLK"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nội dung chuyển khoản gợi ý</Label>
              <Input
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="VD: LENFOLK {transactionId}"
              />
            </div>
          </div>

          {/* Commission + Save */}
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-gray-500" />
                Hoa hồng mặc định (%)
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="30"
                className="w-32"
              />
            </div>
            <p className="text-[12px] text-gray-400 flex-1 min-w-40">
              Áp dụng cho item chưa đặt hoa hồng riêng. Instructor sẽ nhận phần còn lại.
            </p>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
