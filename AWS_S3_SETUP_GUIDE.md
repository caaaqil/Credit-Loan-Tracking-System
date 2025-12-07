# AWS S3 Setup Guide for Image Storage

This guide will walk you through setting up AWS S3 to store loan and payment images in your credit loan tracking system.

## What is AWS S3?

Amazon S3 (Simple Storage Service) is a cloud storage service where you can store files (images, documents, etc.). It's:
- **Reliable**: Your files are safely stored in the cloud
- **Scalable**: Can handle any number of images
- **Affordable**: Free tier includes 5GB storage for 12 months
- **Accessible**: Images can be accessed from anywhere

---

## Step 1: Create an AWS Account

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Fill in your email, password, and AWS account name
4. Choose **"Personal"** account type
5. Enter your contact information and credit card details
   - ⚠️ **Note**: AWS requires a credit card but offers a free tier. You won't be charged if you stay within free tier limits.
6. Verify your phone number
7. Choose the **"Basic Support - Free"** plan
8. Complete the sign-up process

---

## Step 2: Create an S3 Bucket

A "bucket" is like a folder where your images will be stored.

1. **Sign in to AWS Console**: [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. **Search for S3**: In the search bar at the top, type "S3" and click on it
3. **Create Bucket**:
   - Click the orange **"Create bucket"** button
   - **Bucket name**: Enter a unique name (e.g., `credit-loan-images-yourname`)
     - Must be globally unique
     - Use lowercase letters, numbers, and hyphens only
   - **AWS Region**: Choose the region closest to you (e.g., `us-east-1` for US East)
   - **Block Public Access**: Keep all checkboxes CHECKED (for security)
   - **Bucket Versioning**: Disable (not needed)
   - **Tags**: Skip (optional)
   - **Default encryption**: Enable (recommended for security)
   - Click **"Create bucket"**

---

## Step 3: Create IAM User with S3 Access

IAM (Identity and Access Management) lets you create credentials for your application.

1. **Go to IAM**:
   - In the AWS Console search bar, type "IAM" and click on it
   
2. **Create User**:
   - Click **"Users"** in the left sidebar
   - Click **"Create user"** button
   - **User name**: Enter `credit-loan-app` (or any name you prefer)
   - Click **"Next"**

3. **Set Permissions**:
   - Choose **"Attach policies directly"**
   - In the search box, type `S3`
   - Check the box next to **"AmazonS3FullAccess"**
     - ⚠️ For production, you should create a custom policy with limited permissions, but this is fine for development
   - Click **"Next"**
   - Click **"Create user"**

4. **Create Access Keys**:
   - Click on the user you just created (`credit-loan-app`)
   - Click the **"Security credentials"** tab
   - Scroll down to **"Access keys"** section
   - Click **"Create access key"**
   - Choose **"Application running outside AWS"**
   - Click **"Next"**
   - (Optional) Add a description tag
   - Click **"Create access key"**
   - **⚠️ IMPORTANT**: You'll see your **Access Key ID** and **Secret Access Key**
     - **Copy both values immediately** - you won't be able to see the secret key again!
     - Keep them secure - never share them or commit them to Git

---

## Step 4: Configure Your Application

1. **Open your `.env` file**:
   ```bash
   cd ~/Documents/personal-projects/credit\ loan\ tracking\ system/backend
   nano .env
   ```
   (Or use any text editor you prefer)

2. **Update the S3 configuration** with your actual values:
   ```env
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=AKIA...your-actual-access-key-id
   AWS_SECRET_ACCESS_KEY=your-actual-secret-access-key
   AWS_REGION=us-east-1
   S3_BUCKET=credit-loan-images-yourname
   ```

   Replace:
   - `AWS_ACCESS_KEY_ID`: Paste the Access Key ID from Step 3
   - `AWS_SECRET_ACCESS_KEY`: Paste the Secret Access Key from Step 3
   - `AWS_REGION`: Use the region where you created your bucket (e.g., `us-east-1`)
   - `S3_BUCKET`: Use the exact bucket name you created in Step 2

3. **Save the file** (Ctrl+O, Enter, Ctrl+X if using nano)

4. **Restart your backend server**:
   - Press Ctrl+C in the terminal running the backend
   - Run: `npm run dev`

---

## Step 5: Test Image Upload

1. **Go to your application**: http://localhost:5174
2. **Create a new loan or payment** with an image:
   - Click "Add Loan" or "Add Payment"
   - Fill in the details
   - Upload an image file
   - Submit the form

3. **Verify in AWS S3**:
   - Go back to AWS Console → S3
   - Click on your bucket
   - You should see a folder structure like: `loan-{id}/` or `payment-{id}/`
   - Click into the folder to see your uploaded image

4. **View images in your app**:
   - Go to a customer/shop detail page
   - Find a loan/payment with images
   - Click the image icon (camera icon)
   - The ImageGallery should open and display your uploaded images

---

## Troubleshooting

### Error: "Access Denied"
- Check that your IAM user has `AmazonS3FullAccess` policy
- Verify your Access Key ID and Secret Access Key are correct in `.env`

### Error: "Bucket does not exist"
- Make sure the bucket name in `.env` matches exactly (case-sensitive)
- Verify you're using the correct AWS region

### Images not showing
- Check browser console for errors (F12 → Console tab)
- Verify the backend is using the correct S3 configuration
- Make sure you restarted the backend after updating `.env`

### Backend says "S3 not configured"
- Ensure all four S3 environment variables are set in `.env`
- Make sure the values are not the placeholder values from `.env.example`
- Restart the backend server

---

## Cost Information

**AWS Free Tier** (first 12 months):
- 5 GB of S3 storage
- 20,000 GET requests
- 2,000 PUT requests per month

**After Free Tier**:
- Storage: ~$0.023 per GB per month
- Requests: Very minimal cost for typical usage

For a small loan tracking system, you'll likely stay well within the free tier limits.

---

## Security Best Practices

1. **Never commit `.env` to Git** - it's already in `.gitignore`
2. **Use IAM roles** instead of access keys when deploying to AWS (EC2, Lambda, etc.)
3. **Enable bucket encryption** (already done if you followed Step 2)
4. **Keep Block Public Access enabled** - your app accesses S3 via AWS SDK, not public URLs
5. **Rotate access keys periodically** (every 90 days recommended)

---

## Alternative: Local File Storage (Development Only)

If you don't want to use AWS S3 for development, you can implement local file storage:

**Pros**:
- No AWS account needed
- No cost
- Works offline

**Cons**:
- Files stored on your computer only
- Not suitable for production
- Harder to scale

Let me know if you'd like me to implement local file storage as an alternative!

---

## Need Help?

If you encounter any issues during setup:
1. Check the error messages in the backend terminal
2. Check the browser console (F12)
3. Verify all environment variables are set correctly
4. Make sure you restarted the backend after changing `.env`

Feel free to ask for help with any step!
