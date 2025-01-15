-- First, drop existing objects
DROP VIEW IF EXISTS OrderDetailView;
DROP TABLE IF EXISTS MerchantAttachment;
DROP TABLE IF EXISTS Blacklist;
DROP TABLE IF EXISTS Comment;
DROP TABLE IF EXISTS Complaint;
DROP TABLE IF EXISTS OrderDetail;
DROP TABLE IF EXISTS Dish;
DROP TABLE IF EXISTS MealOrder;
DROP TABLE IF EXISTS Merchant;
DROP TABLE IF EXISTS DiningHall;
DROP TABLE IF EXISTS User;

-- First, create tables with no foreign keys
CREATE TABLE User (
    user_id INT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(20) NOT NULL,
    college VARCHAR(20) NOT NULL,
    contact VARCHAR(30) NOT NULL,
    grade INT NOT NULL,
    type INT NOT NULL DEFAULT 0
);

CREATE TABLE DiningHall (
    dininghall_no INT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    position VARCHAR(50) NOT NULL,
    likes INT DEFAULT 0,
    hates INT DEFAULT 0
);

-- Then create Merchant which depends on DiningHall
CREATE TABLE Merchant (
    merchant_no INT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description VARCHAR(100) NOT NULL,
    likes INT DEFAULT 0,
    hates INT DEFAULT 0,
    phone VARCHAR(30) NOT NULL,
    dininghall_no INT,
    password VARCHAR(255) NOT NULL,
    status ENUM('待审核', '已通过', '已拒绝') NOT NULL DEFAULT '待审核',
    FOREIGN KEY (dininghall_no) REFERENCES DiningHall(dininghall_no)
);

-- Then create MealOrder which depends on User and Merchant
CREATE TABLE MealOrder (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('早餐', '午餐', '晚餐') NOT NULL,
    buyer_position VARCHAR(50) NOT NULL,
    tips INT DEFAULT 0,
    buyer_id INT,
    deliverer_id INT,
    merchant_no INT,
    delivery_time TIMESTAMP NULL,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('未支付', '已支付') DEFAULT '未支付',
    delivery_status ENUM('配送中', '已送达') DEFAULT NULL,
    FOREIGN KEY (buyer_id) REFERENCES User(user_id),
    FOREIGN KEY (deliverer_id) REFERENCES User(user_id),
    FOREIGN KEY (merchant_no) REFERENCES Merchant(merchant_no)
);

-- Then create Dish which depends on Merchant
CREATE TABLE Dish (
    dishno INT PRIMARY KEY auto_increment,
    dishname VARCHAR(50) NOT NULL,
    dishtype VARCHAR(20),
    price FLOAT NOT NULL,
    description TEXT,
    quantity INT NOT NULL DEFAULT 0,
    merchant_no INT,
    FOREIGN KEY (merchant_no) REFERENCES Merchant(merchant_no)
);

-- Then create tables that depend on MealOrder
CREATE TABLE OrderDetail (
    order_id INT,
    dish_id INT,
    quantity INT NOT NULL DEFAULT 1,
    note VARCHAR(100),                    -- 备注（比如：不要辣、少盐等）
    PRIMARY KEY (order_id, dish_id),      -- 联合主键
    FOREIGN KEY (order_id) REFERENCES MealOrder(order_id),
    FOREIGN KEY (dish_id) REFERENCES Dish(dishno)
);

CREATE TABLE Complaint (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    complainant_id INT NOT NULL,          -- 投诉人ID（买家）
    complaint_type ENUM('配送延迟', '态度恶劣', '商品损坏', '未按要求配送', '其他') NOT NULL,
    reason TEXT NOT NULL,                 -- 投诉详细说明
    evidence TEXT,                        -- 证据说明（可选）
    status ENUM('待处理', '已处理', '已驳回') NOT NULL DEFAULT '待处理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES MealOrder(order_id),
    FOREIGN KEY (complainant_id) REFERENCES User(user_id)
);

CREATE TABLE Comment (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    merchant_no INT NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),  -- 评分范围1-5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (merchant_no) REFERENCES Merchant(merchant_no)
);

CREATE TABLE MerchantAttachment (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    merchant_no INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_content MEDIUMBLOB NOT NULL,  -- 最大可存储16MB的文件
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_no) REFERENCES Merchant(merchant_no) ON DELETE CASCADE
);

CREATE TABLE Blacklist (
    blacklist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date DATE,                        -- 失信记录结束日期，NULL表示永久
    status ENUM('有效', '已失效') DEFAULT '有效',
    created_by INT NOT NULL,              -- 创建该记录的管理员ID
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (created_by) REFERENCES User(user_id)
);

-- 插入食堂数据
INSERT INTO DiningHall (dininghall_no, name, position) VALUES
(1, '荔园美食汇', '荔园区域一楼'),
(2, '听山餐厅', '听山区域二楼'),
(3, '荔天餐厅', '荔园区域三楼'),
(4, '伐木餐厅', '伐木区域一楼');