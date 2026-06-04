# LenFolk API Reference

> Base URL: `http://localhost:5000/api`  
> Tất cả route có 🔒 yêu cầu Bearer JWT trong header `Authorization: Bearer <token>`.

---

## Roles

| Role         | Mô tả                                 |
| ------------ | ------------------------------------- |
| `guest`      | Mặc định khi đăng ký                  |
| `learner`    | Sau khi subscription được admin duyệt |
| `instructor` | Được admin gán                        |
| `moderator`  | Được admin gán                        |
| `admin`      | Quyền cao nhất                        |

---

## 🔑 Auth

| Method | Endpoint              | Mô tả                                        | Role   |
| ------ | --------------------- | -------------------------------------------- | ------ |
| `POST` | `/auth/register`      | Đăng ký tài khoản (role mặc định: `guest`)   | Public |
| `POST` | `/auth/login`         | Đăng nhập, trả về accessToken + refreshToken | Public |
| `POST` | `/auth/refresh-token` | Lấy accessToken mới từ refreshToken          | Public |
| `POST` | `/auth/logout`        | Đăng xuất, vô hiệu hóa refreshToken          | Public |

---

## 👤 Users

| Method   | Endpoint     | Mô tả                                                               | Role     |
| -------- | ------------ | ------------------------------------------------------------------- | -------- |
| `GET`    | `/users`     | Lấy danh sách tất cả user (filter: `role`, `page`, `limit`, `sort`) | 🔒 Admin |
| `POST`   | `/users`     | Tạo user thủ công (có thể chỉ định role)                            | 🔒 Admin |
| `GET`    | `/users/:id` | Lấy thông tin user theo ID                                          | 🔒 Admin |
| `PATCH`  | `/users/:id` | Cập nhật user (hỗ trợ upload avatar `multipart/form-data`)          | 🔒 Admin |
| `DELETE` | `/users/:id` | Soft-delete user (đặt `deletedAt`, không xóa DB)                    | 🔒 Admin |

---

## 📚 Courses

| Method   | Endpoint                | Mô tả                                                | Role                  |
| -------- | ----------------------- | ---------------------------------------------------- | --------------------- |
| `GET`    | `/courses`              | Danh sách khóa học (mặc định `status: published`)    | Public                |
| `POST`   | `/courses`              | Tạo khóa học mới (`instructorId` inject từ token)    | 🔒 Instructor / Admin |
| `GET`    | `/courses/:id`          | Chi tiết khóa học                                    | Public                |
| `PATCH`  | `/courses/:id`          | Cập nhật khóa học (Instructor chỉ sửa khóa của mình) | 🔒 Instructor / Admin |
| `DELETE` | `/courses/:id`          | Xóa khóa học                                         | 🔒 Admin              |
| `POST`   | `/courses/:id/purchase` | Mua lẻ khóa học (hỗ trợ `couponCode`)                | 🔒 Đã đăng nhập       |

---

## 📖 Lessons

| Method   | Endpoint       | Mô tả                                                                          | Role                  |
| -------- | -------------- | ------------------------------------------------------------------------------ | --------------------- |
| `GET`    | `/lessons`     | Danh sách bài học (filter: `courseId`; mặc định `status: published`)           | 🔒 Đã đăng nhập       |
| `POST`   | `/lessons`     | Tạo bài học mới (Instructor chỉ tạo cho khóa của mình; tự tăng `totalLessons`) | 🔒 Instructor / Admin |
| `GET`    | `/lessons/:id` | Chi tiết bài học (`isFree: false` yêu cầu subscription active)                 | 🔒 Đã đăng nhập       |
| `PATCH`  | `/lessons/:id` | Cập nhật bài học                                                               | 🔒 Đã đăng nhập       |
| `DELETE` | `/lessons/:id` | Xóa bài học (tự giảm `totalLessons`)                                           | 🔒 Admin              |

---

## 🧑‍🏫 Instructor Profiles

