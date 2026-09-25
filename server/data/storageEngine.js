import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'store.json');

// Initialize store if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    users: [],
    studentProfiles: [],
    facultyProfiles: [],
    marks: [],
    attendances: [],
    auditLogs: []
  }, null, 2), 'utf-8');
}

export class LocalCollection {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  _readAll() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return [];
      }
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return data[this.collectionName] || [];
    } catch (e) {
      return [];
    }
  }

  _writeAll(items) {
    let data = {};
    try {
      if (fs.existsSync(DATA_FILE)) {
        data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      }
    } catch (e) {
      data = {};
    }
    data[this.collectionName] = items;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  _matchesQuery(item, query = {}) {
    if (query.$or && Array.isArray(query.$or)) {
      return query.$or.some(subQuery => this._matchesQuery(item, subQuery));
    }
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id' || key === 'id') {
        const itemId = item._id || item.id;
        if (itemId !== val && String(itemId) !== String(val)) return false;
      } else if (typeof val === 'object' && val !== null) {
        if (val.$in && Array.isArray(val.$in)) {
          if (!val.$in.map(String).includes(String(item[key]))) return false;
        } else if (val.$ne !== undefined) {
          if (item[key] === val.$ne) return false;
        } else if (val.$gte !== undefined || val.$gt !== undefined || val.$lte !== undefined || val.$lt !== undefined) {
          const itemVal = (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt' || val.$gte instanceof Date || val.$gt instanceof Date || val.$lte instanceof Date || val.$lt instanceof Date)
            ? new Date(item[key] || 0).getTime()
            : item[key];
          
          if (val.$gte !== undefined) {
            const cmp = val.$gte instanceof Date ? val.$gte.getTime() : (new Date(val.$gte).getTime() || val.$gte);
            if (itemVal < cmp) return false;
          }
          if (val.$gt !== undefined) {
            const cmp = val.$gt instanceof Date ? val.$gt.getTime() : (new Date(val.$gt).getTime() || val.$gt);
            if (itemVal <= cmp) return false;
          }
          if (val.$lte !== undefined) {
            const cmp = val.$lte instanceof Date ? val.$lte.getTime() : (new Date(val.$lte).getTime() || val.$lte);
            if (itemVal > cmp) return false;
          }
          if (val.$lt !== undefined) {
            const cmp = val.$lt instanceof Date ? val.$lt.getTime() : (new Date(val.$lt).getTime() || val.$lt);
            if (itemVal >= cmp) return false;
          }
        }
      } else {
        if (item[key] !== val) return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const items = this._readAll();
    const filtered = items.filter(item => this._matchesQuery(item, query));
    
    // Provide chainable methods like sort, limit, populate, select
    const resultWrapper = (arr) => {
      const res = [...arr];
      res.sort = function(sortObj) {
        if (!sortObj) return res;
        for (const [key, order] of Object.entries(sortObj)) {
          res.sort((a, b) => {
            let valA = a[key];
            let valB = b[key];
            if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt' || valA instanceof Date || valB instanceof Date) {
              valA = new Date(valA).getTime();
              valB = new Date(valB).getTime();
            }
            if (valA < valB) return order === 1 || order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 1 || order === 'asc' ? 1 : -1;
            return 0;
          });
        }
        return resultWrapper(res);
      };
      res.limit = function(num) {
        return resultWrapper(res.slice(0, num));
      };
      res.populate = function() {
        return resultWrapper(res);
      };
      res.select = function() {
        return resultWrapper(res);
      };
      return res;
    };

    return resultWrapper(filtered);
  }

  async findOne(query = {}) {
    const items = this._readAll();
    const item = items.find(item => this._matchesQuery(item, query)) || null;
    if (item) {
      item.select = () => item;
      item.populate = () => item;
    }
    return item;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(doc) {
    const items = this._readAll();
    const now = new Date();
    const newDoc = {
      _id: doc._id || crypto.randomUUID(),
      ...doc,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now
    };
    items.push(newDoc);
    this._writeAll(items);
    return newDoc;
  }

  async insertMany(docs) {
    const created = [];
    for (const doc of docs) {
      created.push(await this.create(doc));
    }
    return created;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const items = this._readAll();
    const index = items.findIndex(item => (item._id === id || String(item._id) === String(id)));
    if (index === -1) return null;

    const current = items[index];
    const updated = {
      ...current,
      ...updateData,
      updatedAt: new Date()
    };
    items[index] = updated;
    this._writeAll(items);
    return options.new ? updated : current;
  }

  async deleteOne(query = {}) {
    const items = this._readAll();
    const index = items.findIndex(item => this._matchesQuery(item, query));
    if (index !== -1) {
      items.splice(index, 1);
      this._writeAll(items);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query = {}) {
    const items = this._readAll();
    if (Object.keys(query).length === 0) {
      this._writeAll([]);
      return { deletedCount: items.length };
    }
    const remaining = items.filter(item => !this._matchesQuery(item, query));
    const deletedCount = items.length - remaining.length;
    this._writeAll(remaining);
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }
}
