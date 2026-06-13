# Luồng Admin & Instructor — Hướng dẫn chỉnh sửa UI (Web)

> Tài liệu cho dev web cập nhật UI theo backend **hiện tại**. Nhiều thứ đã đổi —
> đọc kỹ phần **"⚠️ Thay đổi quan trọng"** trước.

## Phân quyền (role)

Hệ thống có **3 role**: `admin`, `instructor`, `user`. Guard ở middleware:

| Guard | Cho phép | Hỏng → mã lỗi |
|-------|----------|---------------|
| `verifyToken` | Bất kỳ user đã đăng nhập | `401` |
| `verifyAdmin` | Chỉ `admin` | `403` |
| `verifyInstructor` | Chỉ `instructor` | `403` |
| `verifyInstructorOrAdmin` | `instructor` **hoặc** `admin` | `403` |
| `optionalAuth` | Có/không token đều được (lọc kết quả theo quyền) | — |

Mọi request cần header `Authorization: Bearer <JWT>`. Base URL: `/api`.

---

## ⚠️ Thay đổi quan trọng (cần sửa UI)

1. **Bỏ hoàn toàn duyệt thanh toán thủ công.** Không còn `upload-proof`, không còn nút **Duyệt/Từ chối thanh toán** cho admin. SePay xác nhận tự động qua webhook. → **Gỡ màn "Duyệt giao dịch chờ" khỏi admin panel.**
2. **Trạng thái giao dịch** giờ chỉ còn: `pending | success | failed | refunded` (đã bỏ `reviewing`).
3. **Giá khóa học tách khỏi Course.** Course không có field giá. Admin đặt giá qua **CoursePlan**: `PUT /api/courses/:id/plan` (theo chu kỳ monthly/quarterly/yearly). → UI tạo course chia 2 bước: tạo course → đặt giá.
4. **Giá tiết mục nằm thẳng trên Performance** (`price`), bán mua đứt.
5. **SystemSetting / ZaloPay đã bị gỡ bỏ.** Nếu UI còn màn cấu hình ZaloPay/SystemSetting → xóa. Cấu hình tài khoản nhận tiền nằm ở **biến môi trường server** (`SEPAY_*`), không có UI.

---

# PHẦN 1 — LUỒNG ADMIN

## 1.1 Quản lý Khóa học (Course)

| Method | Endpoint | Auth | Mục đích |
|--------|----------|------|----------|
| GET | `/api/courses` | optional | Danh sách (lọc theo quyền nếu có token) |
| GET | `/api/courses/:id` | optional | Chi tiết |
| POST | `/api/courses` | **admin** | Tạo course (KHÔNG kèm giá) |
| PATCH | `/api/courses/:id` | **admin** | Sửa course |
| DELETE | `/api/courses/:id` | **admin** | Xóa course |
| PUT | `/api/courses/:id/plan` | **admin** | Tạo/cập nhật **gói giá** (CoursePlan) |

**Luồng UI tạo khóa học:**
1. `POST /api/courses` → tạo course (title, mô tả, isFree...).
2. Nếu **không** `isFree`: `PUT /api/courses/:id/plan` với `{ price, billingCycle, currency, isActive }`.
   - `billingCycle`: `monthly | quarterly | yearly` → quyết định thời hạn truy cập sau khi mua.
3. Đặt `status: published` thì course mới mua được (course chưa published → user không mua được).

> Course `isFree=true` thì không cần plan, user vào học miễn phí.

## 1.2 Quản lý Bài học (Lesson)

| Method | Endpoint | Auth | Ghi chú |
|--------|----------|------|---------|
| GET | `/api/lessons` | optional | Lọc theo role |
| GET | `/api/lessons/:id` | optional | Public xem được lesson free đã publish |
| POST | `/api/lessons` | **admin** | Có upload video (`multipart`, field `video`) |
| PATCH | `/api/lessons/:id` | **admin** | Có thể thay video |
| DELETE | `/api/lessons/:id` | **admin** | |

