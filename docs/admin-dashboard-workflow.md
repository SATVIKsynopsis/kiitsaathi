# Admin Dashboard - Complete Workflow Documentation

## 🎯 Overview
The Admin Dashboard is the central control panel for KIIT Saathi, managing all user submissions across multiple services.

---

## 🔥 CRITICAL FIXES APPLIED

### ✅ What Was Fixed:
1. **Lost & Found** - `lost_found_requests` table realtime enabled
2. **Events** - `interview_event_requests` table realtime enabled  
3. **Resale** - `resale_listings` table realtime enabled
4. **Contacts** - `contacts` table realtime enabled
5. **Real-time notifications** added for ALL modules with rich descriptions
6. **Live status indicator** shows when real-time updates are active
7. **Console logging** for debugging real-time events

---

## 📋 Module-by-Module Workflow

### 1️⃣ LOST & FOUND

**User Flow:**
1. User visits `/lost-and-found`
2. User clicks "Post Lost Item" or "Post Found Item"
3. User fills form (title, description, location, category, contact details)
4. User submits → Goes to `lost_found_requests` table with `status: 'pending'`

**Admin Flow:**
1. Admin receives **instant notification**: "🕵️ New Lost & Found: [Item Title]"
2. Admin sees item in dashboard "Lost & Found" tab
3. Admin reviews details (title, description, image, contact info)
4. Admin **Approves** → Edge function `admin-approve-lost-item`:
   - Creates public entry in `lost_and_found_items` table
   - Updates request status to `'approved'`
   - Item goes **LIVE** on public Lost & Found page
5. Admin **Rejects** → Edge function `admin-reject-lost-item`:
   - Updates status to `'rejected'`
   - Stores rejection reason
   - User is notified (future: email notification)

**Public Site:**
- Approved items appear at `/lost-and-found` for all users
- Users can browse, search, filter items
- Users pay ₹19 to unlock contact details

---

### 2️⃣ EVENTS (Interview/Society Events)

**User Flow:**
1. User/Society submits event request through form
2. Goes to `interview_event_requests` table with `status: 'pending'`

**Admin Flow:**
1. Admin receives **instant notification**: "📅 New Event Request: [Event Name]"
2. Admin sees event in dashboard "Events" tab
3. Admin reviews event details (name, society, date, venue, description)
4. Admin **Approves** → Edge function `admin-approve-event`:
   - Creates entry in `calendar_events` table with `validation: true`
   - Updates request status to `'approved'`
   - Event goes **LIVE** on calendar/events page
5. Admin **Rejects** → Edge function `admin-reject-event`:
   - Updates status to `'rejected'`
   - Stores rejection reason

**Public Site:**
- Approved events appear on campus calendar
- Events show date, time, venue, society info

---

### 3️⃣ RESALE MARKETPLACE

**User Flow:**
1. User lists item for resale at `/resale/new-listing`
2. Goes to `resale_listings` table with `status: 'pending'`

**Admin Flow:**
1. Admin receives **instant notification**: "🛍️ New Resale Listing: [Title]"
2. Admin sees listing in dashboard "Resale" tab
3. Admin reviews listing (images, price, description, condition)
4. Admin **Approves** → Edge function `moderate-resale-listing`:
   - Updates listing `status: 'active'`
   - Listing goes **LIVE** on resale marketplace
5. Admin **Rejects** → Edge function `moderate-resale-listing`:
   - Updates status to `'rejected'`
   - Stores rejection reason
   - Seller is notified

**Public Site:**
- Approved listings appear at `/resale/browse`
- Users can buy, chat with sellers, track orders

---

### 4️⃣ CONTACT SUBMISSIONS

**User Flow:**
1. User submits contact form (name, email, subject, message)
2. Goes to `contacts` table with `status: 'new'`

**Admin Flow:**
1. Admin receives **instant notification**: "💬 New Contact Message: [Subject]"
2. Admin sees message in dashboard "Contacts" tab
3. Admin reads message
4. Admin updates status:
   - `'new'` → Unread
   - `'read'` → Viewed  
   - `'resolved'` → Handled

**Note:** Contacts don't require approval - they're just messages for admin review.

---

## 🔴 Real-Time Features

### Live Updates (Auto-Sync)
- All 4 modules have real-time subscriptions
- New submissions appear **instantly** without manual refresh
- Green "Live Updates Active" indicator shows real-time is working

### Notifications
Each module shows rich toast notifications:
- **Lost & Found**: "🕵️ New Lost & Found: ID Card" - "Lost item submitted"
- **Events**: "📅 New Event Request: Tech Fest" - "KESC - Workshop"  
- **Resale**: "🛍️ New Resale Listing: iPhone 13" - "Price: ₹35000"
- **Contacts**: "💬 New Contact Message: Bug Report" - "From: John Doe"

### Manual Refresh
- "Refresh" button available if needed
- Fetches latest data from all tables

---

## 🔐 Security & Access Control

### Admin Authentication
- Only users with `is_admin: true` in `profiles` table can access dashboard
- Admin email: `adityash8997@gmail.com`
- Admin verification via `get_current_user_role()` function

### Row-Level Security (RLS)
All request tables have RLS policies:
- Users can view their own submissions
- Admins can view ALL submissions
- Admins can update/approve/reject submissions

---

## 🐛 Debugging

### Console Logs
All real-time events are logged:
```
🔔 Lost & Found real-time event: { eventType: 'INSERT', new: {...} }
```

### Check Real-Time Status
1. Look for green "Live Updates Active" indicator
2. Check browser console for subscription confirmations
3. Test by submitting new item from another browser tab

### Common Issues
- **No notifications?** → Check if tables are in `supabase_realtime` publication
- **Items not showing?** → Verify admin user has `is_admin: true`
- **Real-time not working?** → Check browser console for connection errors

---

## ✅ Testing Checklist

### For Each Module:
1. ✅ User can submit (Lost & Found, Event, Resale, Contact)
2. ✅ Submission appears in admin dashboard instantly
3. ✅ Admin receives toast notification with details
4. ✅ Admin can view full submission details
5. ✅ Admin can approve/reject (except contacts)
6. ✅ Approved items go live on public site
7. ✅ Real-time updates work without manual refresh

---

## 🚀 Production-Ready Checklist

- ✅ All tables have realtime enabled
- ✅ All edge functions tested
- ✅ All RLS policies secure
- ✅ Real-time notifications working
- ✅ Admin authentication verified
- ✅ Approval workflow end-to-end tested
- ✅ Public site displays approved items
- ✅ Error handling and fallbacks
- ✅ Console logging for debugging

---

## 📞 Support

If submissions aren't appearing:
1. Verify user is logged in as admin (`adityash8997@gmail.com`)
2. Check browser console for errors
3. Verify real-time is active (green indicator)
4. Try manual refresh button
5. Check if item exists in database with correct status

---

**Last Updated:** 2025-10-01  
**Status:** ✅ Production Ready  
**All Systems:** ✅ Operational
