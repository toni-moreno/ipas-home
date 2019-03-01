-- cd ~/ipas-home
-- cat conf/insert_dbmap.sql |sqlite3 conf/ipashome.db

delete from platform_engines where id='LAN';
insert into platform_engines 
  (id,engineid,lab_svc_id,tst_svc_id,pre_svc_id,pro_svc_id)
values
  ('LAN',                     --id
   'snmpcollector',               --engineid
   'SnmpCollectorPRO',           --lab_svc_id
   'SnmpCollectorPRO',           --tst_svc_id
   'SnmpCollectorPRO',           --pre_svc_id
   'SnmpCollectorPRO');          --pro_svc_id

delete from platform_engines where id='TELEGRAF';
insert into platform_engines 
  (id,engineid,lab_svc_id,tst_svc_id,pre_svc_id,pro_svc_id)
values
  ('TELEGRAF',                     --id
   'telegraf',               --engineid
   'InfluxDBPRO',           --lab_svc_id
   'InfluxDBPRO',           --tst_svc_id
   'InfluxDBPRO',           --pre_svc_id
   'InfluxDBPRO');          --pro_svc_id

delete from platform_engines where id='WAN';
insert into platform_engines 
  (id,engineid,lab_svc_id,tst_svc_id,pre_svc_id,pro_svc_id)
values
  ('WAN',                     --id
   'snmpcollector',               --engineid
   'SnmpCollectorPRO',           --lab_svc_id
   'SnmpCollectorPRO',           --tst_svc_id
   'SnmpCollectorPRO',           --pre_svc_id
   'SnmpCollectorPRO');          --pro_svc_id

delete from platform_engines where id='GRAFANA';
insert into platform_engines 
  (id,engineid,lab_svc_id,tst_svc_id,pre_svc_id,pro_svc_id)
values
  ('GRAFANA',                     --id
   'grafana',               --engineid
   'GrafanaPRO',           --lab_svc_id
   'GrafanaPRO',           --tst_svc_id
   'GrafanaPRO',           --pre_svc_id
   'GrafanaPRO');          --pro_svc_id


delete from platform_engines where id='RESISTOR';
insert into platform_engines 
  (id,engineid,lab_svc_id,tst_svc_id,pre_svc_id,pro_svc_id)
values
  ('RESISTOR',                     --id
   'resistor',               --engineid
   'ResistorPRO',           --lab_svc_id
   'ResistorPRO',           --tst_svc_id
   'ResistorPRO',           --pre_svc_id
   'ResistorPRO');          --pro_svc_id
