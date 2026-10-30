ALTER TABLE `pendapat` ADD `session_key` varchar(64),
ADD CONSTRAINT `pendapat_village_session_uq` UNIQUE (`village_id`, `session_key`);