> Upload video: `multipart/form-data`, field tên `video` (mp4/mov/webm/mkv, tối đa 500MB).

## 1.3 Kiểm duyệt Tiết mục (Performance) — *quan trọng*

Instructor đăng tiết mục → `status: pending`. Admin duyệt/từ chối:

| Method | Endpoint | Auth | Chuyển trạng thái |
|--------|----------|------|-------------------|
| GET | `/api/performances` | optional | Danh sách |
| POST | `/api/performances` | instructor/admin | tạo (instructor → luôn `pending`) |
| PATCH | `/api/performances/:id` | instructor(của mình)/admin | sửa |
| DELETE | `/api/performances/:id` | **admin** | xóa |
| PATCH | `/api/performances/:id/approve` | **admin** | `pending → published` |
| PATCH | `/api/performances/:id/reject` | **admin** | `pending → archived` |

- **Approve body** (tùy chọn): `{ "adminCommissionPercentage": 30 }` — % hoa hồng sàn giữ lại. Sau approve: `status=published`, set `publishedAt`.
- **Reject body** (tùy chọn): `{ "rejectReason": "..." }` → `status=archived`.
- Chỉ duyệt/từ chối được tiết mục đang `pending`, ngược lại `400`.

**UI admin cần:** màn "Tiết mục chờ duyệt" (lọc `status=pending`) với nút Duyệt (nhập % hoa hồng) / Từ chối (nhập lý do).

## 1.4 Quản lý Người dùng (User)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/users` | **admin** |
| POST | `/api/users` | **admin** |
| GET | `/api/users/:id` | **admin** |
| PATCH | `/api/users/:id` | **admin** (có upload `avatar`) |
| DELETE | `/api/users/:id` | **admin** |

> Đổi role user (user ↔ instructor ↔ admin) làm qua `PATCH /api/users/:id`.

## 1.5 Quản lý Coupon

Toàn bộ route **admin only**.

| Method | Endpoint | Mục đích |
|--------|----------|----------|
| GET | `/api/coupons` | Danh sách |
| POST | `/api/coupons` | Tạo (code, discountType `percent\|fixed`, discountValue, applicableTo `all\|course\|performance`, validFrom/validTo, maxUses) |
| GET | `/api/coupons/:id` | Chi tiết |
| PATCH | `/api/coupons/:id` | Sửa |
| DELETE | `/api/coupons/:id` | Xóa |

## 1.6 Giao dịch (TransactionRecord) — *đã đổi*

| Method | Endpoint | Auth | Ghi chú |
|--------|----------|------|---------|
| GET | `/api/transaction-records` | token | Admin xem tất cả; user chỉ xem của mình |
| GET | `/api/transaction-records/:id` | token (chủ/admin) | Chi tiết |
| PATCH | `/api/transaction-records/:id` | **admin** | Sửa (vd refund thủ công) |
| DELETE | `/api/transaction-records/:id` | **admin** | Xóa |
| GET | `/api/transaction-records/:id/status` | token (chủ) | Mobile poll trạng thái |

> ❌ **Đã bỏ:** `PATCH /:id/upload-proof`, `/:id/approve`, `/:id/reject`. Admin **không** còn duyệt thanh toán — gỡ khỏi UI. Admin chỉ còn xem/sửa/xóa và xử lý refund (qua PATCH, set `status=refunded`).

## 1.7 Đăng ký (Enrollment)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/enrollments` | **admin** — xem tất cả enrollment |
| GET | `/api/enrollments/me` | token — user xem của mình |

## 1.8 Rút tiền giảng viên (Payout) — phía Admin

| Method | Endpoint | Auth | Mục đích |
|--------|----------|------|----------|
| GET | `/api/wallets/admin/payouts` | **admin** | Danh sách yêu cầu rút tiền (populate tên/email instructor) |
| PATCH | `/api/wallets/admin/payouts/:id` | **admin** | Duyệt/từ chối |

