const { Database } = require("./db");

describe("Database", () => {
  let db;

  beforeEach(() => {
    db = new Database();
    db.createTable("users", ["id", "name", "email"]);
  });

  it("should allow inserting records", () => {
    db.insert("users", { id: 1, name: "John", email: "john@example.com" });
    const usersTable = db.getTable("users");
    const records = usersTable.getAll();
    expect(records.length).toEqual(1);
    expect(records[0].data).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
    });
  });

  it("should find records based on a query", () => {
    db.insert("users", { id: 1, name: "John", email: "john@example.com" });
    const usersTable = db.getTable("users");
    const johnRecords = usersTable.find({ name: "John" });
    expect(johnRecords.length).toEqual(1);
    expect(johnRecords[0].data).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
    });
  });

  it("should update records based on a query", () => {
    db.insert("users", { id: 1, name: "John", email: "john@example.com" });
    const usersTable = db.getTable("users");
    usersTable.update(
      { id: 1 },
      { name: "John Doe", email: "johndoe@example.com" }
    );
    const updatedRecord = usersTable.find({ id: 1 })[0];
    expect(updatedRecord.data).toEqual({
      id: 1,
      name: "John Doe",
      email: "johndoe@example.com",
    });
  });

  it("should delete records based on a query", () => {
    db.insert("users", { id: 1, name: "John", email: "john@example.com" });
    const usersTable = db.getTable("users");
    usersTable.delete({ id: 1 });
    const records = usersTable.getAll();
    expect(records.length).toEqual(0);
  });

  it("should not allow operations after close", () => {
    db.close();

    expect(() =>
      db.insert("users", { id: 1, name: "John", email: "john@example.com" })
    ).toThrowError("Cannot perform operations on a closed database.");
  });
});