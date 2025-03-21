-- SQLite
.open ../db.sqlite

-- Check available tables
.tables

-- Query the user table (note: the table name is 'user' not 'users')
select * from user;


select * FROM memos;
select * FROM migrations;
select * FROM notes;