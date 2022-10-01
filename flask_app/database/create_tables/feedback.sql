CREATE TABLE IF NOT EXISTS `feedback` (
`comment_id`   int(11)       NOT NULL AUTO_INCREMENT  COMMENT 'The comment id.',
`name`         varchar(100)  NOT NULL                 COMMENT 'The commenters name.', 
`email`        varchar(100)  NOT NULL                 COMMENT 'The commenters email.',
`comment`      varchar(300)  NOT NULL            	  COMMENT 'The text of the comment.',
PRIMARY KEY  (`comment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Insititutions I am affiliated with.";