- Body: `{ "status": "approved" | "rejected", "adminNote": "..." }`.
- Chỉ xử lý được payout đang `pending`, ngược lại `400`.
- **Rejected → tự hoàn tiền lại ví instructor.** Approved → giữ nguyên (tiền đã trừ khi tạo yêu cầu).

**UI admin cần:** màn "Yêu cầu rút tiền" với nút Duyệt / Từ chối (nhập ghi chú).

## 1.9 Khác (admin only)

| Nhóm | Routes |
|------|--------|
| Badge | GET công khai; `POST/PATCH/DELETE /api/badges[/:id]` admin |
| Permission | `/api/permissions` toàn bộ admin |
| Audit Log | `/api/audit-logs` toàn bộ admin (GET danh sách/chi tiết, POST, DELETE) |
| Instructor Profile | `DELETE /api/instructor-profiles/:id` admin; GET/POST/PATCH cho user đăng nhập |

---

# PHẦN 2 — LUỒNG INSTRUCTOR

## 2.1 Đăng & quản lý Tiết mục

| Method | Endpoint | Ghi chú |
|--------|----------|---------|
| POST | `/api/performances` | Tạo tiết mục — instructor luôn tạo ở `status=pending`, gắn `instructorId` = mình. Kèm `price`. Upload tài liệu: `multipart`, field `documents` (tối đa 10 file: pdf/doc/ppt/zip...). |
| PATCH | `/api/performances/:id` | Sửa **tiết mục của mình** (có thể thêm documents) |
| GET | `/api/performances/:id` | Instructor xem được cả tiết mục chưa publish |

**Luồng:** Instructor tạo (pending) → admin duyệt (published) hoặc từ chối (archived). Instructor xem trạng thái qua danh sách/chi tiết.

## 2.2 Ví & Rút tiền (Wallet)

| Method | Endpoint | Auth | Mục đích |
|--------|----------|------|----------|
| GET | `/api/wallets/me` | instructor/admin | Xem số dư ví (`balance`, `totalEarned`) + lịch sử payout |
| PUT | `/api/wallets/bank-info` | instructor/admin | Cập nhật thông tin ngân hàng |
| POST | `/api/wallets/payout` | instructor/admin | Tạo yêu cầu rút tiền |

**Chi tiết:**
- `GET /me` tự tạo ví rỗng nếu chưa có. Trả `{ wallet, payouts[] }`.
- `PUT /bank-info` body: `{ bankName, accountName, accountNumber }` (cả 3 bắt buộc) → lưu vào InstructorProfile. **Phải cập nhật trước khi rút tiền.**
- `POST /payout` body: `{ amount }`.
  - Tối thiểu **100.000**.
  - Cần đã có bank info, đủ số dư, và **không có** yêu cầu `pending` nào khác → nếu không thì `400`.
  - Thành công: trừ ngay `balance`, tạo PayoutRequest `pending`.

**Tiền vào ví từ đâu?** Khi user mua khóa học/tiết mục của instructor và SePay xác nhận, hệ thống tự cộng `amount * (100 - commission%) / 100` vào ví (xem luồng thanh toán SePay).

**Trạng thái PayoutRequest:** `pending → approved | rejected`. Rejected thì tiền được hoàn lại ví.

## 2.3 Hồ sơ Giảng viên (Instructor Profile)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/instructor-profiles` | token |
| GET | `/api/instructor-profiles/:id` | token |
| POST | `/api/instructor-profiles` | token (tạo hồ sơ) |
| PATCH | `/api/instructor-profiles/:id` | token |
| DELETE | `/api/instructor-profiles/:id` | **admin** |

> Hồ sơ chứa `bankDetails` (dùng cho payout). Cập nhật nhanh thông tin ngân hàng nên dùng `PUT /api/wallets/bank-info`.

---

## Phụ lục — Sơ đồ trạng thái