| Method   | Endpoint                   | Mô tả                                         | Role            |
| -------- | -------------------------- | --------------------------------------------- | --------------- |
| `GET`    | `/instructor-profiles`     | Danh sách hồ sơ giảng viên (filter: `userId`) | 🔒 Đã đăng nhập |
| `POST`   | `/instructor-profiles`     | Tạo hồ sơ giảng viên                          | 🔒 Đã đăng nhập |
| `GET`    | `/instructor-profiles/:id` | Chi tiết hồ sơ giảng viên                     | 🔒 Đã đăng nhập |
| `PATCH`  | `/instructor-profiles/:id` | Cập nhật hồ sơ giảng viên                     | 🔒 Đã đăng nhập |
| `DELETE` | `/instructor-profiles/:id` | Xóa hồ sơ giảng viên                          | 🔒 Admin        |

---

## 🏅 Badges

| Method   | Endpoint      | Mô tả           | Role     |
| -------- | ------------- | --------------- | -------- |
| `GET`    | `/badges`     | Danh sách badge | Public   |
| `POST`   | `/badges`     | Tạo badge mới   | 🔒 Admin |
| `GET`    | `/badges/:id` | Chi tiết badge  | Public   |
| `PATCH`  | `/badges/:id` | Cập nhật badge  | 🔒 Admin |
| `DELETE` | `/badges/:id` | Xóa badge       | 🔒 Admin |

---

## 🔔 Notifications

| Method   | Endpoint             | Mô tả                                                | Role            |
| -------- | -------------------- | ---------------------------------------------------- | --------------- |
| `GET`    | `/notifications`     | Thông báo của user đang đăng nhập (filter: `isRead`) | 🔒 Đã đăng nhập |
| `POST`   | `/notifications`     | Gửi thông báo đến user bất kỳ                        | 🔒 Admin        |
| `GET`    | `/notifications/:id` | Chi tiết thông báo                                   | 🔒 Đã đăng nhập |
| `PATCH`  | `/notifications/:id` | Đánh dấu đã đọc / cập nhật                           | 🔒 Đã đăng nhập |
| `DELETE` | `/notifications/:id` | Xóa thông báo                                        | 🔒 Admin        |

---

## 📊 Progress

| Method   | Endpoint        | Mô tả                                                              | Role            |
| -------- | --------------- | ------------------------------------------------------------------ | --------------- |
| `GET`    | `/progress`     | Tiến độ học của user đang đăng nhập (filter: `courseId`, `status`) | 🔒 Đã đăng nhập |
| `POST`   | `/progress`     | Ghi nhận tiến độ mới (`userId` inject từ token)                    | 🔒 Đã đăng nhập |
| `GET`    | `/progress/:id` | Chi tiết tiến độ (chỉ record của mình; Admin xem được hết)         | 🔒 Đã đăng nhập |
| `PATCH`  | `/progress/:id` | Cập nhật tiến độ (chỉ record của mình)                             | 🔒 Đã đăng nhập |
| `DELETE` | `/progress/:id` | Xóa bản ghi tiến độ (chỉ record của mình)                          | 🔒 Đã đăng nhập |

---

## 🎯 Practice Sessions

| Method   | Endpoint                 | Mô tả                                                                        | Role            |
| -------- | ------------------------ | ---------------------------------------------------------------------------- | --------------- |
| `GET`    | `/practice-sessions`     | Danh sách phiên luyện tập của user (filter: `lessonId`, `status`)            | 🔒 Đã đăng nhập |
| `POST`   | `/practice-sessions`     | Bắt đầu phiên luyện tập mới (`status: pending`; AI fields tự điền)           | 🔒 Đã đăng nhập |
| `GET`    | `/practice-sessions/:id` | Chi tiết phiên luyện tập (chỉ session của mình)                              | 🔒 Đã đăng nhập |
| `PATCH`  | `/practice-sessions/:id` | Cập nhật `audioFileUrl`, `referenceAudio`, `duration` (AI fields bị loại bỏ) | 🔒 Đã đăng nhập |
| `DELETE` | `/practice-sessions/:id` | Xóa phiên luyện tập (chỉ session của mình)                                   | 🔒 Đã đăng nhập |

---

## 🔥 Streaks

