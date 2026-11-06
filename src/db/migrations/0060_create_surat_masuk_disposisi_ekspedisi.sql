CREATE TABLE `incoming_letter_dispositions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `incoming_letter_id` int NOT NULL,
  `to_user_id` varchar(255),
  `to_role` varchar(50),
  `instruction` varchar(255) NOT NULL,
  `due_date` varchar(10),
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `note` varchar(255),
  `dispatched_by` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `incoming_letter_dispositions_id` PRIMARY KEY(`id`),
  CONSTRAINT `incoming_letter_dispositions_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `ild_incoming_letter_id_fk` FOREIGN KEY (`incoming_letter_id`) REFERENCES `incoming_letters`(`id`) ON DELETE CASCADE,
  CONSTRAINT `ild_to_user_id_fk` FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `outgoing_letter_shipments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `outgoing_letter_id` int NOT NULL,
  `sent_date` varchar(10) NOT NULL,
  `recipient` varchar(150),
  `delivery_method` varchar(50),
  `tracking_no` varchar(50),
  `note` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `outgoing_letter_shipments_id` PRIMARY KEY(`id`),
  CONSTRAINT `outgoing_letter_shipments_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE,
  CONSTRAINT `ols_outgoing_letter_id_fk` FOREIGN KEY (`outgoing_letter_id`) REFERENCES `outgoing_letters`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `letter_agenda_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `village_id` int NOT NULL,
  `type` varchar(20) NOT NULL,
  `letter_id` int NOT NULL,
  `action` varchar(50) NOT NULL,
  `note` varchar(255),
  `actor_id` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `letter_agenda_logs_id` PRIMARY KEY(`id`),
  CONSTRAINT `letter_agenda_logs_village_id_villages_id_fk` FOREIGN KEY (`village_id`) REFERENCES `villages`(`id`) ON DELETE CASCADE
);
