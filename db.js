class Record {
  constructor(data) {
    this.data = data;
    this.isNew = true; // Track if the record is newly inserted or updated
  }
}

class Table {
  constructor(name, columns) {
    this.name = name;
    this.columns = columns;
    this.records = [];
    this.indexes = {}; // Track indexes by field name
  }

  insert(recordData) {
    const record = new Record(recordData);
    this.records.push(record);
    this.updateIndexes(record);
  }

  find(query) {
    const indexField = Object.keys(query)[0];
    if (this.indexes[indexField]) {
      return this.indexes[indexField][query[indexField]] || [];
    }

    return this.records.filter((record) => {
      for (let key in query) {
        if (record.data[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  update(query, updates) {
    const foundRecords = this.find(query);
    foundRecords.forEach((record) => {
      Object.assign(record.data, updates);
      record.isNew = false; // Mark the record as updated
      this.updateIndexes(record); // update index on update
    });
  }

  delete(query) {
    const foundRecords = this.find(query);
    foundRecords.forEach((record) => {
      const index = this.records.indexOf(record);
      if (index !== -1) {
        this.records.splice(index, 1);
        this.updateIndexes(record, true); // indicate deletion in updateIndexes
      }
      record.isNew = false; // Mark the record as not new
    });
  }

  createIndex(field) {
    if (!this.indexes[field]) {
      this.indexes[field] = {};

      this.records.forEach((record) => {
        const value = record.data[field];
        if (!this.indexes[field][value]) {
          this.indexes[field][value] = [];
        }
        this.indexes[field][value].push(record);
      });
    }
  }

  updateIndexes(record, isDelete = false) {
    for (let field in this.indexes) {
      const value = record.data[field];
      if (isDelete) {
        const indexInField = this.indexes[field][value].indexOf(record);
        if (indexInField !== -1) {
          this.indexes[field][value].splice(indexInField, 1);
        }
      } else {
        if (!this.indexes[field][value]) {
          this.indexes[field][value] = [];
        }
        this.indexes[field][value].push(record);
      }
    }
  }

  getAll() {
    return this.records;
  }

  filter(predicate) {
    return this.records.filter(predicate);
  }
}

class Database {
  constructor() {
    this.tables = new Map();
    this.isClosed = false;
  }

  createTable(tableName, columns) {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    if (this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' already exists.`);
    }

    const table = new Table(tableName, columns);
    this.tables.set(tableName, table);
  }

  getTable(tableName) {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }
    return table;
  }

  dropTable(tableName) {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    this.tables.delete(tableName);
  }

  close() {
    this.tables.clear();
    this.isClosed = true;
  }

  insert(tableName, recordData) {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    const table = this.tables.get(tableName);
    if (!table) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    const record = {};
    for (const columnName of table.columns) {
      if (recordData.hasOwnProperty(columnName)) {
        record[columnName] = recordData[columnName];
      } else {
        throw new Error(`Missing required field '${columnName}'.`);
      }
    }

    table.insert(record);
  }
}

module.exports = {
  Database,
  Table,
  Record,
};
