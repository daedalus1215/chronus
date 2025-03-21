-- SQLite
.open ../db.sqlite

-- Check available tables
.tables

-- Query the user table (note: the table name is 'user' not 'users')
SELECT * FROM user;
SELECT * FROM migrations;