# API URL Configuration - Lost & Found Services

## ✅ Updated Configuration

### Frontend Environment Variables (.env)

```env
# FOUND Service (Original) - Uses existing Render backend
VITE_API_URL="https://kiitsaathi-4.onrender.com"

# LOST Service (New) - Uses new Render backend for application system
VITE_LOST_FOUND_API_URL="https://kiitsaathi-lost-portal.onrender.com"
```

---

## 📋 Service Routing

### FOUND Items (Original System)
- **API URL**: `https://kiitsaathi-4.onrender.com`
- **Used For**: 
  - Found items submission
  - Found items listing
  - Found items search
  - Original payment flow
- **Status**: Unchanged, working as before

### LOST Items (New Application System)
- **API URL**: `https://kiitsaathi-lost-portal.onrender.com`
- **Used For**:
  - Lost item application submissions
  - Viewing applications
  - Application payment (₹5 unlock)
  - Payment verification
- **Status**: Now uses Render deployment

---

## 🔧 Backend Endpoints

### Lost Portal Backend (https://kiitsaathi-lost-portal.onrender.com)

```
POST /submit-lost-item-application
- Submit application with photo for lost items

POST /create-application-unlock-order
- Create Razorpay order for ₹5 unlock

POST /verify-application-unlock-payment
- Verify payment and unlock contact details
```

### Original Backend (https://kiitsaathi-4.onrender.com)

```
All original found item endpoints remain unchanged
```

---

## 📝 Code Usage

### In ApplicationSubmissionForm.tsx
```typescript
// Uses VITE_LOST_FOUND_API_URL
fetch(`${import.meta.env.VITE_LOST_FOUND_API_URL}/submit-lost-item-application`, {
  // Application submission
})
```

### In ApplicationPaymentComponent.tsx
```typescript
// Uses VITE_LOST_FOUND_API_URL
fetch(`${import.meta.env.VITE_LOST_FOUND_API_URL}/create-application-unlock-order`, {
  // Payment order creation
})

fetch(`${import.meta.env.VITE_LOST_FOUND_API_URL}/verify-application-unlock-payment`, {
  // Payment verification
})
```

### In Original Found Items Code
```typescript
// Uses VITE_API_URL (unchanged)
fetch(`${import.meta.env.VITE_API_URL}/api/found-items`, {
  // Original found items functionality
})
```

---

## ✅ Configuration Summary

| Service | API URL | Purpose |
|---------|---------|---------|
| **FOUND Items** | `https://kiitsaathi-4.onrender.com` | Original system (unchanged) |
| **LOST Items** | `https://kiitsaathi-lost-portal.onrender.com` | New application system |

---

## 🚀 Deployment Status

- ✅ Frontend `.env` updated with Render URL
- ✅ LOST service points to: `https://kiitsaathi-lost-portal.onrender.com`
- ✅ FOUND service points to: `https://kiitsaathi-4.onrender.com` (unchanged)
- ✅ Both services can run independently

---

## 🧪 Testing Checklist

After deploying frontend with new environment variable:

### LOST Items (New System)
- [ ] User can apply for lost items
- [ ] Photo uploads successfully
- [ ] Application submits to Render backend
- [ ] Owner can view applications
- [ ] Payment flow works (₹5 unlock)
- [ ] Contact details reveal after payment
- [ ] Button stays greyed after refresh

### FOUND Items (Original System)
- [ ] Can submit found items
- [ ] Can view found items
- [ ] Search works
- [ ] Original payment flow works
- [ ] No regressions

---

## 📌 Important Notes

1. **Two Separate Backends**: 
   - LOST items use new backend with application system
   - FOUND items use original backend (unchanged)

2. **Environment Variables**:
   - `VITE_API_URL` - Original backend (FOUND items)
   - `VITE_LOST_FOUND_API_URL` - New backend (LOST items with applications)

3. **Deployment**:
   - Frontend needs redeployment to pick up new environment variable
   - Backend already deployed on Render at `https://kiitsaathi-lost-portal.onrender.com`

4. **No Impact on FOUND Service**:
   - All original functionality remains intact
   - No changes to found items flow

---

## 🎯 Next Steps

1. ✅ Environment variable updated in frontend
2. ⏳ Redeploy frontend to Vercel
3. ⏳ Test LOST items application flow
4. ⏳ Test FOUND items (ensure no regression)
5. ⏳ Monitor both Render backends for health

---

## 🔗 Quick Links

- **LOST Backend (New)**: https://kiitsaathi-lost-portal.onrender.com
- **FOUND Backend (Original)**: https://kiitsaathi-4.onrender.com
- **Frontend**: https://kiitsaathi.vercel.app

---

## ✅ Configuration Complete!

The Lost & Found portal now uses the correct Render URL for the LOST service while keeping the FOUND service on the original backend. Both services will work independently! 🎉
