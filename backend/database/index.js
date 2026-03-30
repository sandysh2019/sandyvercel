import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'database.json');
const USE_MONGODB = process.env.USE_MONGODB === 'true' || !!process.env.MONGODB_URI;

let dbMode = 'json';
let models = null;

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultDB = {
  portfolio: [],
  messages: [],
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: '$2a$10$YourHashedPasswordHere',
    createdAt: new Date().toISOString()
  },
  settings: {
    siteTitle: 'Santhosh Portfolio',
    siteDescription: 'Graphic Designer & Full-Stack AI Developer',
    contactEmail: 'santhoshwe2007@gmail.com',
    phone: '9994723048',
    location: 'Chennai, India',
    heroImage: '',
    aboutImage: '',
    titleIcon: ''
  }
};

function initJsonDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
  }
}

function readJsonDB() {
  initJsonDB();
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

function writeJsonDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function connectMongo() {
  if (!USE_MONGODB || mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('USE_MONGODB=true but MONGODB_URI is missing');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'portfolio_cms'
  });

  const portfolioSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, default: '' },
      category: { type: String, enum: ['graphic-design', 'web-ai'], required: true, index: true },
      images: { type: [String], default: [] },
      externalUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' }
    },
    { timestamps: true }
  );
  portfolioSchema.index({ category: 1, createdAt: -1 });

  const messageSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, index: true },
      message: { type: String, required: true, trim: true },
      read: { type: Boolean, default: false, index: true }
    },
    { timestamps: true }
  );
  messageSchema.index({ read: 1, createdAt: -1 });

  const adminSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true, index: true },
      password: { type: String, required: true }
    },
    { timestamps: true }
  );

  const settingsSchema = new mongoose.Schema(
    {
      siteTitle: { type: String, default: defaultDB.settings.siteTitle },
      siteDescription: { type: String, default: defaultDB.settings.siteDescription },
      contactEmail: { type: String, default: defaultDB.settings.contactEmail },
      phone: { type: String, default: defaultDB.settings.phone },
      location: { type: String, default: defaultDB.settings.location },
      heroImage: { type: String, default: defaultDB.settings.heroImage },
      aboutImage: { type: String, default: defaultDB.settings.aboutImage },
      titleIcon: { type: String, default: defaultDB.settings.titleIcon }
    },
    { timestamps: true }
  );

  models = {
    Portfolio: mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema),
    Message: mongoose.models.Message || mongoose.model('Message', messageSchema),
    Admin: mongoose.models.Admin || mongoose.model('Admin', adminSchema),
    Settings: mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
  };

  dbMode = 'mongodb';
}

async function seedMongoDefaults() {
  const adminCount = await models.Admin.countDocuments();
  if (adminCount === 0) {
    await models.Admin.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: '$2a$10$YourHashedPasswordHere'
    });
  }

  const settingsCount = await models.Settings.countDocuments();
  if (settingsCount === 0) {
    await models.Settings.create(defaultDB.settings);
  }
}

async function migrateJsonToMongoIfNeeded() {
  if (!fs.existsSync(DB_FILE)) return;
  const db = readJsonDB();

  const portfolioCount = await models.Portfolio.countDocuments();
  if (portfolioCount === 0 && db.portfolio.length > 0) {
    await models.Portfolio.insertMany(
      db.portfolio.map((p) => ({
        title: p.title,
        description: p.description || '',
        category: p.category,
        images: p.images || [],
        externalUrl: p.externalUrl || '',
        githubUrl: p.githubUrl || '',
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
      }))
    );
  }

  const messageCount = await models.Message.countDocuments();
  if (messageCount === 0 && db.messages.length > 0) {
    await models.Message.insertMany(
      db.messages.map((m) => ({
        name: m.name,
        email: m.email,
        message: m.message,
        read: !!m.read,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date()
      }))
    );
  }
}

async function initDB() {
  if (USE_MONGODB) {
    await connectMongo();
    await seedMongoDefaults();
    await migrateJsonToMongoIfNeeded();
    return;
  }
  initJsonDB();
}

