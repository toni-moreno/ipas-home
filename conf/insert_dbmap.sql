-- cd ~/ipas-home
-- cat conf/insert_dbmap.sql |sqlite3 conf/ipashome.db

delete from influx_cfg where id='_kapacitor';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('_kapacitor',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   '_kapacitor',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '30',                    --retentiontime
   '1',                     --sharding
   'DB for product kapacitor');     --description


delete from product_db_map where id='kapacitor';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('kapacitor',
   '_kapacitor',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='_influxdb';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('_influxdb',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   '_influxdb',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '30',                    --retentiontime
   '1',                     --sharding
   'DB for product influxdb');     --description


delete from product_db_map where id='influxdb';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('influxdb',
   '_influxdb',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='_telegraf';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('_telegraf',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   '_telegraf',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '30',                    --retentiontime
   '1',                     --sharding
   'DB for product telegraf');     --description


delete from product_db_map where id='telegraf';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('telegraf',
   '_telegraf',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='_snmpcollector';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('_snmpcollector',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   '_snmpcollector',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '30',                    --retentiontime
   '1',                     --sharding
   'DB for product snmpcollector');     --description


delete from product_db_map where id='snmpcollector';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('snmpcollector',
   '_snmpcollector',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='_resistor';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('_resistor',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   '_resistor',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '30',                    --retentiontime
   '1',                     --sharding
   'DB for product resistor');     --description


delete from product_db_map where id='resistor';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('resistor',
   '_resistor',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='_sqlcollector';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('_sqlcollector',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   '_sqlcollector',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '30',                    --retentiontime
   '1',                     --sharding
   'DB for product sqlcollector');     --description


delete from product_db_map where id='sqlcollector';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('sqlcollector',
   '_sqlcollector',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='ms_anomalies';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('ms_anomalies',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'ms_anomalies',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '1',                     --sharding
   'DB for product ml');     --description


delete from product_db_map where id='ml';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('ml',
   'ms_anomalies',
   '',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='apache_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('apache_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'apache_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product apache');     --description


delete from product_db_map where id='apache';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('apache',
   'apache_metrics',
   'ap_t1,ap_t2,_ap_t3',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='snmp_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('snmp_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'snmp_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product checkpoint');     --description


delete from product_db_map where id='checkpoint';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('checkpoint',
   'snmp_metrics',
   'ch_tag1,ch_tag2,ch_tag3',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='snmp_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('snmp_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'snmp_metrics',                     --db
   'ipas_rw_user',             --user
   '3',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '',                     --sharding
   'DB for product cisco_catalyst');     --description


delete from product_db_map where id='cisco_catalyst';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('cisco_catalyst',
   'snmp_metrics',
   'c_tag1,c_tag2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='docker_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('docker_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'docker_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '90',                    --retentiontime
   '3',                     --sharding
   'DB for product docker');     --description


delete from product_db_map where id='docker';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('docker',
   'docker_metrics',
   'dkr_t1,dkr_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='snmp_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('snmp_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'snmp_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product juniper');     --description


delete from product_db_map where id='juniper';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('juniper',
   'snmp_metrics',
   'jun_tag1,jun_tag2,jun_tag3',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='snmp_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('snmp_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'snmp_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product juniper_vpn');     --description


delete from product_db_map where id='juniper_vpn';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('juniper_vpn',
   'snmp_metrics',
   'jvpn_tag1,jvpn_tag2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='cloud_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('cloud_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'cloud_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '90',                    --retentiontime
   '3',                     --sharding
   'DB for product k8s');     --description


delete from product_db_map where id='k8s';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('k8s',
   'cloud_metrics',
   'k8s_t1,k8s_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='linux_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('linux_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'linux_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product linux');     --description


delete from product_db_map where id='linux';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('linux',
   'linux_metrics',
   'l_tag1,l_tag2,l_tag3',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='msiss_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('msiss_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'msiss_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '355',                    --retentiontime
   '3',                     --sharding
   'DB for product msiss');     --description


delete from product_db_map where id='msiss';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('msiss',
   'msiss_metrics',
   'ms_t1,ms_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='mysql_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('mysql_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'mysql_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product mysql');     --description


delete from product_db_map where id='mysql';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('mysql',
   'mysql_metrics',
   'my_t1,my_t2,my_t3',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='nginx_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('nginx_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'nginx_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product nginx');     --description


delete from product_db_map where id='nginx';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('nginx',
   'nginx_metrics',
   'ng_tag1,ng_tag2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='oracle_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('oracle_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'oracle_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product oracle');     --description


delete from product_db_map where id='oracle';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('oracle',
   'oracle_metrics',
   'ora_t1,ora_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='pgsql_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('pgsql_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'pgsql_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product pgsql');     --description


delete from product_db_map where id='pgsql';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('pgsql',
   'pgsql_metrics',
   'pg_t1,pg_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='tomcat_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('tomcat_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'tomcat_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product tomcat');     --description


delete from product_db_map where id='tomcat';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('tomcat',
   'tomcat_metrics',
   't_t1,t_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='vsphere_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('vsphere_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'vsphere_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product vsphere');     --description


delete from product_db_map where id='vsphere';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('vsphere',
   'vsphere_metrics',
   'vs_t1,vs_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='was_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('was_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'was_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product was');     --description


delete from product_db_map where id='was';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('was',
   'was_metrics',
   'was_t1,was_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='win_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('win_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'win_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product windows');     --description


delete from product_db_map where id='windows';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('windows',
   'win_metrics',
   'w_tag1.w_tag2,w_tag3',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
delete from influx_cfg where id='wls_metrics';
insert into influx_cfg 
  (id,host,port,db,rwuser,rwpassword,rduser,rdpassword,retentiontime,shardingtime,description)
values
  ('wls_metrics',                     --id
   '10.0.2.15',              --host
   '8086',                           --port
   'wls_metrics',                     --db
   'ipas_rw_user',             --user
   '1p4sm0l4',         --password
   'ipas_public_user',             --rduser
   '1p4sm0l4',          --rdpassword
   '365',                    --retentiontime
   '3',                     --sharding
   'DB for product wls');     --description


delete from product_db_map where id='wls';
insert into product_db_map
  (id,database,product_tags,g_engines,v_engines,a_engines)
values
  ('wls',
   'wls_metrics',
   'wls_t1,wls_t2',
   ["SnmpCollectorPRO"],
   ["GrafanaPRO"],
   ["ResistorPRO"]);
