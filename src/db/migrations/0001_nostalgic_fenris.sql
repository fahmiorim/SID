CREATE TABLE `tweb_wil_clusterdesa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_id` int NOT NULL,
	`dusun` varchar(100),
	`rw` varchar(10),
	`rt` varchar(10),
	`id_kepala` int,
	`lat` varchar(30),
	`lng` varchar(30),
	`zoom` int,
	`path` text,
	`map_tipe` varchar(30),
	`warna` varchar(30),
	`border` varchar(30),
	`urut` int DEFAULT 0,
	`urut_cetak` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tweb_wil_clusterdesa_id` PRIMARY KEY(`id`),
	CONSTRAINT `wilayah_config_dusun_rw_rt_uq` UNIQUE(`config_id`,`dusun`,`rw`,`rt`)
);
--> statement-breakpoint
ALTER TABLE `tweb_wil_clusterdesa` ADD CONSTRAINT `tweb_wil_clusterdesa_config_id_config_id_fk` FOREIGN KEY (`config_id`) REFERENCES `config`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `wilayah_config_urut_idx` ON `tweb_wil_clusterdesa` (`config_id`,`urut`);