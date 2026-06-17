import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/admin/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Loader2 } from 'lucide-react';
import {
  InstructorProfile,
  CreateInstructorProfileInput,
  getInstructorUserId,
} from '@/types/instructor.types';
import { instructorProfileSchema, zodFieldErrors } from '@/schema/form.schema';

type InstructorFormField = 'userId' | 'expertise' | 'bio' | 'websiteUrl';
type InstructorFormErrors = Partial<Record<InstructorFormField, string>>;

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
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<InstructorFormErrors>({});

  useEffect(() => {
    if (open) {
      setError('');
      setFieldErrors({});
      if (editInstructor) {
        setForm({
          userId: getInstructorUserId(editInstructor.userId),
          expertise: editInstructor.expertise || '',
          bio: editInstructor.bio || '',
          websiteUrl: editInstructor.websiteUrl || '',
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, editInstructor]);

  const renderFieldError = (field: InstructorFormField) =>
    fieldErrors[field] ? (
      <p className="text-[11px] font-medium text-red-500">
        {fieldErrors[field]}
      </p>
    ) : null;

  const clearFieldError = (field: InstructorFormField) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const parsed = instructorProfileSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<InstructorFormField>(parsed.error));
      return;
    }

    try {
      setIsSaving(true);
      await onSave(parsed.data, editInstructor?._id);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onClose}
      icon={UserCheck}
      title={editInstructor ? 'Cập nhật hồ sơ giảng viên' : 'Thêm hồ sơ giảng viên'}
      description={
        editInstructor
          ? 'Cập nhật thông tin hồ sơ giảng viên.'
          : 'Tạo hồ sơ giảng viên mới cho người dùng.'
      }
      className="sm:max-w-lg"
      onSubmit={handleSubmit}
      footer={
        <>
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
        </>
      }
    >
        <div className="space-y-4">
          {!editInstructor && (
            <div className="space-y-1.5">
              <Label>User ID *</Label>
              <Input
                value={form.userId}
                onChange={(e) => {
                  clearFieldError('userId');
                  setForm({ ...form, userId: e.target.value });
                }}
                placeholder="Nhập ID người dùng (MongoDB ID)..."
                required
              />
              {renderFieldError('userId')}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Chuyên môn</Label>
            <Input
              value={form.expertise}
              onChange={(e) => {
                clearFieldError('expertise');
                setForm({ ...form, expertise: e.target.value });
              }}
              placeholder="VD: Guitar điện, Thanh nhạc..."
            />
            {renderFieldError('expertise')}
          </div>

          <div className="space-y-1.5">
            <Label>Tiểu sử (Bio)</Label>
            <textarea
              value={form.bio}
              onChange={(e) => {
                clearFieldError('bio');
                setForm({ ...form, bio: e.target.value });
              }}
              placeholder="Giới thiệu ngắn về kinh nghiệm..."
              className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] resize-none"
            />
            {renderFieldError('bio')}
          </div>

          <div className="space-y-1.5">
            <Label>Website (tùy chọn)</Label>
            <Input
              value={form.websiteUrl}
              onChange={(e) => {
                clearFieldError('websiteUrl');
                setForm({ ...form, websiteUrl: e.target.value });
              }}
              placeholder="https://..."
            />
            {renderFieldError('websiteUrl')}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    </FormDialog>
  );
}
