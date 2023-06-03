const _ = require("lodash");

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

  getAll() {
    return this.records;
  }

  filter(predicate) {
    return this.records.filter(predicate);
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
}

class Database {
  constructor() {
    this.tables = new Map();
    this.transactionStack = [];
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

  beginTransaction() {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    const snapshot = _.cloneDeep(Array.from(this.tables));
    this.transactionStack.push(snapshot);
  }

  commit() {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    if (this.transactionStack.length === 0) {
      throw new Error("No transaction to commit.");
    }

    this.transactionStack.pop();
  }

  rollback() {
    if (this.isClosed) {
      throw new Error("Cannot perform operations on a closed database.");
    }

    if (this.transactionStack.length > 0) {
      this.tables = new Map(
        _.cloneDeep(this.transactionStack[this.transactionStack.length - 1])
      );
    } else {
      throw new Error("No transaction to rollback.");
    }
  }

  close() {
    this.tables.clear();
    this.transactionStack = [];
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
