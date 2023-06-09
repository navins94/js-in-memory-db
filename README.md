# In-Memory Database

This JavaScript module implements a simple in-memory database system. It's designed for small-scale applications and development purposes where persisting data to a physical database is not required.

## Classes

This system is composed of three primary classes:

- **Record**: Represents a single record in a database table.
- **Table**: Represents a database table, holding multiple records and managing indexes.
- **Database**: Represents the entire database holding multiple tables, and manages transactions.

### Class Features

#### Record

A Record represents a single entry in a table. Each Record instance contains:

- `data`: The actual data of the record.
- `isNew`: A boolean representing whether the record is newly inserted or updated.

#### Table

A Table represents a collection of Records, and supports basic operations including:

- `insert`: Inserts a new record into the table.
- `find`: Finds records matching a query object.
- `update`: Updates records matching a query object.
- `delete`: Deletes records matching a query object.
- `getAll`: Returns all records.
- `filter`: Filters records based on a predicate function.

#### Database

A Database represents the entire database. It holds multiple Tables and supports operations such as:

- `createTable`: Creates a new table.
- `getTable`: Gets a table by name.
- `dropTable`: Deletes a table by name.
- `close`: Closes the database.
- `insert`: Inserts a new record into a table.

## Usage

To use this module, first import it:

```javascript
const { Database, Table, Record } = require("./db.js");

// Create a new database and a table:
const db = new Database();
db.createTable("users", ["name", "email"]);

// Insert a new record:
db.insert("users", { name: "Alice", email: "alice@example.com" });

// Find, update, and delete operations can be performed similarly:
const users = db.getTable("users");
const alice = users.find({ name: "Alice" });
users.update({ name: "Alice" }, { email: "newAlice@example.com" });
users.delete({ email: "newAlice@example.com" });

// Close the database when you're done
db.close();
```

## Indexing

In order to speed up find operations, you can create an index on a field. To create an index:

```javascript
//This will create an index on the email field, speeding up any subsequent find operations involving the email field:
users.createIndex("email");

// Any changes made to a record's indexed field will automatically update the index:
const alicesEmail = users.find({ email: "alice@example.com" });

users.update({ name: "Alice" }, { email: "aliceNew@example.com" });
const alicesNewEmail = users.find({ email: "aliceNew@example.com" }); // This will be faster than before

//When a record is deleted, its entry in the index is also removed:
users.delete({ email: "aliceNew@example.com" });
const deletedUser = users.find({ email: "aliceNew@example.com" }); // This will return an empty array as the user has been deleted
```

## Transactions

The Database class supports transactions, which allow you to make a group of changes that can be committed all at once, or rolled back if something goes wrong. To use transactions, use the `beginTransaction`, `commit`, and `rollback` methods.

```javascript
db.beginTransaction();

try {
  db.insert("users", { name: "Alice", email: "alice@example.com" });
  db.insert("users", { name: "Bob", email: "bob@example.com" });

  // If everything is okay, commit the changes
  db.commit();
} catch (error) {
  // If something went wrong, rollback the changes
  db.rollback();
}

//In this example, if an error occurs when inserting either Alice or Bob, neither will be inserted, and the database will remain in its original state.
```

## Note

This is an in-memory database, and data will not persist when the application is closed. It's primarily for development purposes and not suitable for production use.
