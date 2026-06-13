# Luồng thanh toán Khóa học & Tiết mục (SePay QR) — Hướng dẫn tích hợp Mobile

> Thanh toán qua **chuyển khoản ngân hàng + QR động SePay**. SePay xác nhận **tự động** qua webhook,
> mobile **không** cần upload minh chứng, **không** cần admin duyệt.

Tất cả endpoint dưới đây (trừ webhook của SePay) đều cần header:

```
Authorization: Bearer <JWT access token>
```

Base URL: `/api` (vd `https://lenfolk-project.onrender.com/api`).

---

## Tổng quan luồng (3 bước)

```
┌────────┐   1. POST /courses/:id/purchase        ┌────────┐
│ Mobile │ ─────────────────────────────────────▶ │ Server │  tạo Enrollment(pending)
│        │ ◀───────── payCode + sepayQrUrl ─────── │        │  + TransactionRecord(pending)
└────────┘                                         └────────┘
     │ 2. Hiện QR (sepayQrUrl) → user quét & chuyển khoản
     │                                                  ▲
     │                              SePay phát hiện tiền vào
     │                              POST /payments/sepay/webhook (server-to-server)
     │                              → đối chiếu payCode + số tiền
     │                              → Enrollment active, isPaid=true
     │
     │ 3. GET /transaction-records/:id/status  (poll 3–5s)
     └──────────────── isPaid=true ──▶ đóng màn QR, mở nội dung
```

---

## Bước 1 — Tạo đơn & lấy QR

Tùy người dùng mua **khóa học** hay **tiết mục**:

| Mua | Method & Endpoint |
|-----|-------------------|
| Khóa học | `POST /api/courses/:id/purchase` |
| Tiết mục (performance) | `POST /api/performances/:id/purchase` |

**Body** (tùy chọn):

```json
{ "couponCode": "SALE50" }   // bỏ trống nếu không có mã giảm giá
```

**Response `201`** (cùng cấu trúc cho cả 2):

```json
{
  "success": true,
  "data": {
    "message": "Payment request created. Scan the SePay QR and transfer — your access is activated automatically.",
    "transactionId": "665f...c01",
    "payCode": "LF1A2B3C4D",
    "sepayQrUrl": "https://qr.sepay.vn/img?acc=0123456789&bank=MBBank&amount=199000&des=LF1A2B3C4D",
    "bankCode": "MBBank",
    "accountNumber": "0123456789",
    "accountName": "CONG TY LENFOLK",
    "originalAmount": 199000,
    "discountAmount": 0,
    "amountToPay": 199000,
    "currency": "VND",
    "courseName": "..."            // hoặc "performanceName" với tiết mục
  }
}
```

**Mobile cần lưu:** `transactionId` (để poll ở bước 3) và `payCode`.

**Hiển thị QR:** load thẳng ảnh từ `sepayQrUrl` (đây là ảnh VietQR động, đã điền sẵn số tiền + nội dung CK).
Nếu muốn tự render QR/hiển thị thông tin chuyển khoản thủ công, dùng:
`accountNumber` + `bankCode` + `amountToPay` + **nội dung CK = `payCode`** (bắt buộc đúng để khớp đơn).

### Các lỗi `400`/`404` thường gặp ở bước 1
| Tình huống | message |
|-----------|---------|
| Khóa học/tiết mục miễn phí | `This course is free...` |
| Chưa published | `... is not available for purchase.` |
| Đã có quyền truy cập | `You already have active access ...` |
| Đã có đơn pending | `You already have a pending payment request ...` |
| Khóa học chưa có giá (CoursePlan) | `No active price plan found ...` |
| Chưa cấu hình tài khoản nhận tiền | `Payment account is not configured yet...` |
| Coupon sai/hết hạn | `Invalid or inactive coupon code` / `Coupon has expired` ... |

---

## Bước 2 — User quét QR & chuyển khoản

Người dùng quét QR bằng app ngân hàng và chuyển khoản. **Mobile không gọi API nào ở bước này.**

Phía sau, SePay phát hiện tiền vào và tự gọi `POST /api/payments/sepay/webhook` (server-to-server, có Api Key).
Server đối chiếu `payCode` trong nội dung CK + số tiền (chống chuyển thiếu) → kích hoạt:
- `Enrollment` → `active`, `isPaid = true` (course: có hạn theo chu kỳ; performance: vĩnh viễn).
- Cộng ví instructor, set `User.isSubscribed = true`.
- **Idempotent**: chuyển/khớp lại không cộng tiền 2 lần.

---

## Bước 3 — Poll trạng thái (mobile)

Sau khi hiện QR, mobile gọi định kỳ:

```
GET /api/transaction-records/:id/status
```

> `:id` = `transactionId` nhận ở bước 1. Chỉ chủ giao dịch mới gọi được (token).

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "transactionId": "665f...c01",
    "status": "pending",          // pending | success | failed | refunded
    "isPaid": false,              // true khi SePay đã xác nhận
    "amount": 199000,
    "currency": "VND",
    "payCode": "LF1A2B3C4D",
    "paidAt": null,               // thời điểm thanh toán khi success
    "transactionType": "course"   // hoặc "performance"
  }
}
```

**Quy tắc cho mobile:**
- Poll mỗi **3–5 giây** trong khi màn QR đang mở.
- Khi `isPaid === true` (`status: "success"`) → **đóng màn QR, mở nội dung** (hoặc gọi lại API chi tiết khóa học/tiết mục, hoặc `GET /enrollments/me`).
- Nên đặt **timeout** (vd 10–15 phút) — quá lâu thì hiện nút "Tôi đã chuyển khoản / Thử lại" và cho phép thoát; đơn `pending` vẫn được kích hoạt tự động nếu tiền về sau đó.
- `403` → giao dịch không thuộc user; `404` → sai `transactionId`.

---

## Lưu ý kỹ thuật cho dev

- **Nội dung chuyển khoản phải chứa `payCode`** (vd `LF1A2B3C4D`) — đây là khóa khớp đơn của webhook. QR động đã nhúng sẵn nên không lo nếu user quét QR; chỉ rủi ro khi user tự nhập tay.
- **Không poll trước khi user chuyển khoản xong** vẫn OK, chỉ là `pending` cho tới khi tiền về.
- **Webhook là nguồn kích hoạt duy nhất.** Không có luồng upload ảnh / admin duyệt tay nữa.
- Quyền truy cập thực tế đọc từ **Enrollment** (`isPaid`), không phải từ `User.isSubscribed`.
- Tài khoản nhận tiền cấu hình ở server qua env: `SEPAY_ACCOUNT_NUMBER`, `SEPAY_BANK_CODE`, `SEPAY_ACCOUNT_NAME`, `SEPAY_WEBHOOK_API_KEY`.

---

## Tóm tắt endpoint

| Bước | Method | Endpoint | Auth | Mục đích |
|------|--------|----------|------|----------|
| 1 | POST | `/api/courses/:id/purchase` | Bearer | Tạo đơn mua khóa học → QR |
| 1 | POST | `/api/performances/:id/purchase` | Bearer | Tạo đơn mua tiết mục → QR |
| 3 | GET | `/api/transaction-records/:id/status` | Bearer | Poll trạng thái thanh toán |
| (server) | POST | `/api/payments/sepay/webhook` | Api Key | SePay gọi — **mobile không dùng** |
