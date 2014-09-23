/*
MySQL Data Transfer
Source Host: localhost
Source Database: message_test
Target Host: localhost
Target Database: message_test
Date: 2014/3/11 22:49:42
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for message
-- ----------------------------
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time` varchar(225) NOT NULL,
  `status` tinyint(255) DEFAULT NULL,
  `type` tinyint(255) NOT NULL,
  `deleted` tinyint(4) DEFAULT NULL,
  `content` varchar(1024) DEFAULT NULL,
  `sendPerson` varchar(255) NOT NULL,
  `receivePerson` varchar(255) NOT NULL,
  `isShowMessage` varchar(255) NOT NULL DEFAULT 'false',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for users
-- ----------------------------
CREATE TABLE `users` (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records 
-- ----------------------------
INSERT INTO `users` VALUES ('1000', 'circle', '123456', '2014-03-11 20:28:49');
INSERT INTO `users` VALUES ('1001', 'duobei', 'duobei', '2014-03-11 20:29:08');
