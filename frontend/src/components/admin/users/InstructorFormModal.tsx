import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Loader2 } from 'lucide-react';
import { InstructorProfile, CreateInstructorProfileInput } from '@/types/instructor.types';

interface InstructorFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateInstructorProfileInput, id?: string) => Promise<void>;
  editInstructor: InstructorProfile | null;
}

const DEFAULT_FORM: CreateInstructorProfileInput = {
  userId: '',
  expertise: '',
  bio: '',
  websiteUrl: '',
};

export function InstructorFormModal({ open, onClose, onSave, editInstructor }: InstructorFormModalProps) {
  const [form, setForm] = useState<CreateInstructorProfileInput>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editInstructor) {
        setForm({
          userId: editInstructor.userId,
          expertise: editInstructor.expertise || '',
          bio: editInstructor.bio || '',
          websiteUrl: editInstructor.websiteUrl || '',
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, editInstructor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave(form, editInstructor?._id);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#2d6a4f]" />
            {editInstructor ? 'Cập nhật hồ sơ giảng viên' : 'Thêm hồ sơ giảng viên'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {!editInstructor && (
            <div className="space-y-1.5">
              <Label>User ID *</Label>
              <Input
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                placeholder="Nhập ID người dùng (MongoDB ID)..."
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Chuyên môn</Label>
            <Input
              value={form.expertise}
              onChange={(e) => setForm({ ...form, expertise: e.target.value })}
              placeholder="VD: Guitar điện, Thanh nhạc..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tiểu sử (Bio)</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Giới thiệu ngắn về kinh nghiệm..."
              className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Website (tùy chọn)</Label>
            <Input
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSaving || (!editInstructor && !form.userId)}
              className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Đang lưu...' : editInstructor ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