```
Performance:   (instructor tạo) pending ──approve──▶ published
                                   │
                                   └──reject──▶ archived

TransactionRecord: pending ──(SePay webhook)──▶ success
                      │                            │
                      └─(không khớp/hết hạn)─▶ failed   refunded (admin PATCH)

PayoutRequest:  pending ──approve──▶ approved
                   │
                   └──reject──▶ rejected (hoàn tiền về ví)
```

## Phụ lục — Checklist gỡ/sửa UI

- [ ] Gỡ màn **Duyệt thanh toán** (upload-proof/approve/reject transaction).
- [ ] Gỡ trạng thái `reviewing` khỏi filter/label giao dịch.
- [ ] Gỡ màn cấu hình **SystemSetting / ZaloPay**.
- [ ] Tách form tạo Course: tạo course → đặt giá qua CoursePlan (`PUT /courses/:id/plan`).
- [ ] Giữ/đảm bảo màn **Duyệt tiết mục** (approve có % hoa hồng / reject có lý do).
- [ ] Giữ/đảm bảo màn **Duyệt rút tiền** (payout approve/reject).

---

# PHẦN 3 — SPEC REQUEST / RESPONSE

## Quy ước chung

**Envelope response:**
- Danh sách: `{ "success": true, "results": <number>, "data": [ ... ] }`
- Một bản ghi: `{ "success": true, "data": { ... } }` (một số endpoint có thêm `"message"`)

**Format lỗi (mọi endpoint):**
```json
{ "success": false, "message": "..." }
```
- Lỗi validation (zod) → `400`, message dạng: `"Validation Failed: title: Required, level: Invalid enum value"`.
- `401` chưa đăng nhập/token sai · `403` sai role/không phải của mình · `404` không tìm thấy.

**Field hệ thống** (mọi document, KHÔNG gửi khi tạo): `_id`, `createdAt`, `updatedAt`, `__v`.
Field upload (`avatar`, `video`, `documents`) → gửi `multipart/form-data`, các field còn lại gửi kèm dạng text.

---

## 3.1 Course

### POST /api/courses  (admin)
**Req** (`instructorId` lấy từ token, không cần gửi):
```json
{
  "title": "Đàn tranh cơ bản",
  "description": "Khóa nhập môn",
  "thumbnail": "https://...",
  "isFree": false,
  "courseType": "foundation",
  "level": "beginner",                  // bắt buộc: beginner|intermediate|advanced
  "adminCommissionPercentage": 30,
  "tags": ["dan-tranh", "co-ban"],
  "isFeatured": false,
  "status": "pending"                   // pending|published|archived (mặc định pending)
}
```
**Res `201`:** `{ "success": true, "data": { Course } }`

### PATCH /api/courses/:id  (admin)
**Req:** mọi field như trên, tất cả optional. **Res `200`:** `{ "success": true, "data": { Course } }`

### PUT /api/courses/:id/plan  (admin) — đặt giá
**Req:**
```json
{
  "price": 199000,                      // bắt buộc, >= 0
  "billingCycle": "monthly",            // bắt buộc: monthly|quarterly|yearly
  "name": "Gói tháng",
  "description": "...",
  "features": ["Học không giới hạn"]
}
```
**Res `200`:** `{ "success": true, "data": { CoursePlan } }`

### GET /api/courses  · GET /api/courses/:id
**Res** kèm `plan` nhúng sẵn (null nếu chưa đặt giá):
```json
{
  "success": true, "results": 1,
  "data": [{
    "_id": "665f...", "title": "Đàn tranh cơ bản", "level": "beginner",
    "isFree": false, "status": "published", "adminCommissionPercentage": 30,
    "tags": ["dan-tranh"], "totalLessons": 8, "enrollCount": 12, "isFeatured": false,
    "publishedAt": "2026-06-01T00:00:00.000Z", "createdAt": "...", "updatedAt": "...",
    "plan": { "_id": "...", "price": 199000, "currency": "VND", "billingCycle": "monthly", "name": "Gói tháng", "isActive": true }
  }]
}
```

