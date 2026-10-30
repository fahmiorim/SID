UPDATE `cdesa_rincian` AS `rincian`
JOIN `cdesa` ON `cdesa`.`id` = `rincian`.`cdesa_id`
SET `rincian`.`village_id` = `cdesa`.`village_id`;