| Method   | Endpoint       | Mô tả                                      | Role            |
| -------- | -------------- | ------------------------------------------ | --------------- |
| `GET`    | `/streaks`     | Streak của user đang đăng nhập             | 🔒 Đã đăng nhập |
| `POST`   | `/streaks`     | Khởi tạo streak (`userId` inject từ token) | 🔒 Đã đăng nhập |
| `GET`    | `/streaks/:id` | Chi tiết streak (chỉ record của mình)      | 🔒 Đã đăng nhập |
| `PATCH`  | `/streaks/:id` | Cập nhật streak (chỉ record của mình)      | 🔒 Đã đăng nhập |
| `DELETE` | `/streaks/:id` | Xóa streak (chỉ record của mình)           | 🔒 Đã đăng nhập |

---

## 💳 Subscriptions

| Method   | Endpoint                     | Mô tả                                                                                   | Role            |
| -------- | ---------------------------- | --------------------------------------------------------------------------------------- | --------------- |
| `GET`    | `/subscriptions`             | Danh sách gói đăng ký (`isActive: true`, hardcoded)                                     | Public          |
| `POST`   | `/subscriptions`             | Tạo gói đăng ký mới                                                                     | 🔒 Admin        |
| `GET`    | `/subscriptions/:id`         | Chi tiết gói đăng ký                                                                    | Public          |
| `PATCH`  | `/subscriptions/:id`         | Cập nhật gói đăng ký                                                                    | 🔒 Admin        |
| `DELETE` | `/subscriptions/:id`         | Xóa gói đăng ký                                                                         | 🔒 Admin        |
| `POST`   | `/subscriptions/:id/request` | Yêu cầu mua gói (tạo `UserSubscription` + `TransactionRecord` pending, trả `qrCodeUrl`) | 🔒 Đã đăng nhập |

> **Flow mua gói:** User gửi request → nhận QR → upload proof ảnh → Admin duyệt → `UserSubscription.status: active` + `User.role: learner`

---

## 🧾 Transaction Records

| Method   | Endpoint                                | Mô tả                                                                                       | Role            |
| -------- | --------------------------------------- | ------------------------------------------------------------------------------------------- | --------------- |
| `GET`    | `/transaction-records`                  | Danh sách giao dịch (filter: `userId`, `status`)                                            | 🔒 Đã đăng nhập |
| `POST`   | `/transaction-records`                  | Tạo bản ghi giao dịch thủ công                                                              | 🔒 Đã đăng nhập |
| `GET`    | `/transaction-records/:id`              | Chi tiết giao dịch                                                                          | 🔒 Đã đăng nhập |
| `PATCH`  | `/transaction-records/:id`              | Cập nhật trạng thái giao dịch                                                               | 🔒 Admin        |
| `DELETE` | `/transaction-records/:id`              | Xóa bản ghi giao dịch                                                                       | 🔒 Admin        |
| `PATCH`  | `/transaction-records/:id/upload-proof` | Upload ảnh proof chuyển khoản (chỉ khi `status: pending`; chuyển sang `reviewing`)          | 🔒 Đã đăng nhập |
| `PATCH`  | `/transaction-records/:id/approve`      | Duyệt giao dịch (chỉ khi `reviewing`; set `UserSubscription: active`, `User.role: learner`) | 🔒 Admin        |
| `PATCH`  | `/transaction-records/:id/reject`       | Từ chối giao dịch (chỉ khi `reviewing`; `UserSubscription` vẫn `pending`)                   | 🔒 Admin        |

---

## 🔒 Permissions

| Method   | Endpoint           | Mô tả                 | Role     |
| -------- | ------------------ | --------------------- | -------- |
| `GET`    | `/permissions`     | Danh sách permissions | 🔒 Admin |
| `POST`   | `/permissions`     | Tạo permission mới    | 🔒 Admin |
| `GET`    | `/permissions/:id` | Chi tiết permission   | 🔒 Admin |
| `PATCH`  | `/permissions/:id` | Cập nhật permission   | 🔒 Admin |
| `DELETE` | `/permissions/:id` | Xóa permission        | 🔒 Admin |

