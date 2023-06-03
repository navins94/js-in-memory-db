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
  }

  insert(recordData) {
    const record = new Record(recordData);
    this.records.push(record);
  }

  find(query) {
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
    });
  }

  delete(query) {
    const foundRecords = this.find(query);
    foundRecords.forEach((record) => {
      const index = this.records.indexOf(record);
      if (index !== -1) {
        this.records.splice(index, 1);
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
