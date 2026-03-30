import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { portfolioDB, messagesDB, adminDB, settingsDB, initDB, getDBMode } from './database/index.js';

// Always resolve .env from the project root (one level up from backend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// __filename and __dirname already defined above for dotenv path resolution

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

if (!JWT_SECRET) {
  throw new Error('Missing required JWT_SECRET environment variable');
}

// ==================== EMAIL SERVICE ====================

const SMTP_CONFIGURED =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter = null;

if (SMTP_CONFIGURED) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });

  // Verify connection at startup (non-blocking)
  transporter.verify().then(() => {
    console.log('✅ SMTP connection verified — email sending is active');
  }).catch((err) => {
    console.warn('⚠️  SMTP connection failed at startup:', err.message);
    console.warn('   Contact form will still save messages to DB.');
  });
} else {
  console.warn('⚠️  SMTP not configured. Set SMTP_* env vars to enable email notifications.');
}

/**
 * Send an email with retry logic.
 * @param {object} mailOptions - Nodemailer mail options
 * @param {number} maxRetries - Max retry attempts (default 3)
 * @param {number} delayMs - Base delay in ms between retries (default 1000)
 */
const sendEmailWithRetry = async (mailOptions, maxRetries = 3, delayMs = 1000) => {
  if (!transporter) {
    console.warn('Email skipped: SMTP not configured.');
    return { skipped: true };
  }

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent (attempt ${attempt}):`, info.messageId);
      return info;
    } catch (err) {
      lastError = err;
      console.warn(`📧 Email attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt)); // exponential back-off
      }
    }
  }

  // All retries exhausted — log but don't throw (DB save still succeeded)
  console.error('📧 All email retries failed:', lastError?.message);
  return { failed: true, error: lastError?.message };
};

/**
 * Build a styled HTML email notification for a new contact message.
 */