---

## 📝 Audit Logs

| Method   | Endpoint          | Mô tả                                                     | Role     |
| -------- | ----------------- | --------------------------------------------------------- | -------- |
| `GET`    | `/audit-logs`     | Danh sách audit log (filter: `actorId`, `action`, `sort`) | 🔒 Admin |
| `POST`   | `/audit-logs`     | Tạo audit log thủ công                                    | 🔒 Admin |
| `GET`    | `/audit-logs/:id` | Chi tiết audit log                                        | 🔒 Admin |
| `DELETE` | `/audit-logs/:id` | Xóa audit log                                             | 🔒 Admin |

---

## 🛡️ Moderator Logs

| Method   | Endpoint              | Mô tả                                                     | Role                 |
| -------- | --------------------- | --------------------------------------------------------- | -------------------- |
| `GET`    | `/moderator-logs`     | Danh sách moderator log (filter: `moderatorId`, `action`) | 🔒 Admin             |
| `POST`   | `/moderator-logs`     | Tạo moderator log                                         | 🔒 Moderator / Admin |
| `GET`    | `/moderator-logs/:id` | Chi tiết moderator log                                    | 🔒 Đã đăng nhập      |
| `DELETE` | `/moderator-logs/:id` | Xóa moderator log                                         | 🔒 Admin             |

---

## 💰 Wallets

| Method  | Endpoint                     | Mô tả                                                       | Role          |
| ------- | ---------------------------- | ----------------------------------------------------------- | ------------- |
| `GET`   | `/wallets/me`                | Xem ví và lịch sử rút tiền của instructor                   | 🔒 Instructor |
| `PUT`   | `/wallets/bank-info`         | Cập nhật thông tin ngân hàng                                | 🔒 Instructor |
| `POST`  | `/wallets/payout`            | Tạo yêu cầu rút tiền                                        | 🔒 Instructor |
| `GET`   | `/wallets/admin/payouts`     | Xem danh sách yêu cầu rút tiền                              | 🔒 Admin      |
| `PATCH` | `/wallets/admin/payouts/:id` | Duyệt / từ chối yêu cầu rút tiền (`approved` \| `rejected`) | 🔒 Admin      |

---

## Ghi chú

- Các trường `userId`, `instructorId` được **inject tự động từ JWT token** — không cần gửi lên.
- Instructor chỉ được thao tác trên **tài nguyên của chính mình** (course, lesson).
- User chỉ được đọc/sửa/xóa **record của chính mình** (progress, streak, practice session).
- Admin **không bị giới hạn** bởi bất kỳ ownership check nào.

---

---

# Luồng Nghiệp Vụ Backend (Business Logic Flows)

> Phần này giải thích chi tiết các luồng xử lý bên trong backend để frontend hiểu rõ tại sao mỗi request hoạt động theo cách đó.

---

## 1. Mô hình dữ liệu tổng quan

```
Course (1) ──────────── Subscription Plan (1)
                              │
                              │ (1-N theo userId)
                              ▼
                        UserSubscription
                              │
                              │ (1-1)
                              ▼
                        TransactionRecord
```

**Các field quan trọng cần nắm:**

| Model               | Field quan trọng        | Ý nghĩa                                                         |
| ------------------- | ----------------------- | --------------------------------------------------------------- |
| `Course`            | `isFree`                | `true` = miễn phí, không cần sub; `false` = cần sub active      |
| `Course`            | `courseType`            | Label phân loại (`foundation`, `technique`, `repertoire`, ...)  |
| `Course`            | `status`                | `draft` → `pending` → `published` → `archived`                  |
| `Subscription`      | `courseId`              | Quan hệ 1-1 với Course (mỗi plan mở 1 khóa học)                 |
| `Subscription`      | `planType`              | `technique` hoặc `repertoire` (dùng để kiểm soát quyền)         |
| `Subscription`      | `qrCodeUrl`             | URL QR chuyển khoản — bắt buộc có trước khi user được mua       |
| `UserSubscription`  | `status`                | `pending` → `active` / `expired` / `cancelled`                  |
| `UserSubscription`  | `startDate` / `endDate` | **Chỉ set tại thời điểm admin approve**, không phải lúc request |
| `TransactionRecord` | `status`                | `pending` → `reviewing` → `success` / `failed`                  |
| `TransactionRecord` | `proofImageUrl`         | Ảnh chứng minh chuyển khoản (Cloudinary)                        |

