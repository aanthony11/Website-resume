CREATE TABLE IF NOT EXISTS `wordle` (
`wordle_id`         int(11)  	   NOT NULL auto_increment	  COMMENT 'the id of this user',
`email`             varchar(100)   NOT NULL                   COMMENT 'the role of the user; options include: owner and guest',
`game_start`        date 		   NOT NULL            		  COMMENT 'the start of the game',
`game_end`          date 		   DEFAULT NULL               COMMENT 'the end of the game',
`game_won`			varchar(100)   DEFAULT NULL				  COMMENT 'if the user won the game of the day',
PRIMARY KEY (`wordle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Contains wordle game informatino";