---

## 3.2 Lesson  (admin, có upload video)

### POST /api/lessons  ·  PATCH /api/lessons/:id
**Req** `multipart/form-data` — field `video` (file, optional) + các field text:
```
courseId: 665f...            (bắt buộc khi tạo)
title: "Bài 1 - Tư thế tay"  (bắt buộc khi tạo)
description: "..."
order: 1                     (bắt buộc khi tạo, số)
duration: 600                (giây)
status: published            (draft|published)
isFree: true
transcript: "..."
techniques: ["vê","ngắt"]    (JSON array hoặc "a,b,c")
audioUrl: "https://..."
```
> Nếu gửi file `video`, server tự set `videoUrl` (bỏ qua `videoUrl` text).

**Res `201`/`200`:** `{ "success": true, "data": { Lesson } }`
Lesson fields: `courseId, title, description, videoUrl, audioUrl, order, duration, status, isFree, transcript, techniques[]`.

---

## 3.3 Performance (tiết mục)

### POST /api/performances  (instructor/admin, `multipart/form-data`)
Field `documents` = mảng file (tối đa 10). Các field text:
```
title: "Lý cây đa"           (bắt buộc)
description: "..."
videoUrl: "https://..."
isFree: false
genre: "dan-ca"
duration: 240                (giây)
price: 50000                 (>= 0; instructor nhập giá)
currency: VND                (VND|USD)
tags: ["dan-ca"]             (JSON array hoặc "a,b")
adminCommissionPercentage: 30
```
> Instructor: `instructorId` gán từ token, `status` luôn bị ép `pending`.

**Res `201`:** `{ "success": true, "data": { Performance } }`
Performance fields gồm: `instructorId, title, description, thumbnail, videoUrl, documents[{name,url,publicId,format,resourceType,bytes}], isFree, genre, duration, adminCommissionPercentage, status, price, currency, tags[], isFeatured, publishedAt`.

### PATCH /api/performances/:id  (instructor của mình / admin)
**Req:** như trên, tất cả optional. **Res `200`:** `{ "success": true, "data": { Performance } }`

### PATCH /api/performances/:id/approve  (admin)
**Req** (optional): `{ "adminCommissionPercentage": 30 }`
**Res `200`:**
```json
{ "success": true, "message": "Tiết mục đã được duyệt và xuất bản thành công.", "data": { Performance, "status": "published", "publishedAt": "..." } }
```

### PATCH /api/performances/:id/reject  (admin)
**Req** (optional): `{ "rejectReason": "Âm thanh kém" }`
**Res `200`:**
```json
{ "success": true, "message": "Tiết mục đã bị từ chối.", "rejectReason": "Âm thanh kém", "data": { Performance, "status": "archived" } }
```

---

## 3.4 User  (admin)

### POST /api/users
**Req:**
```json
{
  "name": "Nguyen Van A",               // bắt buộc
  "email": "a@example.com",             // bắt buộc
  "passwordHash": "<đã hash>",          // bắt buộc
  "role": "user",                       // admin|instructor|user
  "gender": "male",                     // male|female|other
  "phoneNumber": "0900000000",
  "isActive": true, "isVerified": false
}
```
### PATCH /api/users/:id  (`multipart`, field `avatar` optional)
**Req:** các field trên, tất cả optional. Đổi role: `{ "role": "instructor" }`.
**Res:** `{ "success": true, "data": { User } }` (không trả `passwordHash`/`refreshToken`).

---

## 3.5 Coupon  (admin)

### POST /api/coupons  ·  PATCH /api/coupons/:id
**Req:**
```json
{
  "code": "SALE50",                     // bắt buộc, >= 3 ký tự (tự uppercase)
  "discountType": "percent",            // percent|fixed
  "discountValue": 50,                  // >= 0
  "applicableTo": "all",                // subscription|course|all
  "maxUses": 100,                       // null = không giới hạn
  "validFrom": "2026-06-01T00:00:00Z",
  "validTo": "2026-07-01T00:00:00Z",    // null = không hết hạn
  "isActive": true
}
```
**Res:** `{ "success": true, "data": { Coupon, "usedCount": 0 } }`