---

## 2. Luồng xác thực (Auth)

### 2.1 Đăng ký

```
POST /auth/register { name, email, password }
  1. Kiểm tra email đã tồn tại → 400 nếu trùng
  2. Tạo User { role: 'guest' }  ← trường 'role' trong body bị bỏ qua hoàn toàn
  3. Ký accessToken (1h) + refreshToken (7d)
  4. Lưu refreshToken vào DB (field: refreshToken trên User)
  5. Trả về { user, accessToken, refreshToken }
```

### 2.2 Đăng nhập

```
POST /auth/login { email, password }
  1. Tìm user theo email, select thêm field passwordHash (hidden by default)
  2. bcrypt.compare(password, passwordHash) → 401 nếu sai
  3. Kiểm tra user.isActive → 401 nếu bị khóa
  4. Ký cặp token mới
  5. Lưu refreshToken mới vào DB (ghi đè cũ)
  6. Cập nhật lastLoginAt
  7. Trả về { accessToken, refreshToken, user }
```

### 2.3 Refresh Token

```
POST /auth/refresh-token { refreshToken }
  1. Verify JWT signature của refreshToken
  2. Tìm user có refreshToken khớp với DB → 401 nếu không khớp (đã logout)
  3. Ký accessToken mới
  4. Trả về { accessToken }  ← refreshToken KHÔNG thay đổi
```

### 2.4 Logout

```
POST /auth/logout { refreshToken }
  1. Xóa refreshToken khỏi DB (set null)
  2. Từ lần sau, /refresh-token sẽ trả 401 vì token không khớp DB
```

---

## 3. Phân quyền truy cập khóa học

### 3.1 Ba loại `courseType`

| `courseType` | Ai được xem nội dung                                 |
| ------------ | ---------------------------------------------------- |
| `foundation` | Tất cả (kể cả chưa đăng nhập)                        |
| `technique`  | Chỉ user có gói `planType: 'technique'` đang active  |
| `repertoire` | Chỉ user có gói `planType: 'repertoire'` đang active |

> Hai gói **độc lập nhau** — gói `technique` không xem được `repertoire` và ngược lại.

### 3.2 Bảng quyền đầy đủ

| Loại người dùng            | `foundation` | `technique`  | `repertoire` |
| -------------------------- | :----------: | :----------: | :----------: |
| Chưa đăng nhập             |      ✅      |      ❌      |      ❌      |
| Đã login, chưa mua gói     |      ✅      |      ❌      |      ❌      |
| Có gói `technique` active  |      ✅      |      ✅      |      ❌      |
| Có gói `repertoire` active |      ✅      |      ❌      |      ✅      |
| `instructor`               | ✅ (+ draft) | ✅ (+ draft) | ✅ (+ draft) |
| `admin`                    | ✅ (+ draft) | ✅ (+ draft) | ✅ (+ draft) |

### 3.3 Logic server khi `GET /courses` (listing)

```
optionalAuth → parse token nếu có, req.user = null nếu không

getAllowedCourseTypes(user):
  - user = null (chưa login)     → ['foundation']
  - user.role = admin/instructor → null (không filter gì)
  - user có sub active           → ['foundation', planType]  // vd: ['foundation','technique']
  - user không có sub            → ['foundation']

Inject server-side (client KHÔNG thể override):
  queryObj.status = 'published'
  queryObj.courseType = { $in: allowedTypes }
```

> **Quan trọng:** Client không thể gửi `?courseType=technique` để bypass — server ghi đè hoàn toàn query này.

### 3.4 Logic server khi `GET /courses/:id` (chi tiết)

