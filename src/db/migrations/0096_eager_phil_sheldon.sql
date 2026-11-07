CREATE TABLE `rate_limit_entries` (
	`key_hash` varchar(64) NOT NULL,
	`request_times` json NOT NULL,
	`expires_at` bigint NOT NULL,
	CONSTRAINT `rate_limit_entries_key_hash` PRIMARY KEY(`key_hash`)
);
--> statement-breakpoint
CREATE INDEX `rate_limit_entries_expires_idx` ON `rate_limit_entries` (`expires_at`);