---

## 3.6 Wallet & Payout

### GET /api/wallets/me  (instructor/admin)
**Res `200`:**
```json
{
  "success": true,
  "data": {
    "wallet": { "_id": "...", "instructorId": "...", "balance": 350000, "totalEarned": 500000, "currency": "VND" },
    "payouts": [ { PayoutRequest }, ... ]
  }
}
```

### PUT /api/wallets/bank-info  (instructor/admin)
**Req:** `{ "bankName": "MB", "accountName": "NGUYEN VAN A", "accountNumber": "0123456789" }` (cả 3 bắt buộc)
**Res `200`:** `{ "success": true, "message": "...", "data": { bankName, accountName, accountNumber } }`

### POST /api/wallets/payout  (instructor/admin)
**Req:** `{ "amount": 200000 }` (tối thiểu 100000)
**Res `201`:** `{ "success": true, "message": "Đã gửi yêu cầu rút tiền thành công", "data": { PayoutRequest } }`
PayoutRequest: `{ instructorId, amount, status: "pending", bankDetails{...}, adminNote, processedBy, processedAt }`
**Lỗi `400`:** chưa có bank info / số dư không đủ / đã có yêu cầu pending.

### GET /api/wallets/admin/payouts  (admin)
**Res:** `{ "success": true, "results": N, "data": [ { PayoutRequest, "instructorId": { "name", "email" } } ] }`

### PATCH /api/wallets/admin/payouts/:id  (admin)
**Req:** `{ "status": "approved", "adminNote": "OK" }`  (`status`: approved|rejected)
**Res `200`:** `{ "success": true, "data": { PayoutRequest } }`  — `rejected` thì tiền tự hoàn về ví.

---

## 3.7 Instructor Profile

### POST /api/instructor-profiles  ·  PATCH /api/instructor-profiles/:id
**Req:**
```json
{
  "userId": "665f...",                  // bắt buộc khi tạo
  "bio": "...",
  "expertise": "Đàn tranh",
  "websiteUrl": "https://..."
}
```
**Res:** `{ "success": true, "data": { InstructorProfile } }`
Fields: `userId, bio, expertise, websiteUrl, totalStudents, totalCourses, rating, bankDetails{bankName,accountName,accountNumber}`.

---

## 3.8 Badge  (admin ghi, GET công khai)

### POST /api/badges  ·  PATCH /api/badges/:id
**Req:**
```json
{
  "name": "7 ngày streak",              // bắt buộc
  "icon": "https://...",                // bắt buộc
  "description": "...",
  "type": "streak",                     // streak|completion|practice|achievement
  "conditionKey": "streak_days",        // bắt buộc
  "conditionValue": 7,                  // bắt buộc, số
  "isActive": true
}
```
**Res:** `{ "success": true, "data": { Badge } }`

---

## 3.9 Permission  (admin)

### POST /api/permissions  ·  PATCH /api/permissions/:id
**Req:** `{ "action": "create", "resource": "Course", "description": "..." }` (action, resource bắt buộc)
**Res:** `{ "success": true, "data": { Permission } }`

---

## 3.10 TransactionRecord  (admin sửa/xóa; xem ở Phần 1.6)

### PATCH /api/transaction-records/:id  (admin) — dùng để refund thủ công
**Req:** (tất cả optional)
```json
{ "status": "refunded", "amount": 199000, "paymentMethod": "qr_manual" }
```
`status`: `pending|success|failed|refunded`.
**Res `200`:** `{ "success": true, "data": { TransactionRecord } }`

> ⚠️ `POST /api/transaction-records` bị chặn — giao dịch chỉ tạo qua luồng mua (`/courses|performances/:id/purchase`).
