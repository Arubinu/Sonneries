CREATE TABLE `download` (
	`hash`	VARCHAR(40) NOT NULL UNIQUE,
	`date`	DATETIME,
	`count`	INTEGER NOT NULL DEFAULT 0
);