```
1. Tìm course → 404 nếu không tồn tại
2. Nếu admin/instructor → trả về ngay (bypass mọi check)
3. course.status !== 'published' → 404  ← trả 404 (không phải 403) để ẩn sự tồn tại draft
4. course.courseType = 'foundation' → trả về ngay
5. course.courseType ≠ 'foundation':
   - Không có token → 403
   - Tìm UserSubscription active của user, lấy planType
   - planType khớp courseType → ✅
   - Không khớp → 403
```

### 3.5 Logic server khi `GET /lessons/:id` (chi tiết bài học)

```
1. Tìm lesson → 404 nếu không tồn tại
2. Nếu admin/instructor → trả về ngay
3. Load course cha từ lesson.courseId
4. course.isFree = true → trả về ngay
5. course.isFree = false:
   - Tìm UserSubscription { userId, status:'active', endDate > now }
   - Populate subscriptionId để lấy courseId
   - Có sub.subscriptionId.courseId === course._id → ✅
   - Không có → 403 "Subscription required"
```

### 3.6 Instructor tạo khóa học

| Role         | Được tạo `courseType`                   |
| ------------ | --------------------------------------- |
| `admin`      | `foundation`, `technique`, `repertoire` |
| `instructor` | **Chỉ `repertoire`**                    |

---

## 4. Luồng thanh toán (QR thủ công)

### 4.1 Admin setup (cần làm trước)

```
Step 1 – Tạo Course:
  POST /courses { title, isFree: false, courseType: 'technique', ... }

Step 2 – Tạo Subscription Plan và link vào Course:
  POST /subscriptions {
    name: "...",
    courseId: "<course_id>",
    price: 199000,
    billingCycle: "monthly",
    qrCodeUrl: "https://cdn.../qr.png"   ← BẮT BUỘC có trước
  }

Step 3 – Publish Course:
  PATCH /courses/:id { status: "published" }
```

### 4.2 User mua gói (5 bước)

```
Step 1 – Duyệt danh sách courses (không cần login):
  GET /courses

Step 2 – Xem các gói subscription:
  GET /subscriptions
  → Tìm plan có courseId khớp khóa muốn mua

Step 3 – Gửi yêu cầu mua:
  POST /subscriptions/:id/request  (Bearer token)
  → Server kiểm tra:
      - plan.isActive = true (plan còn hoạt động)
      - plan.qrCodeUrl tồn tại
      - course.isFree = false (không mua plan cho free course)
      - Không có UserSubscription active cho course này
      - Không có pending request đang chờ cho cùng plan
  → Tạo UserSubscription { status: 'pending' }
  → Tạo TransactionRecord { status: 'pending' }
  → Trả về { transactionRecordId, userSubscriptionId, qrCodeUrl, amount, ... }

Step 4 – User quét QR, chuyển khoản thủ công (ngoài hệ thống)

Step 5 – Upload ảnh chứng minh:
  PATCH /transaction-records/:transactionId/upload-proof  (multipart/form-data, field: proof)
  → Kiểm tra giao dịch thuộc về user này
  → Kiểm tra status = 'pending' → 400 nếu không phải
  → Upload ảnh lên Cloudinary (lenfolk/payment-proofs)
  → TransactionRecord.proofImageUrl = Cloudinary URL
  → TransactionRecord.status: pending → reviewing
```

### 4.3 Admin duyệt / từ chối

```
Xem danh sách chờ duyệt:
  GET /transaction-records?status=reviewing

Duyệt:
  PATCH /transaction-records/:id/approve
  → Kiểm tra status = 'reviewing' → 400 nếu không phải
  → TransactionRecord.status → success
  → TransactionRecord.paidAt = now, reviewedBy = admin._id
  → UserSubscription.status → active
  → UserSubscription.startDate = now         ← tính từ lúc APPROVE
  → UserSubscription.endDate = now + billingCycle
  → User.role: 'guest' → 'learner'           ← CHỈ upgrade nếu đang là guest

Từ chối:
  PATCH /transaction-records/:id/reject { rejectReason?: string }
  → Kiểm tra status = 'reviewing' → 400 nếu không phải
  → TransactionRecord.status → failed, rejectReason được lưu
  → UserSubscription.status → cancelled
  ← User có thể tạo request mới và upload lại
```