const buildContactEmailHtml = ({ name, email, message }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
    <!-- Header -->
    <div style="background:linear-gradient(90deg,#7c3aed,#4f46e5);padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">📬 New Portfolio Message</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Someone reached out via your portfolio contact form</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(139,92,246,0.15);">
            <span style="color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
            <span style="color:#e2e8f0;font-size:16px;font-weight:600;">${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(139,92,246,0.15);">
            <span style="color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</span><br/>
            <a href="mailto:${email}" style="color:#818cf8;font-size:16px;text-decoration:none;">${email}</a>
          </td>
        </tr>
      </table>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:20px;">
        <span style="color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:10px;">Message</span>
        <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid rgba(139,92,246,0.15);">
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px;">Sent from your portfolio contact form &bull; ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Build a styled HTML auto-reply email to the sender.
 */
const buildAutoReplyHtml = ({ name }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thanks for reaching out!</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
    <div style="background:linear-gradient(90deg,#7c3aed,#4f46e5);padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Hey ${name}, thanks for reaching out! 👋</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="color:#cbd5e1;font-size:15px;line-height:1.75;margin:0 0 20px;">I've received your message and will get back to you as soon as possible — usually within 24 hours.</p>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.75;margin:0 0 20px;">In the meantime, feel free to check out my portfolio or connect with me on LinkedIn.</p>
      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">— Santhosh</p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid rgba(139,92,246,0.15);">
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px;">This is an automated confirmation. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: CORS_ORIGIN.split(',').map(origin => origin.trim()), credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Initialize default admin password on first run
const initializeAdmin = async () => {
  let admin = await adminDB.get();

  if (admin.username !== (process.env.ADMIN_USERNAME || 'admin')) {
    admin = await adminDB.updateUsername(process.env.ADMIN_USERNAME || 'admin');
  }

  if (admin.password === '$2a$10$YourHashedPasswordHere') {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await adminDB.updatePassword(hashedPassword);
    console.log(`Default admin password set from ADMIN_PASSWORD for user "${admin.username}"`);
    console.log('Please change this after first login!');
  }
};

// ==================== PUBLIC API ROUTES ====================

// Get all portfolio items
app.get('/api/portfolio', async (req, res) => {
  try {
    const { category } = req.query;
    let items;
    
    if (category && category !== 'all') {
      items = await portfolioDB.getByCategory(category);
    } else {
      items = await portfolioDB.getAll();
    }
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single portfolio item
app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const item = await portfolioDB.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get site settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await settingsDB.get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit contact form (with SMTP email notification + auto-reply)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message is too short (minimum 10 characters)' });
    }
    
    // 1. Save message to DB first — this must always succeed
    const newMessage = await messagesDB.create({ name, email, message });

    // 2. Fire-and-forget email notifications (non-blocking)
    if (SMTP_CONFIGURED) {
      const FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

      // Notification to portfolio owner
      sendEmailWithRetry({
        from: `"Portfolio Bot" <${FROM}>`,
        to: FROM,
        replyTo: email,
        subject: `📬 New message from ${name} — Portfolio Contact`,
        html: buildContactEmailHtml({ name, email, message }),
        text: `New contact form submission\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}`,
      }).catch((err) => console.error('Owner notification email error:', err));

      // Auto-reply to sender
      sendEmailWithRetry({
        from: `"Santhosh" <${FROM}>`,
        to: email,
        subject: `Thanks for reaching out, ${name}! 👋`,
        html: buildAutoReplyHtml({ name }),
        text: `Hey ${name}, thanks for reaching out! I've received your message and will get back to you as soon as possible.\n\n— Santhosh`,
      }).catch((err) => console.error('Auto-reply email error:', err));
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: newMessage,
      emailSent: !!SMTP_CONFIGURED,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROTECTED ADMIN API ROUTES ====================

// Admin login
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const admin = await adminDB.get();
    
    if (username !== admin.username) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { username: admin.username, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change admin password
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const admin = await adminDB.get();
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await adminDB.updatePassword(hashedPassword);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages (admin only)
app.get('/api/admin/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await messagesDB.getAll();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
app.patch('/api/admin/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await messagesDB.markAsRead(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
app.delete('/api/admin/messages/:id', authenticateToken, async (req, res) => {
  try {
    const success = await messagesDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create portfolio item
app.post('/api/admin/portfolio', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, category, externalUrl, githubUrl, newImageUrls } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    let images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    if (newImageUrls) {
      try {
        const parsedUrls = JSON.parse(newImageUrls);
        if (Array.isArray(parsedUrls)) {
          images = [...images, ...parsedUrls];
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    const newItem = await portfolioDB.create({
      title,
      description,
      category,
      images,
      externalUrl,
      githubUrl
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update portfolio item
app.put('/api/admin/portfolio/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, category, externalUrl, githubUrl, existingImages, newImageUrls } = req.body;
    
    const item = await portfolioDB.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    let images = item.images;
    
    // Parse existing images if provided
    if (existingImages) {
      try {
        images = JSON.parse(existingImages);
      } catch (e) {
        images = [];
      }
    }
    
    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }
    
    // Add new image URLs
    if (newImageUrls) {
      try {
        const parsedUrls = JSON.parse(newImageUrls);
        if (Array.isArray(parsedUrls)) {
          images = [...images, ...parsedUrls];
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    const updatedItem = await portfolioDB.update(req.params.id, {
      title,
      description,
      category,
      images,
      externalUrl,
      githubUrl
    });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete portfolio item
app.delete('/api/admin/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const item = await portfolioDB.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    // Delete associated images
    if (item.images && item.images.length > 0) {
      item.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    const success = await portfolioDB.delete(req.params.id);
    res.json({ success: true, message: 'Portfolio item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete image from portfolio item
app.delete('/api/admin/portfolio/:id/images', authenticateToken, async (req, res) => {
  try {
    const { imagePath } = req.body;
    const item = await portfolioDB.getById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    // Remove image from array
    const updatedImages = item.images.filter(img => img !== imagePath);
    
    // Delete physical file
    if (!imagePath || !imagePath.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'Invalid image path' });
    }

    const normalizedImagePath = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '..', normalizedImagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    const updatedItem = await portfolioDB.update(req.params.id, { images: updatedImages });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
app.put('/api/admin/settings', authenticateToken, upload.fields([
  { name: 'heroImageFile', maxCount: 1 }, 
  { name: 'aboutImageFile', maxCount: 1 },
  { name: 'titleIconFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.files) {
      if (req.files.heroImageFile && req.files.heroImageFile[0]) {
        updateData.heroImage = `/uploads/${req.files.heroImageFile[0].filename}`;
      }
      if (req.files.aboutImageFile && req.files.aboutImageFile[0]) {
        updateData.aboutImage = `/uploads/${req.files.aboutImageFile[0].filename}`;
      }
      if (req.files.titleIconFile && req.files.titleIconFile[0]) {
        updateData.titleIcon = `/uploads/${req.files.titleIconFile[0].filename}`;
      }
    }

    const updatedSettings = await settingsDB.update(updateData);
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// Start server
const startServer = async () => {
  await initDB();
  await initializeAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Database mode: ${getDBMode()}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
