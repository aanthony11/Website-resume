CREATE TABLE IF NOT EXISTS `network` (
`vlog_id`         int(11)  	    NOT NULL auto_increment	  COMMENT 'the id of this leaderboard',
`email`             	 varchar(100)   NOT NULL                  COMMENT 'the user that played',
`name`        			 varchar(100)	    DEFAULT NULL              COMMENT 'the score of the game',
`upload_date`			 date 	        DEFAULT NULL            		  COMMENT 'the start time of the game',
PRIMARY KEY (`vlog_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT="Contains vlog network informatino";