> **Lưu ý quan trọng:** `startDate`/`endDate` của subscription tính **từ lúc admin approve**, không phải lúc user request. User không mất thời gian trong thời gian chờ review.

---

## 5. Luồng Wallet & Payout (Instructor)

```
Instructor xem ví:
  GET /wallets/me
  → Trả về balance, totalEarned, lịch sử PayoutRequest

Cập nhật thông tin ngân hàng:
  PUT /wallets/bank-info { bankName, accountName, accountNumber }

Tạo yêu cầu rút tiền:
  POST /wallets/payout { amount }
  → Kiểm tra balance đủ
  → Tạo PayoutRequest { status: 'pending' }
  → Trừ balance tạm thời (escrow)

Admin duyệt:
  PATCH /wallets/admin/payouts/:id { status: 'approved', adminNote?: string }
  → PayoutRequest.status → approved
  → Thực hiện chuyển khoản thực tế (manual)

Admin từ chối:
  PATCH /wallets/admin/payouts/:id { status: 'rejected', adminNote: string }
  → PayoutRequest.status → rejected
  → Hoàn lại balance cho instructor
```

---

## 6. Các edge case & validation quan trọng

| Tình huống                                               | Kết quả server trả về                                  |
| -------------------------------------------------------- | ------------------------------------------------------ |
| Đăng ký email đã tồn tại                                 | `400` Email already in use                             |
| Login sai mật khẩu                                       | `401` Invalid email or password                        |
| Login tài khoản bị khóa (`isActive: false`)              | `401` Account is deactivated                           |
| Xem draft course (không phải admin/instructor)           | `404` (ẩn sự tồn tại, không phải 403)                  |
| Mua plan cho free course                                 | `400` This course is free. No subscription needed      |
| Đã có active subscription cho course                     | `400` Already have an active subscription              |
| Đã có pending request cho cùng plan                      | `400` Already have pending request for this plan       |
| Upload proof khi transaction không phải `pending`        | `400` Transaction is not in pending state              |
| Approve transaction không phải `reviewing`               | `400` Transaction is not in reviewing state            |
| Instructor sửa khóa học của người khác                   | `403` You do not have permission to update this course |
| User sửa progress/streak/practice-session của người khác | `403` You do not have permission                       |
| Tạo plan với courseId không tồn tại                      | `404` Course not found                                 |
| Tạo plan cho free course                                 | `400` Cannot create paid plan for free course          |
| Instructor cố tạo course có courseType ≠ 'repertoire'    | `403` Instructor can only create 'repertoire' courses  |
| Approve → user là guest                                  | `User.role` tự động thành `learner`                    |
| Approve → user đã là learner/instructor/admin            | Role **không thay đổi**                                |

---

## 7. Middleware chain quan trọng

| Middleware                | Hành vi                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `verifyToken`             | Yêu cầu Bearer JWT hợp lệ; trả `401` nếu thiếu hoặc hết hạn                |
| `optionalAuth`            | Parse JWT nếu có, `req.user = null` nếu không có / lỗi — **không trả 401** |
| `verifyAdmin`             | Yêu cầu `role === 'admin'`; trả `403` nếu không phải                       |
| `verifyInstructorOrAdmin` | Yêu cầu `role === 'instructor'` hoặc `'admin'`                             |
| `verifyModerator`         | Yêu cầu `role === 'moderator'`                                             |

> `GET /courses` và `GET /courses/:id` dùng `optionalAuth` (không phải `verifyToken`) để phục vụ cả người chưa đăng nhập xem `foundation` courses.

---

## 8. Soft-delete pattern (Users)

```
DELETE /users/:id
  → Không xóa document khỏi MongoDB
  → Chỉ set: deletedAt = Date.now()

Mongoose pre-hook tự động lọc:
  User.find({ deletedAt: null })  ← áp dụng cho MỌI query find
  → User bị soft-delete sẽ không bao giờ xuất hiện trong kết quả
```