const portfolioDB = {
  async getAll() {
    if (dbMode === 'mongodb') {
      const docs = await models.Portfolio.find({}).sort({ createdAt: -1 }).lean();
      return docs.map((d) => ({ ...d, id: String(d._id) }));
    }
    const db = readJsonDB();
    return db.portfolio.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    if (dbMode === 'mongodb') {
      const doc = await models.Portfolio.findById(id).lean();
      return doc ? { ...doc, id: String(doc._id) } : null;
    }
    const db = readJsonDB();
    return db.portfolio.find((item) => item.id === id);
  },

  async getByCategory(category) {
    if (dbMode === 'mongodb') {
      const docs = await models.Portfolio.find({ category }).sort({ createdAt: -1 }).lean();
      return docs.map((d) => ({ ...d, id: String(d._id) }));
    }
    const db = readJsonDB();
    return db.portfolio.filter((item) => item.category === category);
  },

  async create(data) {
    if (dbMode === 'mongodb') {
      const doc = await models.Portfolio.create(data);
      const obj = doc.toObject();
      return { ...obj, id: String(obj._id) };
    }
    const db = readJsonDB();
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.portfolio.push(newItem);
    writeJsonDB(db);
    return newItem;
  },

  async update(id, data) {
    if (dbMode === 'mongodb') {
      const doc = await models.Portfolio.findByIdAndUpdate(id, data, { new: true }).lean();
      return doc ? { ...doc, id: String(doc._id) } : null;
    }
    const db = readJsonDB();
    const index = db.portfolio.findIndex((item) => item.id === id);
    if (index === -1) return null;
    db.portfolio[index] = { ...db.portfolio[index], ...data, updatedAt: new Date().toISOString() };
    writeJsonDB(db);
    return db.portfolio[index];
  },

  async delete(id) {
    if (dbMode === 'mongodb') {
      const result = await models.Portfolio.deleteOne({ _id: id });
      return result.deletedCount > 0;
    }
    const db = readJsonDB();
    const index = db.portfolio.findIndex((item) => item.id === id);
    if (index === -1) return false;
    db.portfolio.splice(index, 1);
    writeJsonDB(db);
    return true;
  }
};

const messagesDB = {
  async getAll() {
    if (dbMode === 'mongodb') {
      const docs = await models.Message.find({}).sort({ createdAt: -1 }).lean();
      return docs.map((d) => ({ ...d, id: String(d._id) }));
    }
    const db = readJsonDB();
    return db.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(data) {
    if (dbMode === 'mongodb') {
      const doc = await models.Message.create(data);
      const obj = doc.toObject();
      return { ...obj, id: String(obj._id) };
    }
    const db = readJsonDB();
    const newMessage = {
      id: uuidv4(),
      ...data,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.messages.push(newMessage);
    writeJsonDB(db);
    return newMessage;
  },

  async markAsRead(id) {
    if (dbMode === 'mongodb') {
      const doc = await models.Message.findByIdAndUpdate(id, { read: true }, { new: true }).lean();
      return doc ? { ...doc, id: String(doc._id) } : null;
    }
    const db = readJsonDB();
    const index = db.messages.findIndex((item) => item.id === id);
    if (index === -1) return null;
    db.messages[index].read = true;
    db.messages[index].updatedAt = new Date().toISOString();
    writeJsonDB(db);
    return db.messages[index];
  },

  async delete(id) {
    if (dbMode === 'mongodb') {
      const result = await models.Message.deleteOne({ _id: id });
      return result.deletedCount > 0;
    }
    const db = readJsonDB();
    const index = db.messages.findIndex((item) => item.id === id);
    if (index === -1) return false;
    db.messages.splice(index, 1);
    writeJsonDB(db);
    return true;
  }
};

const adminDB = {
  async get() {
    if (dbMode === 'mongodb') {
      const admin = await models.Admin.findOne({}).sort({ createdAt: 1 }).lean();
      return admin ? { ...admin, id: String(admin._id) } : null;
    }
    const db = readJsonDB();
    return db.admin;
  },

  async updatePassword(hashedPassword) {
    if (dbMode === 'mongodb') {
      const admin = await models.Admin.findOneAndUpdate({}, { password: hashedPassword }, { new: true, sort: { createdAt: 1 } }).lean();
      return admin ? { ...admin, id: String(admin._id) } : null;
    }
    const db = readJsonDB();
    db.admin.password = hashedPassword;
    db.admin.updatedAt = new Date().toISOString();
    writeJsonDB(db);
    return db.admin;
  },

  async updateUsername(username) {
    if (dbMode === 'mongodb') {
      const admin = await models.Admin.findOneAndUpdate({}, { username }, { new: true, sort: { createdAt: 1 } }).lean();
      return admin ? { ...admin, id: String(admin._id) } : null;
    }
    const db = readJsonDB();
    db.admin.username = username;
    db.admin.updatedAt = new Date().toISOString();
    writeJsonDB(db);
    return db.admin;
  }
};

const settingsDB = {
  async get() {
    if (dbMode === 'mongodb') {
      const settings = await models.Settings.findOne({}).sort({ createdAt: 1 }).lean();
      return settings || defaultDB.settings;
    }
    const db = readJsonDB();
    return db.settings;
  },

  async update(data) {
    if (dbMode === 'mongodb') {
      const settings = await models.Settings.findOneAndUpdate({}, { $set: data }, {
        new: true,
        upsert: true,
        sort: { createdAt: 1 }
      }).lean();
      return settings;
    }
    const db = readJsonDB();
    db.settings = { ...db.settings, ...data };
    writeJsonDB(db);
    return db.settings;
  }
};

function getDBMode() {
  return dbMode;
}

export { portfolioDB, messagesDB, adminDB, settingsDB, initDB, getDBMode };
