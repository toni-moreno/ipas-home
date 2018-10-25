create database ipashome;
GRANT USAGE ON `ipashome`.* to 'ipashomeuser'@'localhost' identified by 'ipashomepass';
GRANT ALL PRIVILEGES ON `ipashome`.* to 'ipashomeuser'@'localhost' with grant option;
flush privileges;
