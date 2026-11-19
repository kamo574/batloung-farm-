-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: batloung_farm
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `fruits`
--

DROP TABLE IF EXISTS `fruits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fruits` (
  `fruit_id` int NOT NULL AUTO_INCREMENT,
  `fruit_name` enum('Apples','Bananas','Oranges','Mangoes','Grapes') NOT NULL,
  `description` text,
  `status` enum('Available','Out of Stock','Discontinued') DEFAULT 'Available',
  PRIMARY KEY (`fruit_id`),
  UNIQUE KEY `fruit_name` (`fruit_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fruits`
--

LOCK TABLES `fruits` WRITE;
/*!40000 ALTER TABLE `fruits` DISABLE KEYS */;
INSERT INTO `fruits` VALUES (1,'Apples','Fresh red apples','Available'),(2,'Bananas','Yellow ripe bananas','Available'),(3,'Oranges','Sweet oranges','Available'),(4,'Mangoes','Juicy mangoes','Available'),(5,'Grapes','Green seedless grapes','Available');
/*!40000 ALTER TABLE `fruits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_details`
--

DROP TABLE IF EXISTS `purchase_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_details` (
  `purchase_detail_id` int NOT NULL AUTO_INCREMENT,
  `purchase_id` int NOT NULL,
  `fruit_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `packaging_size` enum('Small','Medium','Large') NOT NULL,
  PRIMARY KEY (`purchase_detail_id`),
  KEY `purchase_id` (`purchase_id`),
  KEY `fruit_id` (`fruit_id`),
  CONSTRAINT `purchase_details_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_details_ibfk_2` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`fruit_id`),
  CONSTRAINT `purchase_details_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `purchase_details_chk_2` CHECK ((`unit_cost` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_details`
--

LOCK TABLES `purchase_details` WRITE;
/*!40000 ALTER TABLE `purchase_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `purchase_id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `purchase_date` date NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`purchase_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `sale_date` date NOT NULL,
  `payment_status` enum('PAID','PARTIALLY_PAID','UNPAID') DEFAULT 'UNPAID',
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `payment_method` enum('Cash','Mobile Money','Credit') NOT NULL,
  PRIMARY KEY (`sale_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,1,'2026-11-19','PAID',230.00,230.00,'Cash');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_details`
--

DROP TABLE IF EXISTS `sales_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_details` (
  `sale_detail_id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `fruit_id` int NOT NULL,
  `packaging_size` enum('Small','Medium','Large') NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`sale_detail_id`),
  KEY `sale_id` (`sale_id`),
  KEY `fruit_id` (`fruit_id`),
  CONSTRAINT `sales_details_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`sale_id`) ON DELETE CASCADE,
  CONSTRAINT `sales_details_ibfk_2` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`fruit_id`),
  CONSTRAINT `sales_details_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `sales_details_chk_2` CHECK ((`unit_price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_details`
--

LOCK TABLES `sales_details` WRITE;
/*!40000 ALTER TABLE `sales_details` DISABLE KEYS */;
INSERT INTO `sales_details` VALUES (1,1,1,'Small',1,50.00),(2,1,1,'Medium',2,90.00);
/*!40000 ALTER TABLE `sales_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `fruit_id` int NOT NULL,
  `packaging_size` enum('Small','Medium','Large') NOT NULL,
  `available_quantity` int DEFAULT '0',
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `unique_stock` (`fruit_id`,`packaging_size`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`fruit_id`) REFERENCES `fruits` (`fruit_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_chk_1` CHECK ((`available_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (1,1,'Small',49),(2,1,'Medium',28),(3,1,'Large',10),(4,2,'Small',100),(5,2,'Medium',50),(6,2,'Large',20),(7,3,'Small',80),(8,3,'Medium',40),(9,3,'Large',15),(10,4,'Small',60),(11,4,'Medium',25),(12,4,'Large',5),(13,5,'Small',40),(14,5,'Medium',20),(15,5,'Large',8);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `business_name` varchar(100) NOT NULL,
  `contact_person` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `province` enum('Gauteng','Free State','KwaZulu-Natal','Western Cape','Eastern Cape','Limpopo','Mpumalanga','North West') NOT NULL,
  `address` varchar(255) NOT NULL,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Gauteng Fresh Produce','John Doe','0111234567','Gauteng','Johannesburg Market'),(2,'Free State Farms','Jane Smith','0519876543','Free State','Bloemfontein Farm'),(3,'KZN Agri','Mike Johnson','0315551234','KwaZulu-Natal','Durban Port'),(4,'Western Cape Fruits','Sarah Lee','0214445678','Western Cape','Cape Town Vineyards');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `vendor_id` int NOT NULL AUTO_INCREMENT,
  `vendor_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `location` varchar(100) NOT NULL,
  `registration_date` date NOT NULL,
  `outstanding_balance` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,'Maseru Street Vendors','63001234','Maseru','2026-01-15',0.00),(2,'Teyateyaneng Retail','58005678','Teyateyaneng','2026-02-20',0.00),(3,'Mafeteng Traders','62009876','Mafeteng','2026-03-10',0.00),(4,'Leribe Market','59004321','Leribe','2026-04-05',0.00);
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-19 12:40:36
