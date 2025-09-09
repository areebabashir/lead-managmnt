# Facebook Lead Ads Integration with Zapier

This guide will help you set up Facebook Lead Ads to automatically create leads in your Melnitz CRM system using Zapier.

## 🚀 Quick Setup

### 1. Backend Setup (Already Done ✅)

The backend is already configured with webhook endpoints:
- **Facebook Lead Webhook**: `POST /api/webhooks/facebook-lead`
- **General Zapier Webhook**: `POST /api/webhooks/zapier-lead`
- **Test Webhook**: `POST /api/webhooks/test`

### 2. Zapier Setup

#### Step 1: Create a New Zap
1. Go to [Zapier.com](https://zapier.com) and sign in
2. Click "Create Zap"
3. Search for "Facebook Lead Ads" as your trigger
4. Connect your Facebook account

#### Step 2: Configure Facebook Lead Ads Trigger
1. Select "New Lead" as the trigger event
2. Choose your Facebook Page
3. Select the specific Lead Ad form (or leave blank for all forms)
4. Test the trigger to make sure it's working

#### Step 3: Configure Webhook Action
1. Search for "Webhooks by Zapier" as your action
2. Choose "POST" as the method
3. Set the URL to: `http://your-domain.com/api/webhooks/facebook-lead`
   - For local testing: `http://localhost:8000/api/webhooks/facebook-lead`
   - For production: `https://your-domain.com/api/webhooks/facebook-lead`

#### Step 4: Configure Webhook Data
Map the Facebook Lead Ads data to the webhook payload:

```json
{
  "lead_id": "{{lead_id}}",
  "ad_id": "{{ad_id}}",
  "form_id": "{{form_id}}",
  "page_id": "{{page_id}}",
  "created_time": "{{created_time}}",
  "first_name": "{{first_name}}",
  "last_name": "{{last_name}}",
  "email": "{{email}}",
  "phone_number": "{{phone_number}}",
  "full_name": "{{full_name}}",
  "company_name": "{{company_name}}",
  "job_title": "{{job_title}}",
  "city": "{{city}}",
  "state": "{{state}}",
  "zip_code": "{{zip_code}}",
  "country": "{{country}}",
  "campaign_name": "{{campaign_name}}",
  "adset_name": "{{adset_name}}",
  "ad_name": "{{ad_name}}",
  "form_name": "{{form_name}}",
  "zapier_webhook_id": "{{zap_id}}"
}
```

#### Step 5: Test and Activate
1. Test the webhook to ensure it's working
2. Activate your Zap

## 📋 Available Webhook Endpoints

### Facebook Lead Ads Webhook
**URL**: `POST /api/webhooks/facebook-lead`

**Expected Payload**:
```json
{
  "lead_id": "123456789",
  "ad_id": "987654321",
  "form_id": "456789123",
  "page_id": "789123456",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+1234567890",
  "company_name": "Acme Corp",
  "job_title": "Manager",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "US",
  "campaign_name": "Summer Campaign",
  "adset_name": "Retargeting",
  "ad_name": "Product Ad",
  "form_name": "Contact Form",
  "zapier_webhook_id": "zap_123456"
}
```

### General Zapier Webhook
**URL**: `POST /api/webhooks/zapier-lead`

**Expected Payload**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1987654321",
  "company": "Tech Corp",
  "job_title": "Developer",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "country": "US",
  "lead_source": "website",
  "campaign": "SEO Campaign",
  "notes": "Interested in premium package",
  "zapier_webhook_id": "zap_789012",
  "source_platform": "google_ads"
}
```

### Test Webhook
**URL**: `POST /api/webhooks/test`

**Response**:
```json
{
  "success": true,
  "message": "Webhook endpoint is working",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "receivedData": { /* your payload */ }
}
```

## 🔧 Customization Options

### Lead Assignment
By default, leads are assigned to the Super Admin user. To customize:

1. Modify the `receiveFacebookLead` function in `webhookController.js`
2. Change the assignment logic to assign to specific users based on:
   - Lead source
   - Geographic location
   - Campaign type
   - Round-robin assignment

### Lead Status and Priority
Default values:
- **Status**: `prospect`
- **Priority**: `medium`
- **Lead Type**: `new`

To customize, modify the webhook controller.

### Custom Fields
Facebook Lead Ads custom fields are automatically added as notes. To store them as separate fields:

1. Update the contact model to include custom field schemas
2. Modify the webhook controller to map custom fields

## 🧪 Testing

### Test the Webhook Locally
```bash
curl -X POST http://localhost:8000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test Facebook Lead Webhook
```bash
curl -X POST http://localhost:8000/api/webhooks/facebook-lead \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test_123",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone_number": "+1234567890",
    "zapier_webhook_id": "test_zap"
  }'
```

## 📊 Lead Tracking

### View Facebook Leads
1. Go to the Leads page in your CRM
2. Filter by source: "facebook"
3. All Facebook leads will be marked with source "facebook"

### Lead Analytics
The system tracks:
- Lead source (Facebook, Instagram, etc.)
- Campaign information
- Ad details
- Form information
- Creation timestamp
- Assignment information

## 🔒 Security

### Webhook Security (Recommended)
For production, consider adding:
1. **API Key Authentication**: Add API key validation
2. **IP Whitelisting**: Restrict to Zapier IPs
3. **Signature Verification**: Verify webhook signatures
4. **Rate Limiting**: Prevent abuse

### Example with API Key
```javascript
// In webhookController.js
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY;

export const receiveFacebookLead = async (req, res) => {
    // Verify API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== WEBHOOK_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    
    // ... rest of the function
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Webhook not receiving data**
   - Check if the server is running
   - Verify the webhook URL is correct
   - Check Zapier logs for errors

2. **Leads not appearing in CRM**
   - Check server logs for errors
   - Verify database connection
   - Check if user assignment is working

3. **Duplicate leads**
   - The system checks for existing leads by email/phone and Facebook Lead ID
   - If duplicates still occur, check the duplicate detection logic

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📈 Next Steps

1. **Set up Facebook Lead Ads** in your Facebook Ads Manager
2. **Create your Zap** in Zapier
3. **Test the integration** with a test lead
4. **Monitor the leads** in your CRM
5. **Customize** the integration based on your needs

## 🆘 Support

If you need help:
1. Check the server logs for error messages
2. Test the webhook endpoints manually
3. Verify your Zapier configuration
4. Check Facebook Lead Ads setup

---

**Note**: Make sure your backend server is running and accessible from the internet for Zapier to send webhooks to it.
