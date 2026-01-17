CREATE TABLE Medicine (
    MedicineID     INTEGER PRIMARY KEY AUTOINCREMENT,
    Name           TEXT NOT NULL,
    Type           TEXT,
    Price          REAL CHECK (Price >= 0),
    Manufacturer   TEXT,
    ExpiryDate     DATE
);